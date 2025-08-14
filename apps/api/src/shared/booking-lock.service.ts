import { Inject, Injectable } from '@nestjs/common';
import * as redis from 'redis';

@Injectable()
export class BookingLockService {
  constructor(
    @Inject('REDIS_CLIENT') private redisClient: redis.RedisClientType,
  ) {}

  async acquireLock(refId: string) {
    return this.redisClient.set(`booking_lock_${refId}`, 'locked', {
      NX: true,
      EX: 5,
    });
  }

  async releaseLock(refId: string) {
    return this.redisClient.del(`booking_lock_${refId}`);
  }
}
