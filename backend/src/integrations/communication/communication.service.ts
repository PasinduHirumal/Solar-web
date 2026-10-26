import { Injectable, Logger } from '@nestjs/common';
import { NodemailerService } from './nodemailer/nodemailer.service';
import { ConfigService } from '@nestjs/config';
import { OriginUrlService } from '../../shared/services/origins.service';
import { UserRole } from '../../modules/identity/enums/user.enum';

@Injectable()
export class CommunicationService {
    private readonly logger = new Logger(CommunicationService.name);

    constructor(
        private readonly nodemailerService: NodemailerService,
        private readonly configService: ConfigService,
        private readonly originUrlService: OriginUrlService,
    ) {}

    async sendResetPasswordToken(email: string, role: UserRole, token: string): Promise<any> {
        const urls = this.originUrlService.getPanelUrls();
        const targetUrl = this.originUrlService.resolveTargetUrl(role, urls);

        const APP_NAME = this.configService.get<string>('APP_NAME');
        const resetPath = this.configService.get<string>('RESET_PASSWORD_PATH');

        // Reset URL
        const resetUrl = `${targetUrl}${resetPath}?token=${token}`;

        await this.nodemailerService.sendEmail({
            to: email,
            subject: `Reset Your Password - ${APP_NAME}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>Password Reset Request</h2>
                    <p>You requested to reset your password. Click the link below to create a new password:</p>
                    <p><a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">Reset Password</a></p>
                    <p><strong>Important:</strong></p>
                    <ul>
                        <li>This link expires in 15 minutes</li>
                        <li>If you didn't request this, please ignore this email</li>
                    </ul>
                    <p>If the button doesn't work, copy this link: <br><code>${resetUrl}</code></p>
                    <hr>
                    <p style="font-size: 12px; color: #666;">This is an automated email, please do not reply.</p>
                </div>
            `,
        });

        this.logger.log(`Password reset email sent to: ${email}`);
    }

    async sendWelcomeEmail(email: string, name: string, role: UserRole): Promise<any> {
        const urls = this.originUrlService.getPanelUrls();
        const targetUrl = this.originUrlService.resolveTargetUrl(role, urls);

        const APP_NAME = this.configService.get<string>('APP_NAME');
        const loginPath = this.configService.get<string>('LOGIN_PATH');

        const loginUrl = `${targetUrl}${loginPath}`;

        await this.nodemailerService.sendEmail({
            to: email,
            subject: `Welcome to ${APP_NAME}, ${name}!`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>Welcome, ${name}!</h2>
                    <p>Your account has been created successfully. We're glad to have you on board.</p>
                    <p><a href="${loginUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">Go to ${APP_NAME}</a></p>
                    <hr>
                    <p style="font-size: 12px; color: #666;">This is an automated email, please do not reply.</p>
                </div>
            `,
        });

        this.logger.log(`Welcome email sent to: ${email}`);
    }
}
