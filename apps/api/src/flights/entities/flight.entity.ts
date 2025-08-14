import { Booking } from 'src/bookings/entities/booking.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
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
