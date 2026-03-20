export default function CallPopup({ answerCall, endCall }) {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-black p-4 rounded">
      <p>Incoming Call</p>

      <div className="flex gap-2 mt-2">
        <button onClick={answerCall} className="bg-green-500 px-3">
          Accept
        </button>

        <button onClick={endCall} className="bg-red-500 px-3">
          Reject
        </button>
      </div>
    </div>
  );
}