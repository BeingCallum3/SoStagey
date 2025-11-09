import { Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebaseAdmin";
import {
  Article,
  ArticleDTO,
  ArticleRecord,
  CreateArticleInput,
} from "@/types/article";

const COLLECTION = "articles";

export const articleRecordToArticle = (
  id: string,
  data: ArticleRecord,
): Article => ({
  id,
  headline: data.headline,
  summary: data.summary,
  url: data.url,
  source: data.source,
  publishedAt: data.publishedAt.toDate(),
  createdAt: data.createdAt.toDate(),
});

export const createArticle = async (input: CreateArticleInput) => {
  const docRef = db.collection(COLLECTION).doc();
  await docRef.set({
    ...input,
    publishedAt: Timestamp.fromDate(input.publishedAt),
    createdAt: Timestamp.now(),
  });
  const snapshot = await docRef.get();
  return articleRecordToArticle(
    snapshot.id,
    snapshot.data() as ArticleRecord,
  );
};

export const findArticleByUrl = async (url: string) => {
  const querySnapshot = await db
    .collection(COLLECTION)
    .where("url", "==", url)
    .limit(1)
    .get();

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return articleRecordToArticle(doc.id, doc.data() as ArticleRecord);
};

export const getArticlesPage = async ({
  startAfter,
  pageSize,
}: {
  startAfter?: Date;
  pageSize: number;
}) => {
  let query = db
    .collection(COLLECTION)
    .orderBy("publishedAt", "desc")
    .limit(pageSize);

  if (startAfter) {
    query = query.startAfter(Timestamp.fromDate(startAfter));
  }

  const snapshot = await query.get();

  const articles = snapshot.docs.map((doc) =>
    articleRecordToArticle(doc.id, doc.data() as ArticleRecord),
  );

  const lastArticle = articles.at(-1);

  return {
    articles,
    nextCursor: lastArticle?.publishedAt ?? null,
  } as const;
};

export const articleToDTO = (article: Article): ArticleDTO => ({
  id: article.id,
  headline: article.headline,
  summary: article.summary,
  url: article.url,
  source: article.source,
  publishedAt: article.publishedAt.toISOString(),
  createdAt: article.createdAt.toISOString(),
});

