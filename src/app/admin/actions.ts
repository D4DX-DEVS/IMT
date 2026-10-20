"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { z } from "zod";
import { CONTENT_TAG } from "@/content";
import {
  aboutPageSchema,
  galleryImageSchema,
  homeSchema,
  institutionSchema,
  postSchema,
  siteSchema,
  slugSchema,
  type Content,
} from "@/content/schema";
import { ContentError, updateContent } from "@/content/store";
import { explainStorageError, getStore } from "@/storage";
import { endSession, requireAdmin, startSession } from "@/lib/auth";
import { adminConfigProblems, verifyCredentials } from "@/lib/auth-token";
import { clearLoginFailures, loginRetryAfter, recordLoginFailure } from "@/lib/rate-limit";
import type { ActionState, LoginState } from "@/lib/action-state";

/* ---------- Sign in / out ---------- */

/** Only ever send people to a path inside the admin area. */
function safeNext(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "/admin";
  const ok = /^\/admin(\/[A-Za-z0-9\-._~%/]*)?(\?[A-Za-z0-9\-._~%=&/]*)?$/.test(value) && !value.startsWith("//");
  return ok && !value.startsWith("/admin/login") ? value : "/admin";
}

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const problems = adminConfigProblems();
  if (problems.length) {
    return { error: `Admin sign-in isn't set up correctly on this server: ${problems.join("; ")}.` };
  }

  const h = await headers();
  const client = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "local").trim();
  const wait = loginRetryAfter(client);
  if (wait > 0) {
    return { error: `Too many failed attempts. Try again in ${Math.max(1, Math.ceil(wait / 60))} minute(s).` };
  }

  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!verifyCredentials(username, password)) {
    recordLoginFailure(client);
    await new Promise((resolve) => setTimeout(resolve, 600)); // slow down guessing
    return { error: "Incorrect username or password." };
  }

  clearLoginFailures(client);
  if (!(await startSession())) return { error: "Could not start a session. Check SESSION_SECRET." };
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

/* ---------- Helpers ---------- */

const fail = (message: string, issues?: string[]): ActionState => ({ status: "error", message, issues });

function describeIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const where = issue.path.map((p) => (typeof p === "number" ? `#${p + 1}` : String(p))).join(" › ");
    return where ? `${where}: ${issue.message}` : issue.message;
  });
}

/** Reads and validates the JSON `payload` field every admin form submits. */
function parsePayload<S extends z.ZodType>(
  schema: S,
  formData: FormData,
): { data: z.output<S> } | { error: ActionState } {
  const raw = formData.get("payload");
  if (typeof raw !== "string") return { error: fail("Nothing to save.") };

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { error: fail("The form data was unreadable. Reload the page and try again.") };
  }

  const result = schema.safeParse(json);
  if (!result.success) return { error: fail("Please fix these problems and save again.", describeIssues(result.error)) };
  return { data: result.data };
}

/** Applies a change to the stored content and refreshes the public pages. */
async function commit(mutate: (draft: Content) => Content, success: string): Promise<ActionState> {
  try {
    await updateContent(mutate);
  } catch (error) {
    if (error instanceof ContentError) return fail(error.message);
    if (error instanceof z.ZodError) return fail("That change would make the site content invalid.", describeIssues(error));
    console.error("[admin] save failed", error);
    return fail("Saving failed. Please try again.");
  }
  updateTag(CONTENT_TAG);
  return { status: "success", message: success };
}

/* ---------- Site, home, about ---------- */

export async function saveSite(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = parsePayload(siteSchema, formData);
  if ("error" in parsed) return parsed.error;
  return commit((c) => ({ ...c, site: parsed.data }), "Site settings saved");
}

export async function saveHome(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = parsePayload(homeSchema, formData);
  if ("error" in parsed) return parsed.error;
  return commit((c) => ({ ...c, home: parsed.data }), "Home page saved");
}

export async function saveAbout(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = parsePayload(aboutPageSchema, formData);
  if ("error" in parsed) return parsed.error;
  return commit((c) => ({ ...c, aboutPage: parsed.data }), "About page saved");
}

/* ---------- Gallery ---------- */

export async function saveGallery(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = parsePayload(z.array(galleryImageSchema), formData);
  if ("error" in parsed) return parsed.error;
  return commit((c) => ({ ...c, gallery: parsed.data }), "Gallery saved");
}

/* ---------- Institutions ---------- */

const institutionPayload = z.object({ originalSlug: slugSchema.optional(), institution: institutionSchema });

export async function saveInstitution(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = parsePayload(institutionPayload, formData);
  if ("error" in parsed) return parsed.error;
  const { originalSlug, institution } = parsed.data;

  const result = await commit((c) => {
    const list = [...c.institutions];
    const taken = (slug: string) => list.some((i) => i.slug === slug);
    if (originalSlug) {
      const index = list.findIndex((i) => i.slug === originalSlug);
      if (index < 0) throw new ContentError("That institution no longer exists. Go back to the list and reopen it.");
      if (institution.slug !== originalSlug && taken(institution.slug)) {
        throw new ContentError(`Another institution already uses the address “${institution.slug}”.`);
      }
      list[index] = institution;
    } else {
      if (taken(institution.slug)) {
        throw new ContentError(`Another institution already uses the address “${institution.slug}”. Change the name or the address.`);
      }
      list.push(institution);
    }
    return { ...c, institutions: list };
  }, originalSlug ? "Institution saved" : "Institution added");

  if (result.status === "success" && !originalSlug) redirect("/admin/institutions");
  return result;
}

