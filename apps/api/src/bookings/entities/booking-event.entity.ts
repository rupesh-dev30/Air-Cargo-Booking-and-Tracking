import { Booking } from 'src/bookings/entities/booking.entity';
import { Flight } from 'src/flights/entities/flight.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity()
@Index('IDX_BOOKINGEVENT_BOOKING_CREATED', ['booking', 'created_at'])
export class BookingEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Booking, (booking) => booking.events)
  booking: Booking;

  @Column()
  event_type: string;

  @Column({ nullable: true })
  location: string;

  @ManyToOne(() => Flight, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  flight: Flight;

  @CreateDateColumn()
  created_at: Date;
}
