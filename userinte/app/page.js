"use client";

import { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";

export default function Chat() {

  const [mounted, setMounted] = useState(false);

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isGroup, setIsGroup] = useState(false);

  const [newUser, setNewUser] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);

  const [selectedUser, setSelectedUser] = useState("");

  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);

  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const [callActive, setCallActive] = useState(false);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState(null);
  const [callType, setCallType] = useState("");

  const socketRef = useRef();
  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const connectionRef = useRef(null);
  const streamRef = useRef(null);

  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    setMounted(true);

    const b = [...Array(25)].map(() => ({
      left: Math.random() * 100,
      size: 8 + Math.random() * 20,
      duration: 6 + Math.random() * 6,
    }));
    setBubbles(b);
  }, []);

  useEffect(() => {
    if (callActive && myVideo.current && streamRef.current) {
      myVideo.current.srcObject = streamRef.current;
    }
  }, [callActive]);
  if (!mounted) return null;
  const now = () => new Date().toLocaleString();

  // ✅ LOAD USERS (NO DUPLICATE + NO SELF)
  const loadUsers = async () => {
    const res = await fetch("http://127.0.0.1:4000/users");
    const data = await res.json();

    // ❌ REMOVE YOURSELF
    const filtered = data.filter(
      (u) => String(u.phone).trim() !== String(phone).trim()
    );

    // ❌ REMOVE DUPLICATES
    const unique = [];
    const seen = new Set();

    filtered.forEach((u) => {
      if (!seen.has(u.phone)) {
        seen.add(u.phone);
        unique.push(u);
      }
    });

    setUsers(unique);
  };

  const loadMessages = async (user) => {
    if (!phone || !user) return;

    const res = await fetch(
      `http://127.0.0.1:4000/messages/${phone}/${user}`
    );

    const data = await res.json();
    setChat(data);
  };

  // ✅ LOGIN
  const login = async () => {
    if (!phone || !name) return alert("Enter details");

    const socket = io("http://127.0.0.1:4000");
    socketRef.current = socket;

    socket.emit("join", { phone });

    // ✅ FIX DOUBLE MESSAGE ISSUE HERE
    socket.on("receive-message", (d) => {
      setChat((c) => {
        if (c.some((m) => (m._id || m.id) === (d._id || d.id))) return c;
        return [...c, d];
      });
    });
    socket.on("incomingCall", ({ from, signal, type }) => {
      setReceivingCall(true);
      setCaller(from);
      setCallerSignal(signal);
      setCallType(type);
    });

    socket.on("callAccepted", (signal) => {
      connectionRef.current?.signal(signal);
    });

    socket.on("callEnded", cleanupCall);

    await fetch("http://127.0.0.1:4000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, name }),
    });

    await loadUsers();

    setLoggedIn(true);
  };

  // ✅ SEND MESSAGE (NO DOUBLE)
  const send = () => {
    if (!msg || !selectedUser) return;

    const data = {
      id: Date.now(),
      type: "message",
      from: phone,
      to: selectedUser,
      message: msg,
      time: now(),
    };

    socketRef.current.emit("send-message", data);
    setMsg("");
  };

  const react = (id) => {
    setChat((c) =>
      c.map((m) =>
        m.id === id ? { ...m, reaction: "❤️" } : m
      )
    );
  };

  // 🎤 RECORD
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const recorder = new MediaRecorder(stream);
    let chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);

    recorder.onstop = () => {
      const blob = new Blob(chunks);
      const url = URL.createObjectURL(blob);

      socketRef.current.emit("send-message", {
        id: Date.now(),
        type: "voice",
        from: phone,
        to: selectedUser,
        audio: url,
      });
    };

    recorder.start();
    setMediaRecorder(recorder);
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setRecording(false);
  };

  // 📁 FILE
  const sendFile = (e) => {
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);

    socketRef.current.emit("send-message", {
      id: Date.now(),
      type: "file",
      from: phone,
      to: selectedUser,
      file: url,
    });
  };

  // 📞 CALL
  const startCall = async (video = true) => {
    if (!selectedUser) return alert("Select user");

    setCallType(video ? "video" : "voice");

    const stream = await navigator.mediaDevices.getUserMedia({
      video,
      audio: true,
    });

    streamRef.current = stream;
    setCallActive(true);

    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (data) => {
      socketRef.current.emit("callUser", {
        userToCall: selectedUser,
        from: phone,
        signal: data,
        type: video ? "video" : "voice",
      });
    });

    peer.on("stream", (remote) => {
      userVideo.current.srcObject = remote;
    });

    connectionRef.current = peer;
  };

  const answerCall = async () => {
    setReceivingCall(false);
    setCallActive(true);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: callType === "video",
      audio: true,
    });

    streamRef.current = stream;

    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (data) => {
      socketRef.current.emit("answerCall", {
        to: caller,
        signal: data,
      });
    });

    peer.on("stream", (remote) => {
      userVideo.current.srcObject = remote;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const endCall = () => {
    socketRef.current.emit("endCall", { to: selectedUser });
    cleanupCall();
  };

  const cleanupCall = () => {
    connectionRef.current?.destroy();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCallActive(false);
  };

  return (
    <div className="h-screen w-full fixed inset-0 text-white overflow-hidden">

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-cyan-900 to-black animate-pulse" />

      {/* MAIN */}
      {!loggedIn ? (
        <div className="m-auto w-80 p-6 bg-white/10 backdrop-blur-xl rounded-xl">
          <h1 className="text-center mb-4">Pandora 🌊</h1>

          <input
            placeholder="Enter Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 mb-3 bg-black/60 rounded"
          />

          <input
            placeholder="Enter Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 mb-3 bg-black/60 rounded"
          />

          <button
            onClick={login}
            className="w-full bg-cyan-500 p-2 rounded"
          >
            Enter Chat 🚀
          </button>
        </div>
      ) : (
        <div className="relative z-10 h-full flex">

          {/* LEFT */}
          <div className="w-1/4 p-3 border-r overflow-y-auto">

            <div className="flex items-center gap-3 mb-3">
              <img src={`https://i.pravatar.cc/150?u=${phone}`} className="w-10 h-10 rounded-full" />
              <div>
                <div>{name}</div>
                <div className="text-xs text-gray-400">{phone}</div>
              </div>
            </div>
            
            {/* ➕ ADD USER BUTTON */}
            <button
              onClick={() => setShowAddUser(!showAddUser)}
              className="w-full bg-green-500 p-2 mb-2 rounded"
            >
              Add User
            </button>

            {/* ➕ ADD USER FORM */}
            {showAddUser && (
              <div>
                <input
                  placeholder="Phone"
                  value={newUser}
                  onChange={(e) => setNewUser(e.target.value)}
                  className="w-full p-2 mb-2 bg-black/60 rounded"
                />

                <input
                  placeholder="Name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full p-2 mb-2 bg-black/60 rounded"
                />

                <button
                  onClick={async () => {
                    if (!newUser || !newUserName) return;

                    if (users.some(u => u.phone === newUser)) {
                      alert("User already exists");
                      return;
                    }

                    await fetch("http://127.0.0.1:4000/register", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        phone: newUser,
                        name: newUserName
                      }),
                    });

                    await loadUsers();

                    setNewUser("");
                    setNewUserName("");
                    setShowAddUser(false);
                  }}
                  className="w-full bg-cyan-500 p-2 rounded"
                >
                  Save
                </button>
              </div>
            )}

            {users.map((u, i) => (
              <div key={i}
                onClick={() => {
                  setSelectedUser(u.phone);
                  loadMessages(u.phone);
                }}
                className="p-2 cursor-pointer flex items-center gap-2"
              >
                {u.photo && <img src={u.photo} className="w-8 h-8 rounded-full" />}
                <div>
                  <div>{u.name}</div>
                  <div className="text-xs text-gray-400">{u.phone}</div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT */}
          <div className="flex-1 flex flex-col">

            {/* CALL BUTTONS */}
            <div className="p-2 flex gap-2">
              <button onClick={() => startCall(false)} className="bg-green-500 px-3 rounded">📞</button>
              <button onClick={() => startCall(true)} className="bg-cyan-500 px-3 rounded">🎥</button>
            </div>

            {/* CHAT */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chat.map(c => (
                <div key={c._id || c.id}
                  className={`flex ${c.from === phone ? "justify-end" : "justify-start"}`}>
                  <div className="bg-cyan-500/70 px-3 py-2 rounded">
                    {c.type === "message" && c.message}
                    {c.type === "voice" && <audio controls src={c.audio} />}
                    {c.type === "file" && <img src={c.file} className="w-32" />}
                  </div>
                </div>
              ))}
            </div>

            {/* INPUT */}
            <div className="flex p-2 bg-black/40">
              <input value={msg} onChange={(e) => setMsg(e.target.value)} className="flex-1 p-2 bg-black/60 rounded" />
              <button onClick={send} className="ml-2 bg-cyan-500 px-3 rounded">Send</button>
              <button onClick={recording ? stopRecording : startRecording}>🎤</button>
              <input type="file" onChange={sendFile} />
            </div>

          </div>
        </div>
        )}
      {/* CALL SCREEN */}
      {callActive && (
        <div className="fixed inset-0 bg-black z-50">
          <video ref={userVideo} autoPlay className="w-full h-full" />
          <video ref={myVideo} autoPlay muted className="absolute bottom-5 right-5 w-40" />
          <button onClick={endCall} className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-red-600 px-6 py-3 rounded-full">END</button>
        </div>
      )}
      {receivingCall && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-black p-4">
          <p>{caller} calling ({callType})</p>
          <button onClick={answerCall}>Answer</button>
        </div>
      )}

    </div>
  );
}