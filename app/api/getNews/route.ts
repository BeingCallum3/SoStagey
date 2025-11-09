import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  articleToDTO,
  getArticlesPage,
} from "@/lib/firestore";

const querySchema = z.object({
  cursor: z
    .string()
    .transform((value) => new Date(value))
    .refine((date) => !Number.isNaN(date.getTime()), "Invalid cursor")
    .optional(),
  pageSize: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : undefined))
    .refine((value) => value === undefined || Number.isFinite(value), {
      message: "pageSize must be a number",
    })
    .transform((value) => value ?? 10)
    .pipe(z.number().int().min(1).max(50)),
});

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const queryObject = Object.fromEntries(searchParams.entries());

  const parsed = querySchema.safeParse(queryObject);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { cursor, pageSize } = parsed.data;

  try {
    const page = await getArticlesPage({
      startAfter: cursor,
      pageSize,
    });

    return NextResponse.json({
      articles: page.articles.map(articleToDTO),
      nextCursor: page.nextCursor?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 },
    );
  }
}

