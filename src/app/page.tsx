import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginButton from "@/components/LoginButton";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/bookmarks");
  }

  return (
    <main className="min-h-screen bg-cream flex flex-col ruled-bg">
      {/* Masthead */}
      <header className="border-b-4 border-ink px-8 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center border-b-2 border-ink pb-4 mb-4">
            <p className="font-body text-xs tracking-[0.3em] uppercase text-muted mb-2">
              Est. {new Date().getFullYear()} · Personal Edition
            </p>
            <h1 className="font-display text-7xl md:text-9xl font-black tracking-tight leading-none text-ink">
              BOOKMARK
            </h1>
            <p className="font-body text-xs tracking-[0.3em] uppercase text-muted mt-2">
              The Internet, Curated
            </p>
          </div>

          {/* Subheadline row */}
          <div className="flex items-center justify-between text-xs font-body tracking-widest uppercase text-muted">
            <span>Save · Organize · Return</span>
            <span className="font-display font-bold text-ink">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span>Private · Real-time · Yours</span>
          </div>
        </div>
      </header>

      {/* Hero content */}
      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-ink">

            {/* Left column — pull quote */}
            <div className="border-r border-ink p-8 flex flex-col justify-between bg-ink text-cream">
              <div>
                <p className="font-body italic text-3xl leading-tight mb-6 opacity-90">
                  "The web is vast. Save what matters."
                </p>
                <div className="w-12 h-0.5 bg-amber-light mb-6" />
                <p className="font-body text-sm opacity-60 leading-relaxed">
                  Every great collection begins with a single save. Your bookmarks,
                  synced in real-time across every tab, every device.
                </p>
              </div>
            </div>

            {/* Center column — login */}
            <div className="p-10 flex flex-col items-center justify-center text-center border-r border-ink">
              <div className="mb-8">
                <span className="inline-block w-16 h-0.5 bg-ink mb-6 block mx-auto" />
                <h2 className="font-display text-3xl font-bold mb-3 text-ink">
                  Begin Your
                  <br />
                  <em>Collection</em>
                </h2>
                <p className="font-body text-sm text-muted leading-relaxed">
                  Sign in with Google to access your private bookmark archive.
                  No passwords. No fuss.
                </p>
                <span className="inline-block w-16 h-0.5 bg-ink mt-6 block mx-auto" />
              </div>

              <LoginButton />

              <p className="mt-6 font-body text-xs text-muted">
                Your bookmarks are private.
                <br />
                Only you can see them.
              </p>
            </div>

            {/* Right column — features */}
            <div className="p-8 flex flex-col gap-6">
              <h3 className="font-display text-lg font-bold border-b border-ink pb-3 uppercase tracking-wide">
                Features
              </h3>
              {[
                {
                  icon: "⚡",
                  title: "Real-time sync",
                  desc: "Open two tabs — bookmarks update instantly in both.",
                },
                {
                  icon: "🔒",
                  title: "Fully private",
                  desc: "Each collection is yours alone. Zero sharing by default.",
                },
                {
                  icon: "🔖",
                  title: "URL + title",
                  desc: "Save any link with a meaningful label.",
                },
                {
                  icon: "🗑️",
                  title: "Delete anytime",
                  desc: "Clean up your collection with one click.",
                },
              ].map((f, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-xl">{f.icon}</span>
                  <div>
                    <p className="font-display font-bold text-sm text-ink">
                      {f.title}
                    </p>
                    <p className="font-body text-xs text-muted leading-snug mt-0.5">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer rule */}
      <footer className="border-t-2 border-ink px-8 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <span className="font-body text-xs text-muted uppercase tracking-widest">
            Bookmark App
          </span>
          <span className="font-body text-xs text-muted">
            Built with Next.js · Supabase · Tailwind CSS
          </span>
        </div>
      </footer>
    </main>
  );
}
