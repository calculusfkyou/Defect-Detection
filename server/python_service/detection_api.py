from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import os
import base64
import tempfile
import shutil
import uuid
import time
import cv2
import numpy as np
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import io

app = FastAPI(title="PCB Defect Detection API", version="1.0.0")

# 配置
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "model", "best.onnx")
TEMP_DIR = os.path.join(os.path.dirname(__file__), "temp")
IMG_SIZE = 640
DEVICE = 0

# 確保臨時目錄存在
os.makedirs(TEMP_DIR, exist_ok=True)

# 載入模型
model = None
try:
    if os.path.exists(MODEL_PATH):
        print(f"🔍 正在載入模型: {MODEL_PATH}")
        model = YOLO(MODEL_PATH, task='detect')
        print(f"✅ 模型載入成功!")
        print(f"📊 模型類別: {model.names}")
    else:
        print(f"❌ 模型文件不存在: {MODEL_PATH}")
except Exception as e:
    print(f"❌ 模型載入失敗: {e}")
    model = None

def create_defect_thumbnail(image_path, defect_info, thumbnail_size=(150, 150)):
    """
    創建瑕疵區域的縮圖
    """
    try:
        # 讀取原始圖像
        image = cv2.imread(image_path)
        if image is None:
            print(f"❌ 無法讀取圖像: {image_path}")
            return None

        height, width = image.shape[:2]

        # 計算瑕疵區域的實際像素座標
        x_center = defect_info['xCenter'] * width
        y_center = defect_info['yCenter'] * height
        box_width = defect_info['width'] * width
        box_height = defect_info['height'] * height

        # 擴大裁切區域以包含更多上下文（擴大1.5倍）
        expand_factor = 1.5
        crop_width = int(box_width * expand_factor)
        crop_height = int(box_height * expand_factor)

        # 計算裁切區域的左上角座標
        x1 = max(0, int(x_center - crop_width / 2))
        y1 = max(0, int(y_center - crop_height / 2))
        x2 = min(width, int(x_center + crop_width / 2))
        y2 = min(height, int(y_center + crop_height / 2))

        # 確保裁切區域有效
        if x2 <= x1 or y2 <= y1:
            print(f"❌ 無效的裁切區域: ({x1}, {y1}) to ({x2}, {y2})")
            return None

        # 裁切瑕疵區域
        cropped = image[y1:y2, x1:x2]

        if cropped.size == 0:
            print(f"❌ 裁切後的圖像為空")
            return None

        # 在裁切圖像上繪製瑕疵框
        # 計算瑕疵框在裁切圖像中的相對位置
        relative_x1 = max(0, int(x_center - box_width/2) - x1)
        relative_y1 = max(0, int(y_center - box_height/2) - y1)
        relative_x2 = min(cropped.shape[1], int(x_center + box_width/2) - x1)
        relative_y2 = min(cropped.shape[0], int(y_center + box_height/2) - y1)

        # 繪製瑕疵框
        color = (0, 0, 255)  # 紅色框
        thickness = 2
        cv2.rectangle(cropped, (relative_x1, relative_y1), (relative_x2, relative_y2), color, thickness)

        # 添加標籤
        label = f"{defect_info['defectType']} {defect_info['confidence']:.2f}"
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.5
        font_thickness = 1

        # 計算文字尺寸
        (text_width, text_height), baseline = cv2.getTextSize(label, font, font_scale, font_thickness)

        # 繪製文字背景
        cv2.rectangle(cropped,
                     (relative_x1, relative_y1 - text_height - 5),
                     (relative_x1 + text_width, relative_y1),
                     color, -1)

        # 繪製文字
        cv2.putText(cropped, label,
                   (relative_x1, relative_y1 - 5),
                   font, font_scale, (255, 255, 255), font_thickness)

        # 調整到縮圖尺寸
        resized = cv2.resize(cropped, thumbnail_size, interpolation=cv2.INTER_AREA)

        # 轉換為PIL圖像以便編碼
        resized_rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
        pil_image = Image.fromarray(resized_rgb)

        # 轉換為base64
        buffer = io.BytesIO()
        pil_image.save(buffer, format='JPEG', quality=85)
        thumbnail_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

        print(f"✅ 成功創建瑕疵縮圖: {defect_info['defectType']}")
        return thumbnail_base64

    except Exception as e:
        print(f"❌ 創建瑕疵縮圖失敗: {e}")
        import traceback
        traceback.print_exc()
        return None

