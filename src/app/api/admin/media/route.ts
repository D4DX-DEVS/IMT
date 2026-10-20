import { isAdmin } from "@/lib/auth";
import { listMedia } from "@/content/media";

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Not signed in" }, { status: 401 });
  return Response.json({ items: await listMedia() }, { headers: { "Cache-Control": "no-store" } });
}
