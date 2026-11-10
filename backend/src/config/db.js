const { Pool } = require("pg");

require("dotenv").config();

let pool;

const hasDbConfig = Boolean(
  process.env.DB_HOST || process.env.DATABASE_URL
);

if (hasDbConfig) {
  const ssl =
    process.env.DB_SSL?.toLowerCase() === "false"
      ? false
      : { rejectUnauthorized: false };

  pool = new Pool(
    process.env.DATABASE_URL
      ? {
          connectionString: process.env.DATABASE_URL,
          ssl,
        }
      : {
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          port: process.env.DB_PORT
            ? Number(process.env.DB_PORT)
            : 5432,
          ssl,
        }
  );
}

if (!pool) {
  console.warn(
    "[AI Studio] Database not configured — mock DB active"
  );

  pool = {
    query: async () => ({ rows: [] }),

    connect: async () => ({
      query: async () => ({
        rows: [
          {
            now: new Date().toISOString(),
          },
        ],
      }),

      release: () => {},
    }),
  };
}

/**
 * Execute a PostgreSQL query
 */
const query = async (text, params) => {
  return pool.query(text, params);
};

/**
 * Connect to PostgreSQL client (for transactions)
 */
const connect = async () => {
  return pool.connect();
};

/**
 * Test database connection
 */
const connectDB = async () => {
  if (!hasDbConfig) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Database configuration is required in production."
      );
    }

    console.log(
      "[AI Studio] No DB credentials provided. Mock database active."
    );
    return;
  }

  let client;

  try {
    client = await pool.connect();

    console.log("Database Connected");

    const result = await client.query(
      "SELECT NOW()"
    );

    console.log(result.rows[0]);
  } catch (error) {
    console.warn(
      "[AI Studio] Database connection failed:",
      error.message
    );
    throw error;
  } finally {
    client?.release();
  }
};

module.exports = {
  pool,
  query,
  connect,
  connectDB,
};
