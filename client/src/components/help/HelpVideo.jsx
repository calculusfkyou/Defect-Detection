export default function HelpVideo({ url, title }) {
  // 取得 YouTube 影片 ID
  const getYouTubeId = (youtubeUrl) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = youtubeUrl.match(regExp);
    return (match && match[7].length === 11) ? match[7] : false;
  };

  if (!url) return null;

  const youtubeId = getYouTubeId(url);

  return (
    <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}`}
        title={title || "教學影片"}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      ></iframe>
    </div>
  );
}
