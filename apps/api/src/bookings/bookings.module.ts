import { Module } from '@nestjs/common';
import { BookingController } from './bookings.controller';
import { BookingService } from './bookings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { BookingEvent } from 'src/bookings/entities/booking-event.entity';
import { BookingLockService } from 'src/shared/booking-lock.service';
import { RedisModule } from 'src/shared/redis.module';
import { Flight } from 'src/flights/entities/flight.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, BookingEvent, Flight]),
    RedisModule,
  ],
  controllers: [BookingController],
  providers: [BookingService, BookingLockService],
})
export class BookingModule {}
