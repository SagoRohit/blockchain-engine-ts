import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @ApiOperation({ summary: 'Register a new user account' })
    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Public()
    @ApiOperation({ summary: 'Log in and receive a JWT access token' })
    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }
}
