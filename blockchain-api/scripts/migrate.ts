// Hand-rolled migration runner (no migration framework): applies every
// .sql file in migrations/, in filename order, that isn't already recorded
// in schema_migrations. Each file runs inside its own transaction.
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';
import 'dotenv/config';

async function main() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();

    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                filename    TEXT PRIMARY KEY,
                applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
            );
        `);

        const migrationsDir = join(__dirname, '..', 'migrations');
        const files = readdirSync(migrationsDir)
            .filter((f) => f.endsWith('.sql'))
            .sort();

        const { rows } = await client.query<{ filename: string }>(
            'SELECT filename FROM schema_migrations',
        );
        const applied = new Set(rows.map((r) => r.filename));

        for (const file of files) {
            if (applied.has(file)) {
                console.log(`skip  ${file} (already applied)`);
                continue;
            }

            const sql = readFileSync(join(migrationsDir, file), 'utf8');

            try {
                await client.query('BEGIN');
                await client.query(sql);
                await client.query(
                    'INSERT INTO schema_migrations (filename) VALUES ($1)',
                    [file],
                );
                await client.query('COMMIT');
                console.log(`apply ${file}`);
            } catch (err) {
                await client.query('ROLLBACK');
                throw new Error(`Migration ${file} failed: ${(err as Error).message}`);
            }
        }
    } finally {
        client.release();
        await pool.end();
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
