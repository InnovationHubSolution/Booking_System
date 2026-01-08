import 'express-session';

declare module 'express-session' {
    interface SessionData {
        csrfToken?: string;
    }
}

declare module 'express-serve-static-core' {
    interface Request {
        rateLimit?: {
            limit: number;
            current: number;
            remaining: number;
            resetTime: Date;
        };
    }
}
