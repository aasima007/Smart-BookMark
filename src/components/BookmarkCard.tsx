"use client";

import { useState } from "react";

interface Bookmark {
  id: string;
  url: string;
  title: string;
  created_at: string;
}

interface Props {
  bookmark: Bookmark;
  onDelete: (id: string) => Promise<void>;
  index: number;
}

export default function BookmarkCard({ bookmark, onDelete, index }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      // Auto-cancel after 3s
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    try {
      await onDelete(bookmark.id);
    } catch (err) {
      console.error(err);
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const domain = (() => {
    try {
      return new URL(bookmark.url).hostname.replace("www.", "");
    } catch {
      return bookmark.url;
    }
  })();

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  const formattedDate = new Date(bookmark.created_at).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" }
  );

  const staggerClass = `stagger-${Math.min((index % 5) + 1, 5)}`;

  return (
    <article
      className={`
        group relative border border-ink bg-cream
        animate-bookmark-in opacity-0 ${staggerClass}
        hover:shadow-[4px_4px_0px_0px_rgba(15,14,13,1)]
        transition-shadow duration-200
      `}
      style={{ animationFillMode: "forwards" }}
    >
      {/* Card number / index */}
      <div className="absolute top-3 right-3 font-display font-black text-5xl text-ink/5 leading-none pointer-events-none select-none">
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* Top metadata bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-ink/15 bg-cream-dark">
        <img
          src={faviconUrl}
          alt=""
          className="w-4 h-4 flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <span className="font-body text-xs text-muted truncate flex-1">
          {domain}
        </span>
        <span className="font-body text-xs text-muted/60 flex-shrink-0">
          {formattedDate}
        </span>
      </div>

      {/* Main content */}
      <div className="p-4">
        <h3 className="font-display font-bold text-lg leading-snug text-ink mb-2 pr-8 group-hover:text-amber-warm transition-colors duration-150">
          {bookmark.title}
        </h3>
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="
            font-body text-xs text-muted hover:text-ink
            underline underline-offset-2 decoration-ink/20
            hover:decoration-ink transition-all duration-150
            break-all line-clamp-2
          "
        >
          {bookmark.url}
        </a>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-ink/15">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="
            font-body text-xs uppercase tracking-widest text-ink
            flex items-center gap-1.5
            hover:gap-2.5 transition-all duration-150
          "
        >
          Visit →
        </a>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className={`
            font-body text-xs uppercase tracking-widest
            px-3 py-1 border transition-all duration-150
            focus:outline-none
            ${
              confirmDelete
                ? "border-rust text-rust bg-rust/5 hover:bg-rust hover:text-cream"
                : "border-ink/20 text-muted hover:border-rust hover:text-rust"
            }
            disabled:opacity-40 disabled:cursor-not-allowed
          `}
        >
          {deleting ? "..." : confirmDelete ? "Confirm?" : "Delete"}
        </button>
      </div>
    </article>
  );
}
