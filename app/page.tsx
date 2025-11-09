import { Suspense } from "react";

import { NewsFeed } from "@/components/NewsFeed";
import { articleToDTO, getArticlesPage } from "@/lib/firestore";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

const getInitialArticles = async () => {
  try {
    const page = await getArticlesPage({ pageSize: PAGE_SIZE });
    return {
      articles: page.articles.map(articleToDTO),
      nextCursor: page.nextCursor?.toISOString() ?? null,
    };
  } catch (error) {
    console.error("Failed to fetch initial articles:", error);
    // Return empty state if Firestore is not available
    return {
      articles: [],
      nextCursor: null,
    };
  }
};

export default async function Home() {
  const { articles, nextCursor } = await getInitialArticles();

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <header className="border-b border-zinc-200 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-10">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">
            SoStagey
          </span>
          <h1 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
            Latest UK theatre headlines, summarised hourly.
          </h1>
          <p className="max-w-2xl text-base text-zinc-600">
            We scan leading outlets like The Stage, WhatsOnStage, and BroadwayWorld UK
            to bring you concise, AI-generated summaries with links back to each source.
          </p>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col px-6 py-10">
        <Suspense fallback={<p className="text-zinc-500">Loading stories…</p>}>
          <NewsFeed initialArticles={articles} initialCursor={nextCursor} />
        </Suspense>
      </main>
    </div>
  );
}
