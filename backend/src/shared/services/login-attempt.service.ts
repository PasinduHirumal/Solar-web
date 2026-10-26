import { Injectable } from '@nestjs/common';

interface AttemptRecord {
    count: number;
    blockedUntil?: Date;
    tier: 1 | 2;           // which tier they're currently in
    tierStartedAt: Date;   // when the current tier window started
}

@Injectable()
export class LoginAttemptService {
    private readonly attempts = new Map<string, AttemptRecord>();

    // Tier config
    private readonly TIER1_LIMIT = 3;
    private readonly TIER1_WINDOW_MS = 60 * 1000;         // 1 minute
    private readonly TIER1_BLOCK_MS = 60 * 1000;          // block 1 minute

    private readonly TIER2_LIMIT = 3;
    private readonly TIER2_WINDOW_MS = 60 * 1000;         // 3 more attempts within 1 min
    private readonly TIER2_BLOCK_MS = 3 * 60 * 60 * 1000; // block 3 hours

    getRecord(email: string): AttemptRecord | undefined {
        return this.attempts.get(email);
    }

    // Returns: { blocked: true, retryAfter: Date } if blocked
    //          { blocked: false } if allowed
    checkBlock(email: string): { blocked: boolean; retryAfter?: Date; message?: string } {
        const record = this.attempts.get(email);
        if (!record?.blockedUntil) return { blocked: false };

        const now = new Date();
        if (record.blockedUntil > now) {
            const message = record.tier === 2
                ? 'Your account is locked for 3 hours due to too many failed attempts'
                : 'Too many attempts, please try again after 1 minute';

            return { blocked: true, retryAfter: record.blockedUntil, message };
        }

        // Block expired — move to next tier or clear
        if (record.tier === 1) {
            // Upgrade to tier 2 tracking: reset count, stay in tier 2
            record.tier = 2;
            record.count = 0;
            record.blockedUntil = undefined;
            record.tierStartedAt = new Date();
        } else {
            // Tier 2 block expired — full reset
            this.attempts.delete(email);
        }

        return { blocked: false };
    }

    // Call this on every failed login attempt.
    // Returns block info if a new block was just triggered.
    recordFailedAttempt(email: string): { blocked: boolean; retryAfter?: Date; message?: string } {
        const now = new Date();
        let record = this.attempts.get(email);

        if (!record) {
            record = { count: 0, tier: 1, tierStartedAt: now };
            this.attempts.set(email, record);
        }

        // Check if the current tier's window has expired (reset count if so)
        const windowMs = record.tier === 1 ? this.TIER1_WINDOW_MS : this.TIER2_WINDOW_MS;
        const windowExpired = (now.getTime() - record.tierStartedAt.getTime()) > windowMs;
        if (windowExpired && !record.blockedUntil) {
            record.count = 0;
            record.tierStartedAt = now;
        }

        record.count += 1;

        const limit = record.tier === 1 ? this.TIER1_LIMIT : this.TIER2_LIMIT;

        if (record.count >= limit) {
            const blockMs = record.tier === 1 ? this.TIER1_BLOCK_MS : this.TIER2_BLOCK_MS;
            record.blockedUntil = new Date(now.getTime() + blockMs);

            const message = record.tier === 2
                ? 'Your account is locked for 3 hours due to too many failed attempts'
                : 'Too many attempts, please try again after 1 minute';

            return { blocked: true, retryAfter: record.blockedUntil, message };
        }

        return { blocked: false };
    }

    /// Call this on successful login to clear the record
    clearRecord(email: string): void {
        this.attempts.delete(email);
    }
}