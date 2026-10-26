import type { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise';

const LOCK_NAME = 'saiyfon:db-doctor';

type LockRow = RowDataPacket & { acquired: number | null };

export const withDatabaseLock = async <T>(
  pool: Pool,
  timeoutMs: number,
  task: (connection: PoolConnection) => Promise<T>,
): Promise<T> => {
  const connection = await pool.getConnection();
  const timeoutSeconds = Math.max(1, Math.ceil(timeoutMs / 1000));

  try {
    const [rows] = await connection.query<LockRow[]>(
      'SELECT GET_LOCK(?, ?) AS acquired',
      [LOCK_NAME, timeoutSeconds],
    );
    if (Number(rows[0]?.acquired) !== 1) {
      throw new Error(
        `Could not acquire DB doctor lock within ${timeoutSeconds}s. Another deploy may be running.`,
      );
    }

    return await task(connection);
  } finally {
    try {
      await connection.query('SELECT RELEASE_LOCK(?)', [LOCK_NAME]);
    } catch {
      // The connection closing also releases the lock.
    }
    connection.release();
  }
};
