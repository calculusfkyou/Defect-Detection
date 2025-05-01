export default function AnnouncementContent({ content }) {
  if (!content) return null;

  return (
    <div className="p-6">
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
