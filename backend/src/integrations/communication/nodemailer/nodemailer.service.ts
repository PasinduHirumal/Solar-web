import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Transporter } from "nodemailer";
import { BulkEmailRecipient, SendBulkEmailsResult, SendEmailOptions } from "./interfaces/nodemailer.interface";

@Injectable()
export class NodemailerService {
    private readonly logger = new Logger(NodemailerService.name);
    
    constructor(
        @Inject('NODEMAILER')
        private readonly transporter: Transporter,
        
        private readonly configService: ConfigService
    ) {}

    async sendEmail(options: SendEmailOptions): Promise<void> {
        try {
            const mailOptions = {
                from: this.configService.get<string>('smtp.from'),
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
                cc: options.cc,
                bcc: options.bcc,
                attachments: options.attachments,
            };

            const result = await this.transporter.sendMail(mailOptions);
            
            this.logger.log(`Email sent successfully → messageId=${result.messageId}`)
        } catch (error) {
            this.logger.error(
                `Failed to send email → to=${options.to}, subject="${options.subject}"`,
                error instanceof Error ? error.stack : undefined
            );

            throw error;
        }
    }

    async sendBulkEmails( recipients: BulkEmailRecipient[], options?: { batchSize?: number }): Promise<SendBulkEmailsResult> {
        const batchSize = options?.batchSize ?? 20;

        let sent = 0;
        let failed = 0;
        const errors: Array<{ to: string; error: string }> = [];

        for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = recipients.slice(i, i + batchSize);

            const results = await Promise.allSettled(
                batch.map((recipient) => this.sendEmail(recipient)),
            );

            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    sent++;
                } else {
                    failed++;
                    errors.push({
                        to: batch[index].to,
                        error: result.reason instanceof Error ? result.reason.message : String(result.reason),
                    });
                }
            });
        }

        this.logger.log(`Bulk email complete → sent=${sent}, failed=${failed}, total=${recipients.length}`);

        return { sent, failed, errors };
    }
}