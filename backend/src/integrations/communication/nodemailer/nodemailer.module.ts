import { Module } from "@nestjs/common";
import { NodemailerProvider } from "./nodemailer.provider";
import { NodemailerService } from "./nodemailer.service";

@Module({
    providers: [
        NodemailerProvider,
        NodemailerService,
    ],
    exports: [NodemailerService],
})

export class NodemailerModule {}