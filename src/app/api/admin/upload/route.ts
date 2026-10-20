import { isAdmin } from "@/lib/auth";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB, UploadError, saveUpload } from "@/content/media";

export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Not signed in" }, { status: 401 });

  // Refuse oversized uploads before reading the body, so the message is accurate.
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_UPLOAD_BYTES + 512 * 1024) {
    return Response.json({ error: `That image is larger than ${MAX_UPLOAD_MB} MB.` }, { status: 413 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Could not read the upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file was sent." }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES) return Response.json({ error: `That image is larger than ${MAX_UPLOAD_MB} MB.` }, { status: 413 });

  try {
    const saved = await saveUpload(Buffer.from(await file.arrayBuffer()), file.name);
    return Response.json(saved);
  } catch (error) {
    if (error instanceof UploadError) return Response.json({ error: error.message }, { status: 400 });
    console.error("[upload] failed", error);
    return Response.json({ error: "The upload failed. Please try again." }, { status: 500 });
  }
}
