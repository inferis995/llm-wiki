import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { WikiPage, GraphNode, GraphLink } from "./types";
import { CATEGORY_COLORS } from "./types";

const WIKI_ROOT = path.resolve(process.cwd(), "..", "wiki");
const CLIPPINGS_DIR = path.resolve(path.dirname(WIKI_ROOT), "Clippings");

const CATEGORY_GROUPS: Record<string, number> = {
  sources: 0,
  entities: 1,
  concepts: 2,
  comparisons: 3,
  clippings: 4,
  root: 5,
};

function walkDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(full));
    } else if (entry.name.endsWith(".md")) {
      files.push(full);
    }
  }
  return files;
}

const WIKILINK_RE = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;

export function getAllPages(): WikiPage[] {
  const mdFiles = [...walkDir(WIKI_ROOT), ...walkDir(CLIPPINGS_DIR)];
  const pages: WikiPage[] = [];

  for (const filePath of mdFiles) {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const isInClippings = filePath.startsWith(CLIPPINGS_DIR);
    const relative = isInClippings
      ? path.join("clippings", path.relative(CLIPPINGS_DIR, filePath))
      : path.relative(WIKI_ROOT, filePath);
    const slug = relative.replace(/\.md$/, "");
    const parts = slug.split(path.sep);
    const category = isInClippings ? "clippings" : parts.length > 1 ? parts[0] : "root";
    const title = data.title || path.basename(filePath, ".md");

    const links: string[] = [];
    let match: RegExpExecArray | null;
    const re = new RegExp(WIKILINK_RE.source, "g");
    while ((match = re.exec(content)) !== null) {
      const link = match[1].trim();
      if (!links.includes(link)) links.push(link);
    }

    pages.push({ slug, title, category, content, frontmatter: data, links, backlinks: [] });
  }

  for (const page of pages) {
    for (const link of page.links) {
      const target = pages.find(
        (p) => p.slug === link || p.slug.endsWith(link) || p.title.toLowerCase() === link.toLowerCase()
      );
      if (target) {
        target.backlinks.push(page.slug);
      }
    }
  }

  return pages;
}

export function getGraphData(pages: WikiPage[]) {
  const nodes: GraphNode[] = pages.map((p) => ({
    id: p.slug,
    title: p.title,
    category: p.category,
    group: CATEGORY_GROUPS[p.category] ?? 4,
  }));

  const links: GraphLink[] = [];
  const seen = new Set<string>();

  for (const page of pages) {
    for (const link of page.links) {
      const target = pages.find(
        (p) => p.slug === link || p.slug.endsWith(link) || p.title.toLowerCase() === link.toLowerCase()
      );
      if (target) {
        const key = [page.slug, target.slug].sort().join("::");
        if (!seen.has(key)) {
          seen.add(key);
          links.push({ source: page.slug, target: target.slug });
        }
      }
    }
  }

  return { nodes, links };
}

export function getPagesByCategory(pages: WikiPage[]) {
  const grouped: Record<string, WikiPage[]> = {};
  for (const page of pages) {
    if (!grouped[page.category]) grouped[page.category] = [];
    grouped[page.category].push(page);
  }
  return grouped;
}
