"use client";

import { useState } from "react";

interface Props {
  onAdd: (url: string, title: string) => Promise<void>;
}

export default function AddBookmarkForm({ onAdd }: Props) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isValidUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUrl = url.trim();
    const trimmedTitle = title.trim();

    if (!trimmedUrl || !trimmedTitle) {
      setError("Both URL and title are required.");
      return;
    }

    if (!isValidUrl(trimmedUrl)) {
      setError("Please enter a valid URL (include https://).");
      return;
    }

    try {
      setLoading(true);
      await onAdd(trimmedUrl, trimmedTitle);
      setUrl("");
      setTitle("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError("Failed to save bookmark. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-2 border-ink bg-cream">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* URL field */}
        <div className="border-b-2 md:border-b-0 md:border-r-2 border-ink">
          <label className="block px-4 pt-3 pb-1 font-body text-xs uppercase tracking-widest text-muted border-b border-ink/20">
            URL
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            disabled={loading}
            className="
              w-full px-4 py-3 bg-transparent
              font-body text-sm text-ink
              placeholder:text-ink/30
              focus:outline-none focus:bg-amber-warm/5
              disabled:opacity-50
            "
          />
        </div>

        {/* Title field */}
        <div>
          <label className="block px-4 pt-3 pb-1 font-body text-xs uppercase tracking-widest text-muted border-b border-ink/20">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A meaningful label"
            disabled={loading}
            className="
              w-full px-4 py-3 bg-transparent
              font-body text-sm text-ink
              placeholder:text-ink/30
              focus:outline-none focus:bg-amber-warm/5
              disabled:opacity-50
            "
          />
        </div>
      </div>

      {/* Error + Submit row */}
      <div className="border-t-2 border-ink flex items-center justify-between px-4 py-3 gap-4">
        <div className="flex-1">
          {error && (
            <p className="font-body text-xs text-rust animate-fade-in">
              ⚠ {error}
            </p>
          )}
          {success && (
            <p className="font-body text-xs text-sage animate-fade-in">
              ✓ Bookmark saved!
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="
            font-body font-medium text-xs uppercase tracking-widest
            bg-ink text-cream
            px-6 py-2.5
            border-2 border-ink
            hover:bg-cream hover:text-ink
            transition-colors duration-150
            disabled:opacity-40 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-1
            flex items-center gap-2
          "
        >
          {loading ? (
            <>
              <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            "Save Bookmark"
          )}
        </button>
      </div>
    </form>
  );
}
