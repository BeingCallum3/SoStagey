import Parser from "rss-parser";
import { load } from "cheerio";
import { z } from "zod";

export type ScrapedArticle = {
  headline: string;
  url: string;
  source: string;
  publishedAt: Date;
  content: string;
};

const DEFAULT_SOURCES: Array<{ source: string; feedUrl: string }> = [
  {
    source: "The Stage",
    feedUrl: "https://www.thestage.co.uk/feed",
  },
  {
    source: "WhatsOnStage",
    feedUrl: "https://www.whatsonstage.com/news/feed/",
  },
  {
    source: "BroadwayWorld UK",
    feedUrl:
      "https://www.broadwayworld.com/bwwclassicalmusic.cfm?feed=rss" /* fallback feed */,
  },
];

const SCRAPE_TARGETS_SCHEMA = z
  .string()
  .transform((value) =>
    value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean),
  )
  .pipe(
    z
      .array(z.string().url())
      .transform((urls) =>
        urls.map((url) => ({
          source: new URL(url).hostname,
          feedUrl: url,
        })),
      ),
  );

const parser = new Parser({ timeout: 30_000 });

const getSources = () => {
  const override = process.env.SCRAPE_TARGETS;
  if (!override) {
    return DEFAULT_SOURCES;
  }

  const parseResult = SCRAPE_TARGETS_SCHEMA.safeParse(override);
  if (!parseResult.success) {
    console.warn("Invalid SCRAPE_TARGETS env; falling back to defaults", parseResult.error.format());
    return DEFAULT_SOURCES;
  }

  return parseResult.data;
};

const fetchArticleContent = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch article content: ${response.status}`);
    }

    const html = await response.text();
    const $ = load(html);

    const articleText =
      $("article")
        .find("p")
        .toArray()
        .map((p) => $(p).text().trim())
        .filter(Boolean)
        .join("\n\n") ||
      $("p")
        .toArray()
        .slice(0, 20)
        .map((p) => $(p).text().trim())
        .filter(Boolean)
        .join("\n\n");

    return articleText;
  } catch (error) {
    console.error(`Error fetching full content for ${url}:`, error);
    return "";
  }
};

export const scrapeSources = async () => {
  const sources = getSources();

  const scrapedPerSource = await Promise.all(
    sources.map(async ({ source, feedUrl }) => {
      try {
        const feed = await parser.parseURL(feedUrl);
        const entries = feed.items ?? [];

        const articles = await Promise.all(
          entries.slice(0, 10).map(async (item) => {
            const headline = item.title?.trim();
            const url = item.link?.trim();
            const publishedAt = item.isoDate
              ? new Date(item.isoDate)
              : item.pubDate
                ? new Date(item.pubDate)
                : new Date();

            if (!headline || !url) {
              return null;
            }

            const content = item.contentSnippet?.trim() || (await fetchArticleContent(url));

            return {
              headline,
              url,
              source,
              publishedAt,
              content,
            } satisfies ScrapedArticle;
          }),
        );

        return articles.filter((article): article is ScrapedArticle => Boolean(article));
      } catch (error) {
        console.error(`Failed to scrape ${source} (${feedUrl}):`, error);
        return [] as ScrapedArticle[];
      }
    }),
  );

  const combined = scrapedPerSource.flat();

  const deduped = Array.from(
    new Map(combined.map((article) => [article.url, article])).values(),
  );

  return deduped.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
};

