import { Request, Response, NextFunction } from 'express';
import { UserProfile } from '../types/user.js';
declare global {
    namespace Express {
        interface Request {
            user?: UserProfile;
        }
    }
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map