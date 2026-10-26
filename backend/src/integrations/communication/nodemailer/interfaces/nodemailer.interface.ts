import type { SendMailOptions } from "nodemailer";

export interface SendEmailOptions {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: SendMailOptions['attachments'];
}

export interface BulkEmailRecipient {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export interface SendBulkEmailsResult {
    sent: number;
    failed: number;
    errors: Array<{ to: string; error: string }>;
}