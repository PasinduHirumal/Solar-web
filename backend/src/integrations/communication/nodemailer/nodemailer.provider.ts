import { ConfigService } from "@nestjs/config";
import { Transporter } from "nodemailer";
import * as nodemailer from "nodemailer";

export const NodemailerProvider = {
    provide: 'NODEMAILER',
    inject: [ConfigService],
    useFactory: (configService: ConfigService): Transporter => {
        const transporter = nodemailer.createTransport({
        host: configService.get<string>('smtp.host'),
        port: configService.get<number>('smtp.port'),
        secure: false,
        auth: {
            user: configService.get<string>('smtp.user'),
            pass: configService.get<string>('smtp.password'),
        },
        });

        return transporter;
    }
};