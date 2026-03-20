import { connectDB } from "@/lib/db";
import User from "@/server/models/User";

export async function POST(req) {
  await connectDB();

  const { phone, name, password } = await req.json();

  if (!phone || !name || !password) {
    return Response.json({ error: "All fields required" });
  }

  let user = await User.findOne({ phone });

  // 🆕 REGISTER
  if (!user) {
    user = await User.create({ phone, name, password });
    return Response.json({ success: true, user });
  }

  // ❌ WRONG NAME OR PASSWORD
  if (user.name !== name || user.password !== password) {
    return Response.json({ error: "Invalid credentials" });
  }

  return Response.json({ success: true, user });
}