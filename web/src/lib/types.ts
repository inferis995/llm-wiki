export interface WikiPage {
  slug: string;
  title: string;
  category: string;
  content: string;
  frontmatter: Record<string, any>;
  links: string[];
  backlinks: string[];
}

export interface GraphNode {
  id: string;
  title: string;
  category: string;
  group: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  index?: number;
  vx?: number;
  vy?: number;
}

export interface GraphLink {
  source: string;
  target: string;
}

export const CATEGORY_COLORS: Record<string, string> = {
  sources: "#3b82f6",
  entities: "#22c55e",
  concepts: "#f59e0b",
  comparisons: "#a855f7",
  clippings: "#ef4444",
  root: "#6b7280",
};

export const CATEGORY_LABELS: Record<string, string> = {
  sources: "Fonti",
  entities: "Entita",
  concepts: "Concetti",
  comparisons: "Confronti",
  clippings: "Clippings",
  root: "Root",
};
