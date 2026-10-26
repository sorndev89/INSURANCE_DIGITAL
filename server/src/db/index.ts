import { env } from '../config/env.js';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema.js';

export const dbPool = mysql.createPool({
  uri: env.databaseUrl,
  connectionLimit: Number(process.env.DB_POOL_SIZE || 10),
});

export const db = drizzle(dbPool, { schema, mode: 'default' });

export const closeDb = () => dbPool.end();

export type Database = typeof db;
export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];
