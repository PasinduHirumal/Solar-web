export default () => ({
    PORT: parseInt(process.env.PORT ?? '5000', 10),
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    
    APP_URL: process.env.APP_URL ?? undefined,
    APP_NAME: process.env.APP_NAME ?? 'Solar-Web',
    APP_CURRENCY: process.env.APP_CURRENCY ?? 'LKR',
    
    JWT_SECRET: process.env.JWT_SECRET,

    LOGIN_PATH: process.env.LOGIN_PATH ?? '/login',
    RESET_PASSWORD_PATH: process.env.RESET_PASSWORD_PATH ?? '/reset-password',

    database: {
        host: process.env.DB_HOST ?? '127.0.0.1',
        port: parseInt(process.env.DB_PORT ?? '3306', 10),
        user: process.env.DB_USER ?? 'root',
        password: process.env.DB_PASSWORD ?? '',
        name: process.env.DB_NAME ?? 'test',
    },
    
    origins: {
        production: {
            url: process.env.PRODUCTION_WEB_URL || undefined,
        },
        development: {
            url: process.env.DEVELOPMENT_WEB_URL || 'http://localhost:5173',
        },
    },

    admin: {
        name: process.env.ADMIN_NAME ?? 'Super Admin',
        email: process.env.ADMIN_EMAIL ?? 'admin@gmail.com',
        password: process.env.ADMIN_PASSWORD ?? 'ChangeMe@123'
    },
})