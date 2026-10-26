import { Module } from "@nestjs/common";
import { GoogleOAuthProvider } from "./google.provider";
import { GoogleOAuthService } from "./google.service";

@Module({
    providers: [
        GoogleOAuthProvider,
        GoogleOAuthService,
    ],
    exports: [GoogleOAuthService],
})

export class GoogleOAuthModule {}