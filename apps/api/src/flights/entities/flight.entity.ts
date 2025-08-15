import { Booking } from 'src/bookings/entities/booking.entity';
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@Index('IDX_FLIGHT_ROUTE_DATE', ['origin', 'destination', 'departure_datetime'])
@Index('IDX_FLIGHT_DEPARTURE_DATE', ['departure_datetime'])
@Index('IDX_FLIGHT_UNIQUE', ['flight_number', 'departure_datetime'], {
  unique: true,
})
export class Flight {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  flight_number: string;

  @Column()
  airline_name: string;

  @Column()
  departure_datetime: Date;

  @Column()
  arrival_datetime: Date;

  @Column()
  origin: string;

  @Column()
  destination: string;

  @OneToMany(() => Booking, (booking) => booking.flight)
  bookings: Booking[];
}
