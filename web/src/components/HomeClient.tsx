"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type { WikiPage, GraphNode, GraphLink } from "@/lib/types";
import MarkdownViewer from "./MarkdownViewer";

const ForceGraph = dynamic(() => import("./ForceGraph"), { ssr: false });

interface Props {
  pages: WikiPage[];
  nodes: GraphNode[];
  links: GraphLink[];
  grouped: Record<string, WikiPage[]>;
  categoryColors: Record<string, string>;
  categoryLabels: Record<string, string>;
}

export default function HomeClient({ pages, nodes, links, grouped, categoryColors, categoryLabels }: Props) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const findPage = useCallback(
    (slug: string) =>
      pages.find(
        (p) => p.slug === slug || p.slug.endsWith("/" + slug) || p.slug.endsWith("\\" + slug) || p.title.toLowerCase() === slug.toLowerCase()
      ),
    [pages]
  );

  const activePage = activeSlug ? findPage(activeSlug) : null;

  const handleNodeClick = useCallback((slug: string) => {
    setActiveSlug(slug);
  }, []);

  const handleLinkClick = useCallback((slug: string) => {
    setActiveSlug(slug);
  }, []);

  const handleBack = useCallback(() => {
    setActiveSlug(null);
  }, []);

  const filteredGrouped: Record<string, WikiPage[]> = {};
  for (const [cat, catPages] of Object.entries(grouped)) {
    if (searchQuery) {
      const filtered = catPages.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.frontmatter.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      if (filtered.length > 0) filteredGrouped[cat] = filtered;
    } else {
      filteredGrouped[cat] = catPages;
    }
  }

  const categoryOrder = ["sources", "entities", "concepts", "comparisons"];

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } flex-shrink-0 border-r border-surface-800 bg-surface-950 transition-all duration-200 overflow-hidden`}
      >
        <div className="w-64 h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-surface-800">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-bold text-surface-100 tracking-tight">
                <span className="text-accent">Wiki</span> Viewer
              </h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded text-surface-500 hover:text-surface-300 transition-colors"
                aria-label="Chiudi sidebar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-500"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Cerca pagine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg bg-surface-900 border border-surface-800
                           text-surface-200 placeholder:text-surface-600
                           focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30
                           transition-colors"
              />
            </div>
          </div>

          {/* Page List */}
          <nav className="flex-1 overflow-y-auto p-2" aria-label="Navigazione wiki">
            {categoryOrder.map((cat) => {
              const catPages = filteredGrouped[cat];
              if (!catPages) return null;
              return (
                <div key={cat} className="mb-4">
                  <div className="flex items-center gap-2 px-2 mb-1">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: categoryColors[cat] }}
                    />
                    <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
                      {categoryLabels[cat] || cat}
                    </span>
                    <span className="text-xs text-surface-600 ml-auto">{catPages.length}</span>
                  </div>
                  {catPages.map((page) => (
                    <button
                      key={page.slug}
                      onClick={() => setActiveSlug(page.slug)}
                      className={`sidebar-link w-full text-left ${
                        activeSlug === page.slug ? "active" : ""
                      }`}
                    >
                      <span className="truncate">{page.title}</span>
                    </button>
                  ))}
                </div>
              );
            })}
          </nav>

          {/* Stats */}
          <div className="p-3 border-t border-surface-800 text-xs text-surface-600">
            {pages.length} pagine &middot; {links.length} collegamenti
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="flex items-center gap-3 px-4 py-2 border-b border-surface-800 bg-surface-950/80 backdrop-blur-sm">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-md text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors"
              aria-label="Apri sidebar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
          )}
          {activePage && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm text-surface-400 hover:text-surface-200 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Grafo
            </button>
          )}
          <div className="flex-1" />
          <div className="flex items-center gap-3 text-xs text-surface-500">
            {["sources", "entities", "concepts", "comparisons"].map((cat) => (
              <span key={cat} className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: categoryColors[cat] }}
                />
                {categoryLabels[cat]}
              </span>
            ))}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 min-h-0">
          {activePage ? (
            <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto">
              <MarkdownViewer page={activePage} onLinkClick={handleLinkClick} onBack={handleBack} />
            </div>
          ) : (
            <ForceGraph nodes={nodes} links={links} onNodeClick={handleNodeClick} activeNode={activeSlug} />
          )}
        </div>
      </main>
    </div>
  );
}
