import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { Repository } from 'typeorm';
import { BookingEvent } from 'src/bookings/entities/booking-event.entity';
import { BookingLockService } from 'src/shared/booking-lock.service';
import { randomBytes } from 'crypto';

/*
    BookingService → createBooking, departBooking, arriveBooking, cancelBooking, getBookingHistory

    FlightService → getDirectFlights, getTransitFlights

*/

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    @InjectRepository(BookingEvent)
    private eventRepo: Repository<BookingEvent>,
    private lockService: BookingLockService,
  ) {}

  private generateRefId(): string {
    return 'BK-' + randomBytes(4).toString('hex').toUpperCase();
  }

  async createBooking(data: Partial<Booking>) {
    const refId = this.generateRefId();
    // CREATE BOOKING
    const booking = this.bookingRepo.create({
      ...data,
      ref_id: refId,
      status: 'BOOKED',
    });
    await this.bookingRepo.save(booking);

    // CREATE INITIAL EVENT
    const event = this.eventRepo.create({
      booking,
      event_type: 'BOOKED',
      location: data.origin,
    });
    await this.eventRepo.save(event);

    return booking;
  }

  async departBooking(refId: string, location: string) {
    const lock = await this.lockService.acquireLock(refId);
    if (!lock) throw new Error('Booking is being updated, try again');

    try {
      const booking = await this.bookingRepo.findOne({
        where: { ref_id: refId },
      });

      if (!booking) throw new NotFoundException('Booking not found');

      if (booking.status === 'CANCELLED') {
        throw new Error('Booking is already canceled');
      }

      if (booking.status === 'ARRIVED') {
        throw new Error('Booking is already arrived');
      }

      booking.status = 'DEPARTED';
      await this.bookingRepo.save(booking);

      const event = this.eventRepo.create({
        booking,
        event_type: 'DEPARTED',
        location,
      });

      await this.eventRepo.save(event);

      return booking;
    } finally {
      await this.lockService.releaseLock(refId);
    }
  }

  async arriveBooking(refId: string, location: string) {
    const lock = await this.lockService.acquireLock(refId);
    if (!lock) throw new Error('Booking is being updated, try again');

    try {
      const booking = await this.bookingRepo.findOne({
        where: {
          ref_id: refId,
        },
      });

      if (!booking) throw new NotFoundException('Booking not found');

      if (booking.status === 'CANCELLED') {
        throw new Error('Booking is already canceled');
      }

      booking.status = 'ARRIVED';
      await this.bookingRepo.save(booking);

      const event = this.eventRepo.create({
        booking,
        event_type: 'ARRIVED',
        location,
      });
      await this.eventRepo.save(event);

      return booking;
    } finally {
      await this.lockService.releaseLock(refId);
    }
  }

  async cancelBooking(refId: string) {
    const lock = await this.lockService.acquireLock(refId);
    if (!lock) throw new Error('Booking is being updated, try again');

    try {
      const booking = await this.bookingRepo.findOne({
        where: {
          ref_id: refId,
        },
      });

      if (!booking) throw new NotFoundException('Booking not found');

      if (booking.status === 'CANCELLED') {
        throw new BadRequestException('Booking is already canceled');
      }

      if (booking.status === 'ARRIVED') {
        throw new Error('Cannot cancel after arrival');
      }

      booking.status = 'CANCELLED';
      await this.bookingRepo.save(booking);

      const event = this.eventRepo.create({
        booking,
        event_type: 'CANCELLED',
        location: booking.origin,
      });
      await this.eventRepo.save(event);

      return booking;
    } finally {
      await this.lockService.releaseLock(refId);
    }
  }

  async getBookingHistory(refId: string) {
    const booking = await this.bookingRepo.findOne({
      where: { ref_id: refId },
      relations: ['events'],
    });

    if (!booking) throw new NotFoundException('Booking not found');

    booking.events.sort(
      (a, b) => a.created_at.getTime() - b.created_at.getTime(),
    );

    return booking;
  }
}
