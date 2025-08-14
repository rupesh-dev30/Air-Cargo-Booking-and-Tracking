import { BookingEvent } from 'src/bookings/entities/booking-event.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ default: 'BOOKED' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => BookingEvent, (event) => event.booking, {
    cascade: true,
  })
  events: BookingEvent[];
}
