import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
    private readonly pool: Pool;

    constructor(config: ConfigService) {
        this.pool = new Pool({
            connectionString: config.get<string>('DATABASE_URL'),
        });
    }

    // Read-only convenience helper. Never use this for INSERT/UPDATE/DELETE:
    // those must go through withTransaction() for explicit COMMIT/ROLLBACK.
    query<T extends QueryResultRow = QueryResultRow>(
        text: string,
        params?: unknown[],
    ): Promise<QueryResult<T>> {
        return this.pool.query<T>(text, params);
    }

    // Wraps every write path in an explicit BEGIN / COMMIT / ROLLBACK,
    // as the checklist's "Explicit Transaction Control" requirement demands
    // for every DML operation.
    async withTransaction<T>(
        fn: (client: PoolClient) => Promise<T>,
    ): Promise<T> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await fn(client);
            await client.query('COMMIT');
            return result;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async onModuleDestroy() {
        await this.pool.end();
    }
}
