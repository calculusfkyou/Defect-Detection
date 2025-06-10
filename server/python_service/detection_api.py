# server/python_service/detection_api.py
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import os
import json
import base64
from pathlib import Path
import tempfile
import shutil
from typing import Optional
import uuid

app = FastAPI(title="PCB Defect Detection API")

# 配置
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "model", "best.onnx")
TEMP_DIR = os.path.join(os.path.dirname(__file__), "temp")
IMG_SIZE = 640
DEVICE = 'cpu'  # 或 'cuda' 如果有GPU

# 確保臨時目錄存在
os.makedirs(TEMP_DIR, exist_ok=True)

# 載入模型
try:
    model = YOLO(MODEL_PATH)
    print(f"模型載入成功: {MODEL_PATH}")
except Exception as e:
    print(f"模型載入失敗: {e}")
    model = None

class DetectionResponse:
    def __init__(self):
        self.defects = []
        self.result_image = None
        self.detection_time = 0
        self.defect_count = 0
        self.average_confidence = 0.0

@app.post("/detect")
async def detect_defects(
    image: UploadFile = File(...),
    confidence_threshold: float = Form(0.5)
):
    if model is None:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "模型未載入"}
        )

    try:
        # 創建唯一的臨時目錄
        session_id = str(uuid.uuid4())
        session_dir = os.path.join(TEMP_DIR, session_id)
        os.makedirs(session_dir, exist_ok=True)

        # 保存上傳的圖片
        image_path = os.path.join(session_dir, f"input.{image.filename.split('.')[-1]}")
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        # 設定輸出目錄
        output_dir = os.path.join(session_dir, "results")

        # 執行 YOLO 預測 - 使用您提供的參數
        results = model.predict(
            source=image_path,
            imgsz=IMG_SIZE,
            device=DEVICE,
            project=output_dir,
            name="predict",  # 這會創建 predict 子資料夾
            conf=confidence_threshold,
            iou=0.6,
            visualize=True,
            augment=True,
            save=True,
            save_txt=True,
            save_conf=True,
            show_labels=True,
            show_conf=True,
            show_boxes=True,
        )

        # 解析結果
        predict_dir = os.path.join(output_dir, "predict")
        labels_dir = os.path.join(predict_dir, "labels")

        # 讀取預測圖片
        result_image_path = None
        for file in os.listdir(predict_dir):
            if file.lower().endswith(('.jpg', '.jpeg', '.png')):
                result_image_path = os.path.join(predict_dir, file)
                break

        # 讀取標籤文件
        defects = []
        if os.path.exists(labels_dir):
            for label_file in os.listdir(labels_dir):
                if label_file.endswith('.txt'):
                    label_path = os.path.join(labels_dir, label_file)
                    with open(label_path, 'r') as f:
                        for line_num, line in enumerate(f):
                            parts = line.strip().split()
                            if len(parts) >= 6:  # 類別ID x中心 y中心 寬度 高度 置信度
                                class_id = int(parts[0])
                                x_center = float(parts[1])
                                y_center = float(parts[2])
                                width = float(parts[3])
                                height = float(parts[4])
                                confidence = float(parts[5])

                                # 轉換類別ID為類別名稱
                                class_names = ['missing_hole', 'mouse_bite', 'open_circuit', 'short', 'spur', 'spurious_copper']
                                defect_type = class_names[class_id] if class_id < len(class_names) else 'unknown'

                                defects.append({
                                    'id': len(defects) + 1,
                                    'classId': class_id,
                                    'defectType': defect_type,
                                    'xCenter': x_center,
                                    'yCenter': y_center,
                                    'width': width,
                                    'height': height,
                                    'confidence': confidence
                                })

        # 讀取結果圖片並轉為base64
        result_image_base64 = None
        if result_image_path and os.path.exists(result_image_path):
            with open(result_image_path, "rb") as img_file:
                result_image_base64 = base64.b64encode(img_file.read()).decode('utf-8')

        # 讀取原始圖片並轉為base64
        with open(image_path, "rb") as img_file:
            original_image_base64 = base64.b64encode(img_file.read()).decode('utf-8')

        # 計算統計數據
        defect_count = len(defects)
        average_confidence = sum(d['confidence'] for d in defects) / defect_count if defect_count > 0 else 0.0

        # 清理臨時文件
        shutil.rmtree(session_dir)

        return JSONResponse(content={
            "success": True,
            "data": {
                "originalImage": f"data:image/jpeg;base64,{original_image_base64}",
                "resultImage": f"data:image/jpeg;base64,{result_image_base64}",
                "defects": defects,
                "summary": {
                    "totalDefects": defect_count,
                    "averageConfidence": average_confidence,
                    "detectionTime": 0  # 可以添加時間測量
                }
            }
        })

    except Exception as e:
        # 清理臨時文件
        if 'session_dir' in locals() and os.path.exists(session_dir):
            shutil.rmtree(session_dir)

        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"檢測失敗: {str(e)}"}
        )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
