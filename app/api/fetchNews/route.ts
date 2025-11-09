import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  createArticle,
  findArticleByUrl,
  articleToDTO,
} from "@/lib/firestore";
import { scrapeSources } from "@/lib/scraper";
import { summarizeArticle } from "@/lib/summarize";
import { ArticleDTO } from "@/types/article";

const bodySchema = z
  .object({
    limit: z.number().min(1).max(50).optional(),
  })
  .optional();

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => undefined);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const limit = parsed.data?.limit ?? 20;

  try {
    const scraped = await scrapeSources();
    const candidates = scraped.slice(0, limit);

    const created: ArticleDTO[] = [];
    const skipped: Array<{ url: string; reason: string }> = [];

    for (const article of candidates) {
      try {
        const existing = await findArticleByUrl(article.url);
        if (existing) {
          skipped.push({ url: article.url, reason: "exists" });
          continue;
        }

        const summary = await summarizeArticle({
          headline: article.headline,
          content: article.content,
        });

        const saved = await createArticle({
          headline: article.headline,
          summary,
          url: article.url,
          source: article.source,
          publishedAt: article.publishedAt,
        });

        created.push(articleToDTO(saved));
      } catch (error) {
        console.error(`Failed to process article ${article.url}:`, error);
        skipped.push({ url: article.url, reason: "error" });
      }
    }

    return NextResponse.json({
      insertedCount: created.length,
      skippedCount: skipped.length,
      inserted: created,
      skipped,
    });
  } catch (error) {
    console.error("fetchNews failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch latest news" },
      { status: 500 },
    );
  }
}

