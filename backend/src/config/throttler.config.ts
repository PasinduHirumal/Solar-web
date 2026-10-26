import { ConfigService } from '@nestjs/config';
import { seconds, minutes, hours, ThrottlerModuleOptions } from '@nestjs/throttler';

export const getThrottlerConfig = (configService: ConfigService): ThrottlerModuleOptions => [
    {
        name: 'burst',
        ttl: seconds(1),
        limit: configService.get<number>('THROTTLE_BURST_LIMIT', 10),
    },
    {
        name: 'sustained',
        ttl: minutes(1),
        limit: configService.get<number>('THROTTLE_SUSTAINED_LIMIT', 100),
        blockDuration: seconds(5),
    },
    {
        name: 'hourly',
        ttl: hours(1),
        limit: configService.get<number>('THROTTLE_HOURLY_LIMIT', 2000),
        blockDuration: minutes(1),
    },
];