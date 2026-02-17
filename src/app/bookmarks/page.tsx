import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BookmarksDashboard from "@/components/BookmarksDashboard";

export default async function BookmarksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Fetch initial bookmarks server-side
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <BookmarksDashboard
      user={user}
      initialBookmarks={bookmarks ?? []}
    />
  );
}
