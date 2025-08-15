import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Repository } from 'typeorm';
import { BookingEvent } from './entities/booking-event.entity';
import { randomBytes } from 'crypto';
import { Flight } from 'src/flights/entities/flight.entity';
import { BookingLockService } from 'src/shared/booking-lock.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    @InjectRepository(Flight)
    private flightRepo: Repository<Flight>,
    @InjectRepository(BookingEvent)
    private eventRepo: Repository<BookingEvent>,
    private lockService: BookingLockService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  private generateRefId(): string {
    return 'BK-' + randomBytes(4).toString('hex').toUpperCase();
  }

  private async getLastEvent(bookingId: number) {
    return this.eventRepo.findOne({
      where: { booking: { id: bookingId } },
      order: { created_at: 'DESC' },
    });
  }

  async createBooking(data: {
    flight_id: number;
    pieces: number;
    weight_kg: number;
  }) {
    const { flight_id, pieces, weight_kg } = data;
    this.logger.info(
      `Creating booking for flight ${flight_id}, pieces: ${pieces}, weight: ${weight_kg}kg`,
    );

    // 1. Find flight
    const flight = await this.flightRepo.findOne({ where: { id: flight_id } });
    if (!flight) {
      this.logger.warn(`Flight ${flight_id} not found`);
      throw new NotFoundException('Flight not found');
    }

    // 2. Build booking (not yet saved)
    const booking = this.bookingRepo.create({
      ref_id: this.generateRefId(),
      status: BookingStatus.BOOKED,
      origin: flight.origin,
      destination: flight.destination,
      pieces,
      weight_kg,
      flight,
    });

    // 3. Persist booking + initial event in a transaction
    const saved = await this.bookingRepo.manager.transaction(
      async (manager) => {
        const savedBooking = await manager.save(Booking, booking);

        const event = manager.create(BookingEvent, {
          booking: savedBooking,
          flight,
          event_type: BookingStatus.BOOKED,
          location: flight.origin,
        });
        await manager.save(BookingEvent, event);
        return savedBooking;
      },
    );

    this.logger.info(
      `Booking ${saved.ref_id} created successfully from ${flight.origin} to ${flight.destination}`,
    );
    return saved;
  }

  async departBooking(refId: string, location: string) {
    this.logger.info(`Attempting to depart booking ${refId} from ${location}`);
    const lock = await this.lockService.acquireLock(refId);
    if (!lock) {
      this.logger.warn(`Failed to acquire lock for booking ${refId}`);
      throw new BadRequestException('Booking is being updated, try again');
    }

    try {
      const booking = await this.bookingRepo.findOne({
        where: { ref_id: refId },
        relations: ['flight', 'events'],
      });
      if (!booking) {
        this.logger.warn(`Booking ${refId} not found`);
        throw new NotFoundException('Booking not found');
      }

      // enforce allowed transition
      if (booking.status !== BookingStatus.BOOKED) {
        throw new BadRequestException(
          `Cannot depart booking in status ${booking.status}. Expected: ${BookingStatus.BOOKED}`,
        );
      }

      // prevent duplicate depart from same location
      const last = await this.getLastEvent(booking.id);
      if (
        last?.event_type === BookingStatus.DEPARTED &&
        last.location === location
      ) {
        throw new BadRequestException('Already departed from this location');
      }

      booking.status = BookingStatus.DEPARTED;
      await this.bookingRepo.save(booking);

      const event = this.eventRepo.create({
        booking,
        flight: booking.flight,
        event_type: BookingStatus.DEPARTED,
        location,
      });
      await this.eventRepo.save(event);

      this.logger.info(
        `Booking ${refId} departed successfully from ${location}`,
      );
      return booking;
    } finally {
      await this.lockService.releaseLock(refId);
    }
  }

  async arriveBooking(refId: string, location: string) {
    this.logger.info(
      `Attempting to mark booking ${refId} as arrived at ${location}`,
    );
    const lock = await this.lockService.acquireLock(refId);
    if (!lock)
      throw new BadRequestException('Booking is being updated, try again');

    try {
      const booking = await this.bookingRepo.findOne({
        where: { ref_id: refId },
        relations: ['flight', 'events'],
      });
      if (!booking) {
        this.logger.warn(`Booking ${refId} not found`);
        throw new NotFoundException('Booking not found');
      }

      // enforce allowed transition
      if (booking.status !== BookingStatus.DEPARTED) {
        throw new BadRequestException(
          `Cannot mark as arrived when booking status is ${booking.status}. Expected: ${BookingStatus.DEPARTED}`,
        );
      }

      // prevent duplicate arrive at same location
      const last = await this.getLastEvent(booking.id);
      if (
        last?.event_type === BookingStatus.ARRIVED &&
        last.location === location
      ) {
        throw new BadRequestException('Already arrived at this location');
      }

      booking.status = BookingStatus.ARRIVED;
      await this.bookingRepo.save(booking);

      const event = this.eventRepo.create({
        booking,
        flight: booking.flight,
        event_type: BookingStatus.ARRIVED,
        location,
      });
      await this.eventRepo.save(event);
      this.logger.info(`Booking ${refId} arrived successfully at ${location}`);

      return booking;
    } finally {
      await this.lockService.releaseLock(refId);
    }
  }

  async cancelBooking(refId: string) {
    this.logger.info(`Attempting to cancel booking ${refId}`);
    const lock = await this.lockService.acquireLock(refId);
    if (!lock)
      throw new BadRequestException('Booking is being updated, try again');

    try {
      const booking = await this.bookingRepo.findOne({
        where: { ref_id: refId },
        relations: ['flight', 'events'],
      });
      if (!booking) {
        this.logger.warn(`Booking ${refId} not found`);
        throw new NotFoundException('Booking not found');
      }

      if (booking.status === BookingStatus.CANCELLED) {
        throw new BadRequestException('Booking is already canceled');
      }
      if (booking.status === BookingStatus.ARRIVED) {
        throw new BadRequestException('Cannot cancel after arrival');
      }

      booking.status = BookingStatus.CANCELLED;
      await this.bookingRepo.save(booking);

      const event = this.eventRepo.create({
        booking,
        flight: booking.flight,
        event_type: BookingStatus.CANCELLED,
        location: booking.origin,
      });
      await this.eventRepo.save(event);
      this.logger.info(`Booking ${refId} cancelled successfully`);

      return booking;
    } finally {
      await this.lockService.releaseLock(refId);
    }
  }

  async getBookingHistory(refId: string) {
    this.logger.info(`Fetching booking history for ${refId}`);
    const booking = await this.bookingRepo.findOne({
      where: { ref_id: refId },
      relations: ['flight', 'events', 'events.flight'],
    });
    if (!booking) {
      this.logger.warn(`Booking ${refId} not found`);
      throw new NotFoundException('Booking not found');
    }

    booking.events = (booking.events || []).sort(
      (a, b) => a.created_at.getTime() - b.created_at.getTime(),
    );
    this.logger.info(`Booking history fetched successfully for ${refId}`);

    return booking;
  }
}
