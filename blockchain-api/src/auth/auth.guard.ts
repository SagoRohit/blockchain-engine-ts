import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './public.decorator';

// Registered globally in AppModule (APP_GUARD), so authentication is
// checked before processing every request — the checklist's "Authentication
// Validation on Every Page" requirement — with read-only explorer pages
// explicitly allow-listed via @Public().
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request);

        if (!token) {
            throw new UnauthorizedException('Missing authentication token');
        }

        try {
            request.user = await this.jwtService.verifyAsync(token);
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }

        return true;
    }

    private extractToken(request: {
        headers: Record<string, string | undefined>;
    }): string | undefined {
        const header = request.headers.authorization;
        if (!header) return undefined;
        const [type, token] = header.split(' ');
        return type === 'Bearer' ? token : undefined;
    }
}
