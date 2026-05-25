import DOMPurify from "dompurify";
import { marked } from "marked";

export function renderBlogHtml(raw: string | null | undefined): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  const looksLikeHtml = /<\/?[a-z][^>]*>/i.test(trimmed);
  const html = looksLikeHtml ? trimmed : (marked.parse(trimmed, { async: false }) as string);
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0980-\u09FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}
