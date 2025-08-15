import { BookingEvent } from 'src/bookings/entities/booking-event.entity';
import { Flight } from 'src/flights/entities/flight.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BookingStatus {
  BOOKED = 'BOOKED',
  DEPARTED = 'DEPARTED',
  ARRIVED = 'ARRIVED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('IDX_BOOKING_REFID')
  @Column({ unique: true })
  ref_id: string;

  @Column()
  origin: string;

  @Column()
  destination: string;

  @Column()
  pieces: number;

  @Column()
  weight_kg: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.BOOKED,
  })
  status: BookingStatus;

  @ManyToOne(() => Flight, (flight) => flight.bookings, { eager: true })
  flight: Flight;

  @OneToMany(() => BookingEvent, (event) => event.booking, {
    cascade: true,
  })
  events: BookingEvent[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
