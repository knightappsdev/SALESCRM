import { Pool, PoolConfig } from 'pg';
import Redis from 'ioredis';

// PostgreSQL connection
const poolConfig: PoolConfig = {
  host: process.env.POSTGRE_SQL_INNER_HOST || '127.0.0.1',
  port: parseInt(process.env.POSTGRE_SQL_INNER_PORT || '5432'),
  user: process.env.POSTGRE_SQL_USER || 'postgres',
  password: process.env.POSTGRE_SQL_PASSWORD || 'HjHxCPcv',
  database: process.env.DATABASE_NAME || 'crm_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(poolConfig);

// Redis connection
export const redis = new Redis({
  host: process.env.REDIS_INNER_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_INNER_PORT || '6379'),
  password: process.env.REDISCLI_AUTH || 'oQIOigFK',
  maxRetriesPerRequest: 3,
});

// Test connections
export const testConnections = async () => {
  try {
    // Test PostgreSQL
    const client = await pool.connect();
    console.log('✓ PostgreSQL connected');
    client.release();

    // Test Redis
    await redis.ping();
    console.log('✓ Redis connected');
    
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Graceful shutdown
export const closeConnections = async () => {
  await pool.end();
  redis.disconnect();
  console.log('Database connections closed');
};