@app.get("/health")
async def health_check():
    return {
        "status": "healthy" if model is not None else "unhealthy",
        "model_loaded": model is not None,
        "model_path": MODEL_PATH,
        "model_exists": os.path.exists(MODEL_PATH),
        "temp_dir": TEMP_DIR,
        "device": DEVICE
    }

@app.post("/detect")
async def detect_defects(
    image: UploadFile = File(...),
    confidence_threshold: float = Form(0.5)
):
    if model is None:
        raise HTTPException(status_code=500, detail="模型未載入")

    if not 0.0 <= confidence_threshold <= 1.0:
        raise HTTPException(status_code=400, detail="置信度閾值必須在0.0到1.0之間")

    if not image.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="只接受圖像文件")

    session_id = str(uuid.uuid4())
    session_dir = os.path.join(TEMP_DIR, session_id)

    try:
        start_time = time.time()

        # 創建會話目錄
        os.makedirs(session_dir, exist_ok=True)
        print(f"📁 創建會話目錄: {session_dir}")

        # 保存上傳的圖片
        file_extension = os.path.splitext(image.filename)[1] or '.jpg'
        image_path = os.path.join(session_dir, f"input{file_extension}")

        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        print(f"💾 圖片已保存: {image_path}")

        # 設定輸出目錄
        output_dir = os.path.join(session_dir, "results")

        print(f"🔍 開始執行YOLO檢測，置信度閾值: {confidence_threshold}")

        # 執行 YOLO 預測
        results = model.predict(
            source=image_path,
            imgsz=IMG_SIZE,
            device=DEVICE,
            project=output_dir,
            conf=confidence_threshold,
            iou=0.6,
            save=True,
            save_txt=True,
            save_conf=True,
            show_labels=True,
            show_conf=True,
            boxes=True,
            task='detect'
        )

        print(f"✅ YOLO預測完成")
        print(f"📊 Results物件數量: {len(results)}")

        predict_dir = os.path.join(output_dir, "predict")
        labels_dir = os.path.join(predict_dir, "labels")

        print(f"📂 檢查輸出目錄: {predict_dir}")
        print(f"📂 檢查標籤目錄: {labels_dir}")

        # 🔧 重新命名結果圖片從 input.jpg 到 output.jpg
        original_result_path = None
        result_image_path = None

        if os.path.exists(predict_dir):
            for file in os.listdir(predict_dir):
                file_path = os.path.join(predict_dir, file)
                if file.lower().endswith(('.jpg', '.jpeg', '.png')) and not os.path.isdir(file_path):
                    original_result_path = file_path
                    # 重新命名為 output
                    new_filename = f"output{os.path.splitext(file)[1]}"
                    result_image_path = os.path.join(predict_dir, new_filename)

                    # 如果檔案名稱不同，則重新命名
                    if original_result_path != result_image_path:
                        shutil.move(original_result_path, result_image_path)
                        print(f"🔄 重新命名結果圖片: {file} -> {new_filename}")

                    print(f"🖼️ 結果圖片路徑: {result_image_path}")
                    break

        # 解析標籤文件
        defects = []
        if os.path.exists(labels_dir):
            print(f"📄 開始解析標籤文件...")

            label_files = [f for f in os.listdir(labels_dir) if f.endswith('.txt')]
            print(f"📄 找到 {len(label_files)} 個標籤文件: {label_files}")

            for label_file in label_files:
                label_path = os.path.join(labels_dir, label_file)
                print(f"📄 處理標籤文件: {label_path}")

                try:
                    with open(label_path, 'r', encoding='utf-8') as f:
                        content = f.read().strip()

                        if content:
                            lines = content.split('\n')
                            print(f"📝 找到 {len(lines)} 行檢測結果")

                            for line_num, line in enumerate(lines):
                                line = line.strip()
                                if not line:
                                    continue

                                parts = line.split()
                                if len(parts) >= 6:
                                    try:
                                        class_id = int(parts[0])
                                        x_center = float(parts[1])
                                        y_center = float(parts[2])
                                        width = float(parts[3])
                                        height = float(parts[4])
                                        confidence = float(parts[5])

                                        # 使用類別名稱
                                        defect_type = 'unknown'
                                        if hasattr(model, 'names') and model.names and class_id in model.names:
                                            defect_type = model.names[class_id]
                                        else:
                                            class_names = [
                                                'missing_hole', 'mouse_bite', 'open_circuit',
                                                'short', 'spur', 'spurious_copper'
                                            ]
                                            if class_id < len(class_names):
                                                defect_type = class_names[class_id]

                                        defect_data = {
                                            'id': len(defects) + 1,
                                            'classId': class_id,
                                            'defectType': defect_type,
                                            'xCenter': x_center,
                                            'yCenter': y_center,
                                            'width': width,
                                            'height': height,
                                            'confidence': confidence
                                        }

                                        # 🔑 生成瑕疵縮圖
                                        print(f"📸 正在生成瑕疵縮圖: {defect_type}")
                                        thumbnail_base64 = create_defect_thumbnail(image_path, defect_data)
                                        if thumbnail_base64:
                                            defect_data['thumbnail'] = thumbnail_base64
                                            print(f"✅ 縮圖生成成功")
                                        else:
                                            print(f"⚠️ 縮圖生成失敗")

                                        defects.append(defect_data)
                                        print(f"✅ 檢測到瑕疵: {defect_type} (置信度: {confidence:.4f})")

                                    except (ValueError, IndexError) as parse_error:
                                        print(f"⚠️ 解析錯誤 - 行 {line_num + 1}: {parse_error}")
                                        continue
                        else:
                            print(f"📝 標籤檔案為空: {label_path}")

                except Exception as file_error:
                    print(f"❌ 讀取標籤檔案失敗: {label_path} - 錯誤: {file_error}")
                    continue
        else:
            print(f"❌ 標籤目錄不存在: {labels_dir}")

        print(f"🎯 檢測完成: 總共 {len(defects)} 個瑕疵")

        # 讀取並編碼圖片
        result_image_base64 = None
        if result_image_path and os.path.exists(result_image_path):
            try:
                with open(result_image_path, "rb") as img_file:
                    result_image_base64 = base64.b64encode(img_file.read()).decode('utf-8')
                print(f"✅ 成功編碼結果圖片")
            except Exception as img_encode_error:
                print(f"❌ 編碼結果圖片失敗: {img_encode_error}")

        # 讀取原始圖片
        original_image_base64 = None
        try:
            with open(image_path, "rb") as img_file:
                original_image_base64 = base64.b64encode(img_file.read()).decode('utf-8')
            print(f"✅ 成功編碼原始圖片")
        except Exception as orig_img_error:
            print(f"❌ 編碼原始圖片失敗: {orig_img_error}")

        # 計算統計數據
        defect_count = len(defects)
        average_confidence = sum(d['confidence'] for d in defects) / defect_count if defect_count > 0 else 0.0
        detection_time = int((time.time() - start_time) * 1000)

        print(f"✅ 檢測完成，耗時: {detection_time}ms")

        # 構建返回數據
        response_data = {
            "success": True,
            "data": {
                "originalImage": f"data:image/jpeg;base64,{original_image_base64}" if original_image_base64 else None,
                "resultImage": f"data:image/jpeg;base64,{result_image_base64}" if result_image_base64 else None,
                "defects": defects,
                "summary": {
                    "totalDefects": defect_count,
                    "averageConfidence": round(average_confidence, 4),
                    "detectionTime": detection_time
                }
            }
        }

        print(f"🚀 返回數據: {defect_count} 個瑕疵，{sum(1 for d in defects if d.get('thumbnail')) } 個有縮圖")
        return JSONResponse(content=response_data)

    except Exception as e:
        print(f"❌ 檢測過程發生錯誤: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"檢測失敗: {str(e)}")

    finally:
        # 清理臨時文件
        if os.path.exists(session_dir):
            try:
                # shutil.rmtree(session_dir)  # 暫時註解，方便調試
                print(f"🧹 保留臨時目錄用於調試: {session_dir}")
            except Exception as cleanup_error:
                print(f"⚠️ 清理臨時目錄失敗: {cleanup_error}")

@app.get("/")
async def root():
    return {
        "message": "PCB Defect Detection API",
        "status": "running",
        "model_loaded": model is not None
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 啟動PCB瑕疵檢測API服務...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
