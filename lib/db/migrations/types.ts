import type { SQLiteDatabase } from 'expo-sqlite';

export type DbMigration = {
  version: number;
  name: string;
  up: (db: SQLiteDatabase) => Promise<void>;
};