export async function deleteInstitution(slug: string): Promise<ActionState> {
  await requireAdmin();
  const id = slugSchema.safeParse(slug);
  if (!id.success) return fail("Unknown institution.");
  return commit((c) => {
    if (c.institutions.length <= 1) throw new ContentError("Keep at least one institution on the site.");
    if (!c.institutions.some((i) => i.slug === id.data)) throw new ContentError("That institution no longer exists.");
    return { ...c, institutions: c.institutions.filter((i) => i.slug !== id.data) };
  }, "Institution deleted");
}

export async function moveInstitution(slug: string, delta: -1 | 1): Promise<ActionState> {
  await requireAdmin();
  const id = slugSchema.safeParse(slug);
  if (!id.success || (delta !== -1 && delta !== 1)) return fail("Unknown institution.");
  return commit((c) => {
    const list = [...c.institutions];
    const from = list.findIndex((i) => i.slug === id.data);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= list.length) return c;
    [list[from], list[to]] = [list[to], list[from]];
    return { ...c, institutions: list };
  }, "Order updated");
}

/* ---------- News ---------- */

const postPayload = z.object({ originalSlug: slugSchema.optional(), post: postSchema });

export async function savePost(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = parsePayload(postPayload, formData);
  if ("error" in parsed) return parsed.error;
  const { originalSlug, post } = parsed.data;

  const result = await commit((c) => {
    const list = [...c.posts];
    const taken = (slug: string) => list.some((p) => p.slug === slug);
    if (originalSlug) {
      const index = list.findIndex((p) => p.slug === originalSlug);
      if (index < 0) throw new ContentError("That post no longer exists. Go back to the list and reopen it.");
      if (post.slug !== originalSlug && taken(post.slug)) {
        throw new ContentError(`Another post already uses the address “${post.slug}”.`);
      }
      list[index] = post;
    } else {
      if (taken(post.slug)) {
        throw new ContentError(`Another post already uses the address “${post.slug}”. Change the title or the address.`);
      }
      list.push(post);
    }
    return { ...c, posts: list };
  }, originalSlug ? "Post saved" : "Post published");

  if (result.status === "success" && !originalSlug) redirect("/admin/news");
  return result;
}

export async function deletePost(slug: string): Promise<ActionState> {
  await requireAdmin();
  const id = slugSchema.safeParse(slug);
  if (!id.success) return fail("Unknown post.");
  return commit((c) => {
    if (!c.posts.some((p) => p.slug === id.data)) throw new ContentError("That post no longer exists.");
    return { ...c, posts: c.posts.filter((p) => p.slug !== id.data) };
  }, "Post deleted");
}

/* ---------- Storage ---------- */

/**
 * Checks the storage settings: writes, reads back and deletes a tiny private file, and — if a CDN address is
 * set — uploads a tiny public file and fetches it through the CDN, so a wrong key, Space name or CDN
 * address shows up right away.
 */
export async function testStorage(): Promise<ActionState> {
  await requireAdmin();

  let store: ReturnType<typeof getStore>;
  try {
    store = getStore();
  } catch (error) {
    return fail(explainStorageError(error));
  }

  const stamp = Date.now();
  const privateKey = `healthcheck-${stamp}.txt`;
  try {
    await store.put(privateKey, "ok", { contentType: "text/plain" });
    const back = await store.get(privateKey);
    await store.delete(privateKey);
    if (back?.toString("utf8") !== "ok") return fail("A test file was written but could not be read back.");
  } catch (error) {
    return fail(explainStorageError(error));
  }

  const publicKey = `healthcheck-public-${stamp}.txt`;
  const url = store.publicUrl(publicKey);
  if (!url) {
    return { status: "success", message: `Working: ${store.description}. The site serves uploaded images itself.` };
  }

  try {
    await store.put(publicKey, "ok", { contentType: "text/plain", public: true });
    let problem: string | null = null;
    try {
      const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
      if (!res.ok) problem = `the CDN address answered with an error (${res.status})`;
      else if ((await res.text()) !== "ok") problem = "the CDN address returned something unexpected";
    } catch {
      problem = "the CDN address could not be reached";
    }
    if (problem) {
      return fail(`Files can be saved, but ${problem}. Check DO_SPACES_CDN_URL, and that the CDN is enabled on the Space.`);
    }
    return { status: "success", message: `Working: ${store.description}. Uploaded images are served from the CDN.` };
  } catch (error) {
    return fail(explainStorageError(error));
  } finally {
    await store.delete(publicKey).catch(() => undefined);
  }
}
