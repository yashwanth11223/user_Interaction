import { connectDB } from "@/lib/db";
import Message from "@/server/models/Message";

export async function POST(req) {
  await connectDB();
  const data = await req.json();

  const msg = await Message.create(data);
  return Response.json(msg);
}

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const user1 = searchParams.get("user1");
  const user2 = searchParams.get("user2");

  // ✅ if no users → return empty (no crash)
  if (!user1 || !user2) return Response.json([]);

  const msgs = await Message.find({
    $or: [
      { from: user1, to: user2 },
      { from: user2, to: user1 },
    ],
  }).sort({ _id: 1 });

  return Response.json(msgs);
}