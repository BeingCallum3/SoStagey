"use client";

import { format, formatDistanceToNow } from "date-fns";

type ArticleCardProps = {
  headline: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: Date;
};

export const ArticleCard = ({
  headline,
  summary,
  url,
  source,
  publishedAt,
}: ArticleCardProps) => {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg">
      <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-zinc-500">
        <span className="uppercase tracking-wide text-indigo-600">{source}</span>
        <span aria-hidden="true">•</span>
        <time
          dateTime={publishedAt.toISOString()}
          title={format(publishedAt, "PPPpp")}
        >
          {formatDistanceToNow(publishedAt, { addSuffix: true })}
        </time>
      </div>
      <h2 className="text-xl font-semibold text-zinc-900">
        <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {headline}
        </a>
      </h2>
      <p className="text-base leading-relaxed text-zinc-600">{summary}</p>
      <div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Read full story
          <span aria-hidden className="ml-1">→</span>
        </a>
      </div>
    </article>
  );
};

