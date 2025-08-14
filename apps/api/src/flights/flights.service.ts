import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Flight } from './entities/flight.entity';

@Injectable()
export class FlightsService {
  constructor(
    @InjectRepository(Flight)
    private flightRepo: Repository<Flight>,
  ) {}

  async findDirectFlights(
    origin: string,
    destination: string,
    departureDate: Date,
  ) {
    const startOfDay = new Date(departureDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(departureDate);
    endOfDay.setHours(23, 59, 59, 999);

    return this.flightRepo.find({
      where: {
        origin,
        destination,
        departure_datetime: Between(startOfDay, endOfDay),
      },
    });
  }

  async getTransitFlights(
    origin: string,
    destination: string,
    departureDate: Date,
  ) {
    const startOfDay = new Date(departureDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(departureDate);
    endOfDay.setHours(23, 59, 59, 999);

    // First hop: origin → transit city
    const firstHops = await this.flightRepo.find({
      where: {
        origin,
        departure_datetime: Between(startOfDay, endOfDay),
      },
    });

    const routes: Flight[][] = [];

    for (const f1 of firstHops) {
      // Second hop: same day or next day after f1.arrival
      const start = f1.arrival_datetime;
      const end = new Date(f1.arrival_datetime.getTime() + 24 * 60 * 60 * 1000);

      const secondHops = await this.flightRepo.find({
        where: {
          origin: f1.destination,
          destination,
          departure_datetime: Between(start, end),
        },
      });

      for (const f2 of secondHops) {
        routes.push([f1, f2]);
      }
    }

    return routes;
  }

  async getRoute(origin: string, destination: string, date: Date) {
    // 1. Direct flights
    const directFlights = await this.findDirectFlights(
      origin,
      destination,
      date,
    );

    // 2. Transit flights (only 1 route needed, so pick the first match)
    const transitRoutes = await this.getTransitFlights(
      origin,
      destination,
      date,
    );
    const oneTransitRoute = transitRoutes.length > 0 ? transitRoutes[0] : null;

    return {
      direct: directFlights,
      transit: oneTransitRoute,
    };
  }
}
