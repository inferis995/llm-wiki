"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { WikiPage } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/types";

interface Props {
  page: WikiPage;
  onLinkClick: (slug: string) => void;
  onBack: () => void;
}

const WIKILINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

function processWikilinks(content: string): string {
  return content.replace(WIKILINK_RE, (_match, slug, alias) => {
    const display = alias ? alias : slug.split("/").pop() || slug;
    return `[${display}](${slug})`;
  });
}

export default function MarkdownViewer({ page, onLinkClick, onBack }: Props) {
  const processedContent = processWikilinks(page.content);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-800">
        <button
          onClick={onBack}
          className="p-1.5 rounded-md text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors"
          aria-label="Torna al grafo"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-surface-100 truncate">{page.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="category-badge text-white"
              style={{ backgroundColor: CATEGORY_COLORS[page.category] + "30", color: CATEGORY_COLORS[page.category] }}
            >
              {CATEGORY_LABELS[page.category] || page.category}
            </span>
            {page.frontmatter.updated && (
              <span className="text-xs text-surface-500">Aggiornato: {String(page.frontmatter.updated)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      {page.frontmatter.tags && page.frontmatter.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {page.frontmatter.tags.map((tag: string) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        <div className="prose-wiki max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ href, children }) => {
                if (href && !href.startsWith("http") && !href.startsWith("mailto:")) {
                  return (
                    <span
                      className="wiki-link"
                      onClick={() => onLinkClick(href)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && onLinkClick(href)}
                    >
                      {children}
                    </span>
                  );
                }
                return (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="wiki-link">
                    {children}
                  </a>
                );
              },
            }}
          >
            {processedContent}
          </ReactMarkdown>
        </div>

        {/* Backlinks */}
        {page.backlinks.length > 0 && (
          <div className="mt-10 pt-6 border-t border-surface-800">
            <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-3">
              Backlinks
            </h3>
            <div className="flex flex-wrap gap-2">
              {page.backlinks.map((bl) => (
                <button
                  key={bl}
                  onClick={() => onLinkClick(bl)}
                  className="tag hover:bg-surface-700 hover:text-surface-200 transition-colors cursor-pointer"
                >
                  {bl.replace(/\\/g, "/").split("/").pop()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Related links from content */}
        {page.links.length > 0 && (
          <div className="mt-6 pt-6 border-t border-surface-800">
            <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-3">
              Correlati
            </h3>
            <div className="flex flex-wrap gap-2">
              {page.links.map((link) => (
                <button
                  key={link}
                  onClick={() => onLinkClick(link)}
                  className="tag hover:bg-surface-700 hover:text-surface-200 transition-colors cursor-pointer"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
