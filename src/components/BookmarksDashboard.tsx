"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import AddBookmarkForm from "./AddBookmarkForm";
import BookmarkCard from "./BookmarkCard";

interface Bookmark {
  id: string;
  url: string;
  title: string;
  user_id: string;
  created_at: string;
}

interface Props {
  user: User;
  initialBookmarks: Bookmark[];
}

export default function BookmarksDashboard({ user, initialBookmarks }: Props) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const supabase = createClient();

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newBookmark = payload.new as Bookmark;
          setBookmarks((prev) => {
            // Avoid duplicates if we already have this from optimistic update
            if (prev.find((b) => b.id === newBookmark.id)) return prev;
            return [newBookmark, ...prev];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setBookmarks((prev) =>
            prev.filter((b) => b.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id, supabase]);

  const handleAdd = useCallback(
    async (url: string, title: string) => {
      const { data, error } = await supabase
        .from("bookmarks")
        .insert([{ url, title, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      // Optimistic update — realtime will also fire but we deduplicate
      if (data) {
        setBookmarks((prev) => {
          if (prev.find((b) => b.id === data.id)) return prev;
          return [data, ...prev];
        });
      }
    },
    [supabase, user.id]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      // Optimistic removal
      setBookmarks((prev) => prev.filter((b) => b.id !== id));

      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        // Revert on error by re-fetching
        console.error("Delete failed:", error);
        const { data } = await supabase
          .from("bookmarks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (data) setBookmarks(data);
      }
    },
    [supabase, user.id]
  );

  const handleSignOut = async () => {
    setSignOutLoading(true);
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const avatarUrl = user.user_metadata?.avatar_url;
  const displayName = user.user_metadata?.full_name || user.email;
  const initials = displayName
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-cream ruled-bg">
      {/* Masthead */}
      <header className="border-b-4 border-ink bg-cream/95 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-4">
              <h1 className="font-display text-3xl md:text-4xl font-black tracking-tight text-ink">
                BOOKMARK
              </h1>
              <span className="hidden md:inline font-body text-xs text-muted uppercase tracking-widest border-l border-ink pl-4">
                Your Collection
              </span>
            </div>

            {/* User info + sign out */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="font-body text-xs font-medium text-ink">
                  {user.user_metadata?.full_name || "Reader"}
                </span>
                <span className="font-body text-xs text-muted">
                  {bookmarks.length}{" "}
                  {bookmarks.length === 1 ? "bookmark" : "bookmarks"}
                </span>
              </div>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-9 h-9 rounded-full border-2 border-ink"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-ink text-cream flex items-center justify-center font-display text-sm font-bold">
                  {initials}
                </div>
              )}
              <button
                onClick={handleSignOut}
                disabled={signOutLoading}
                className="
                  font-body text-xs uppercase tracking-wider
                  border border-ink px-3 py-1.5
                  text-ink hover:bg-ink hover:text-cream
                  transition-colors duration-150
                  disabled:opacity-40
                  focus:outline-none focus:ring-1 focus:ring-ink
                "
              >
                {signOutLoading ? "..." : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Date line */}
        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-ink">
          <span className="font-body text-xs uppercase tracking-[0.25em] text-muted">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span className="flex-1 h-px bg-ink/20" />
          <span className="font-body text-xs uppercase tracking-[0.25em] text-muted">
            Real-time Edition
          </span>
        </div>

        {/* Add form */}
        <section className="mb-10">
          <h2 className="font-display text-2xl font-bold mb-4 text-ink flex items-baseline gap-3">
            Add New Bookmark
            <span className="font-body text-xs font-normal text-muted uppercase tracking-widest">
              URL + Title
            </span>
          </h2>
          <AddBookmarkForm onAdd={handleAdd} />
        </section>

        {/* Bookmark list */}
        <section>
          <div className="flex items-baseline justify-between mb-4 border-b-2 border-ink pb-2">
            <h2 className="font-display text-2xl font-bold text-ink">
              Your Bookmarks
            </h2>
            <span className="font-body text-xs text-muted uppercase tracking-widest">
              {bookmarks.length} saved
            </span>
          </div>

          {bookmarks.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-ink/30">
              <p className="font-display text-4xl font-black text-ink/10 mb-2">
                EMPTY
              </p>
              <p className="font-body text-sm text-muted">
                Your collection awaits. Save your first link above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookmarks.map((bookmark, index) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onDelete={handleDelete}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
