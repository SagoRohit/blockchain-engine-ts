import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

interface UserRow {
    id: string;
    username: string;
    email: string;
    password_hash: string;
}

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
    constructor(
        private readonly db: DatabaseService,
        private readonly jwtService: JwtService,
    ) {}

    async register(dto: RegisterDto) {
        const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

        const user = await this.db.withTransaction(async (client) => {
            try {
                const result = await client.query<UserRow>(
                    `INSERT INTO users (username, email, password_hash)
                     VALUES ($1, $2, $3)
                     RETURNING id, username, email, password_hash`,
                    [dto.username, dto.email, passwordHash],
                );
                return result.rows[0];
            } catch (err) {
                if ((err as { code?: string }).code === '23505') {
                    throw new ConflictException('Username or email already in use');
                }
                throw err;
            }
        });

        return this.buildAuthResponse(user);
    }

    async login(dto: LoginDto) {
        const result = await this.db.query<UserRow>(
            'SELECT id, username, email, password_hash FROM users WHERE username = $1',
            [dto.username],
        );
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(dto.password, user.password_hash))) {
            throw new UnauthorizedException('Invalid username or password');
        }

        return this.buildAuthResponse(user);
    }

    private async buildAuthResponse(user: UserRow) {
        const accessToken = await this.jwtService.signAsync({
            userId: user.id,
            username: user.username,
        });

        return {
            accessToken,
            user: { id: user.id, username: user.username, email: user.email },
        };
    }
}
