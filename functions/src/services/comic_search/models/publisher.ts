import { firestore } from "firebase/app";

export type Publisher = {
  id?: string;
  name: string;
  nameReading: string | null;
  website: string | null;
  created_at: firestore.Timestamp | null;
  updateted_at: firestore.Timestamp | null;
}