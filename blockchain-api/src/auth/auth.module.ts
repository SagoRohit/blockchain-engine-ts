import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Module({
    imports: [
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: config.get<string>('JWT_EXPIRES_IN', '1h') as `${number}${'s' | 'm' | 'h' | 'd'}`,
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        { provide: APP_GUARD, useClass: AuthGuard },
    ],
})
export class AuthModule {}
