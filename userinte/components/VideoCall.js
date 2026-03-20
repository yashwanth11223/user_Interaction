export default function VideoCall({ myVideo, userVideo, endCall }) {
  return (
    <div className="flex gap-2">
      <video ref={myVideo} autoPlay muted className="w-1/2" />
      <video ref={userVideo} autoPlay className="w-1/2" />

      <button onClick={endCall} className="bg-red-600 px-3">
        End
      </button>
    </div>
  );
}