export async function POST(req) {
  const data = await req.formData();
  const file = data.get("file");

  const bytes = await file.arrayBuffer();

  const fs = require("fs");
  const path = "./public/" + file.name;

  fs.writeFileSync(path, Buffer.from(bytes));

  return Response.json({ url: "/" + file.name });
}