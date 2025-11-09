import "dotenv/config";

import { createArticle, findArticleByUrl } from "@/lib/firestore";
import { scrapeSources } from "@/lib/scraper";
import { summarizeArticle } from "@/lib/summarize";

const run = async () => {
  console.log("Starting SoStagey scrape...");

  const scraped = await scrapeSources();
  console.log(`Fetched ${scraped.length} candidates.`);

  const created = [] as string[];
  const skipped = [] as string[];

  for (const article of scraped) {
    try {
      const existing = await findArticleByUrl(article.url);
      if (existing) {
        skipped.push(article.url);
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

      created.push(saved.id);
      console.log(`Stored article: ${saved.headline}`);
    } catch (error) {
      console.error(`Failed to process ${article.url}`, error);
    }
  }

  console.log(`Inserted ${created.length} new articles. Skipped ${skipped.length}.`);
  console.log("Done.");
};

run().catch((error) => {
  console.error("Scraper failed:", error);
  process.exitCode = 1;
});

