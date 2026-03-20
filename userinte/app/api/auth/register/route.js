import connectDB from "@/lib/db";
import User from "@/server/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { username, password } = await req.json();

  await connectDB();

  const hash = await bcrypt.hash(password, 10);

  await User.create({ username, password: hash });

  return Response.json({ success: true });
}