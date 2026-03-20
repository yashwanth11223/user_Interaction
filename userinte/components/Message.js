export default function Message({ c, isMe }) {
  return (
    <div className={isMe ? "text-right" : "text-left"}>
      <div className="bg-gray-700 inline-block p-2 rounded">
        <b>{c.user}</b>: {c.message}
      </div>
    </div>
  );
}