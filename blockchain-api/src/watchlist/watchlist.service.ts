import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface WatchlistRow {
    id: string;
    user_id: string;
    watched_address: string;
    created_at: Date;
}

@Injectable()
export class WatchlistService {
    constructor(private readonly db: DatabaseService) {}

    async add(userId: string, address: string) {
        try {
            const { rows } = await this.db.withTransaction((client) =>
                client.query<WatchlistRow>(
                    `INSERT INTO watchlist (user_id, watched_address)
                     VALUES ($1, $2)
                     RETURNING id, user_id, watched_address, created_at`,
                    [userId, address],
                ),
            );
            return rows[0];
        } catch (err) {
            if ((err as { code?: string }).code === '23505') {
                throw new ConflictException('Address already on watchlist');
            }
            throw err;
        }
    }

    async remove(userId: string, address: string) {
        const { rowCount } = await this.db.withTransaction((client) =>
            client.query(
                'DELETE FROM watchlist WHERE user_id = $1 AND watched_address = $2',
                [userId, address],
            ),
        );
        if (!rowCount) {
            throw new NotFoundException('Address not on watchlist');
        }
        return { message: 'Removed from watchlist' };
    }

    async list(userId: string) {
        const { rows } = await this.db.query<WatchlistRow>(
            'SELECT * FROM watchlist WHERE user_id = $1 ORDER BY created_at',
            [userId],
        );
        return rows;
    }
}
