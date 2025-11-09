import { FirebaseApp, FirebaseOptions, getApps, initializeApp } from "firebase/app";
import {
  Firestore,
  Timestamp,
  collection,
  getFirestore,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";

const getClientConfig = (): FirebaseOptions => {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  if (Object.values(config).some((value) => !value)) {
    throw new Error(
      "Missing NEXT_PUBLIC_FIREBASE_* environment variables for client SDK.",
    );
  }

  return config as Record<string, string> as FirebaseOptions;
};

let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;

export const getFirebaseApp = () => {
  if (!app) {
    app = getApps().length ? getApps()[0] : initializeApp(getClientConfig());
  }
  return app;
};

export const getDb = () => {
  if (!firestore) {
    firestore = getFirestore(getFirebaseApp());
  }
  return firestore;
};

export const fetchArticlesClient = async ({
  pageSize,
  startAfterDate,
}: {
  pageSize: number;
  startAfterDate?: Date;
}) => {
  const db = getDb();
  const articlesCollection = collection(db, "articles");

  let firestoreQuery = query(
    articlesCollection,
    orderBy("publishedAt", "desc"),
    limit(pageSize),
  );

  if (startAfterDate) {
    firestoreQuery = query(
      articlesCollection,
      orderBy("publishedAt", "desc"),
      startAfter(Timestamp.fromDate(startAfterDate)),
      limit(pageSize),
    );
  }

  const snapshot = await getDocs(firestoreQuery);
  const articles = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Record<string, unknown>),
  }));

  return {
    articles,
    nextCursor: snapshot.docs.at(-1)?.data()?.publishedAt || null,
  };
};

