import {
    Request,
    Controller,
    Post,
    Body,
    UseGuards,
    Get,
    Query,
    UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityLoggerInterceptor } from 'src/interceptors/activity-logger.interceptor';
import { LoginDto } from '../dto/login.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ActivityLogService } from '../services/activity-log.service';


@ApiTags('Auth')
@UseInterceptors(ActivityLoggerInterceptor)
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly activityLogService: ActivityLogService,
    ) { }

    //! Testing
    // @Get('test-activity-log')
    // @UseGuards(JwtAuthGuard)
    // async testActivityLog(@Request() req) {
    //     return { message: 'This should be logged!' };
    // }

    // @Get('my-activity-logs')
    // @UseGuards(JwtAuthGuard)
    // async getMyActivityLogs(@Request() req) {
    //     const logs = await this.activityLogService.findByUser(req.user.id);

    //     // Parse the details field from string to JSON if it's a string
    //     const formattedLogs = logs.map(log => ({
    //         ...log,
    //         details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details, // Ensure it's a string before parsing
    //     }));

    //     return formattedLogs;
    // }




    @ApiOperation({ summary: 'User login' })
    @ApiResponse({ status: 200, description: 'User successfully logged in.' })
    @ApiResponse({ status: 401, description: 'Invalid credentials.' })
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @ApiOperation({ summary: 'Refresh JWT token' })
    @ApiBody({ schema: { example: { refresh_token: 'your_refresh_token_here' } } })
    @ApiResponse({ status: 200, description: 'Token successfully refreshed.' })
    @ApiResponse({ status: 401, description: 'Invalid refresh token.' })
    @Post('refresh')
    async refresh(@Body('refresh_token') refreshToken: string) {
        return this.authService.refreshToken(refreshToken);
    }

    @ApiOperation({ summary: 'Request password reset' })
    @ApiBody({ schema: { example: { email: 'user@example.com' } } })
    @ApiResponse({ status: 200, description: 'Password reset email sent.' })
    @ApiResponse({ status: 404, description: 'Email not found.' })
    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string) {
        await this.authService.forgotPassword(email);
        return { message: 'Password reset email sent' };
    }

    @ApiOperation({ summary: 'Reset password using the provided token' })
    @ApiResponse({ status: 200, description: 'Password successfully reset.' })
    @ApiResponse({ status: 400, description: 'Invalid reset token or password.' })
    @Post('reset-password')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        await this.authService.resetPassword(resetPasswordDto);
        return { message: 'Password successfully reset' };
    }

    @ApiOperation({ summary: 'Verify email using a token' })
    @ApiQuery({ name: 'token', description: 'Email verification token', required: true })
    @ApiResponse({ status: 200, description: 'Email successfully verified.' })
    @ApiResponse({ status: 400, description: 'Invalid or expired token.' })
    @Get('verify-email')
    async verifyEmail(@Query('token') token: string) {
        await this.authService.verifyEmail(token);
        return { message: 'Email successfully verified' };
    }
}
