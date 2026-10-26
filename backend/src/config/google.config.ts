import { registerAs } from '@nestjs/config';

export default registerAs('google', () => ({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    client_redirect_url: process.env.GOOGLE_REDIRECT_URL,
}));