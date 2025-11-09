"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ArticleCard } from "@/components/ArticleCard";
import { ArticleDTO } from "@/types/article";

type ArticleView = ArticleDTO & {
  publishedAtDate: Date;
  createdAtDate: Date;
};

type NewsFeedProps = {
  initialArticles: ArticleDTO[];
  initialCursor: string | null;
};

const mapDtoToView = (article: ArticleDTO): ArticleView => ({
  ...article,
  publishedAtDate: new Date(article.publishedAt),
  createdAtDate: new Date(article.createdAt),
});

export const NewsFeed = ({ initialArticles, initialCursor }: NewsFeedProps) => {
  const [articles, setArticles] = useState<ArticleView[]>(
    initialArticles.map(mapDtoToView),
  );
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(Boolean(initialCursor));

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (!cursor || isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/getNews?cursor=${encodeURIComponent(cursor)}`,
      );

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = (await response.json()) as {
        articles: ArticleDTO[];
        nextCursor: string | null;
      };

      const nextArticles = data.articles.map(mapDtoToView);

      setArticles((prev) => {
        const existingIds = new Set(prev.map((article) => article.id));
        const merged = [...prev];
        for (const article of nextArticles) {
          if (!existingIds.has(article.id)) {
            merged.push(article);
          }
        }
        return merged;
      });

      setCursor(data.nextCursor);
      setHasMore(Boolean(data.nextCursor));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [cursor, isLoading]);

  useEffect(() => {
    if (!hasMore) {
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            loadMore();
            break;
          }
        }
      },
      {
        rootMargin: "200px",
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadMore]);

  const handleManualLoad = useCallback(() => {
    if (!isLoading && hasMore) {
      void loadMore();
    }
  }, [hasMore, isLoading, loadMore]);

  const feedContent = useMemo(() => {
    if (articles.length === 0 && !isLoading) {
      return (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-500">
          No articles found yet. Trigger the scraper to see fresh stories.
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            headline={article.headline}
            summary={article.summary}
            url={article.url}
            source={article.source}
            publishedAt={article.publishedAtDate}
          />
        ))}
      </div>
    );
  }, [articles, isLoading]);

  return (
    <section className="flex w-full max-w-4xl flex-col gap-8">
      {feedContent}

      <div className="flex flex-col items-center justify-center gap-4">
        {error ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span>Failed to load more articles: {error}</span>
            <button
              type="button"
              onClick={handleManualLoad}
              className="rounded-full bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
            >
              Try again
            </button>
          </div>
        ) : null}

        {!hasMore ? (
          <p className="text-sm text-zinc-500">You&apos;re all caught up.</p>
        ) : (
          <button
            type="button"
            onClick={handleManualLoad}
            disabled={isLoading}
            className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-400"
          >
            {isLoading ? "Loading…" : "Load more"}
          </button>
        )}
      </div>

      <div ref={sentinelRef} aria-hidden className="h-px w-full" />
    </section>
  );
};

