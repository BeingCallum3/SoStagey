export type Article = {
  id: string;
  headline: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: Date;
  createdAt: Date;
};

export type ArticleRecord = {
  headline: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: FirebaseFirestore.Timestamp;
  createdAt: FirebaseFirestore.Timestamp;
};

export type CreateArticleInput = {
  headline: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: Date;
};

export type ArticleDTO = {
  id: string;
  headline: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  createdAt: string;
};

