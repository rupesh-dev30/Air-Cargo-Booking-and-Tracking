import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Flight } from './entities/flight.entity';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class FlightsService {
  constructor(
    @InjectRepository(Flight)
    private readonly flightRepo: Repository<Flight>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  private getDayBounds(date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  async findDirectFlights(
    origin: string,
    destination: string,
    departureDate: Date,
  ): Promise<Flight[]> {
    this.logger.info(
      `Searching direct flights from ${origin} to ${destination} on ${departureDate.toDateString()}`,
    );
    const { start, end } = this.getDayBounds(departureDate);
    const flights = await this.flightRepo.find({
      where: {
        origin,
        destination,
        departure_datetime: Between(start, end),
      },
    });

    this.logger.info(
      `Found ${flights.length} direct flights from ${origin} to ${destination}`,
    );

    return flights;
  }

  async getTransitFlights(
    origin: string,
    destination: string,
    departureDate: Date,
  ): Promise<Flight[][]> {
    this.logger.info(
      `Searching transit flights from ${origin} to ${destination} on ${departureDate.toDateString()}`,
    );
    const { start, end } = this.getDayBounds(departureDate);

    // First hop: origin → transit city
    const firstHops: Flight[] = await this.flightRepo.find({
      where: {
        origin,
        departure_datetime: Between(start, end),
      },
    });

    const routes: Flight[][] = [];

    for (const f1 of firstHops) {
      const layoverStart = new Date(f1.arrival_datetime);
      const layoverEnd = new Date(
        f1.arrival_datetime.getTime() + 24 * 60 * 60 * 1000,
      );

      const secondHops: Flight[] = await this.flightRepo.find({
        where: {
          origin: f1.destination,
          destination,
          departure_datetime: Between(layoverStart, layoverEnd),
        },
      });

      for (const f2 of secondHops) {
        routes.push([f1, f2]);
      }
    }
    this.logger.info(
      `Found ${routes.length} transit routes from ${origin} to ${destination}`,
    );
    return routes;
  }

  async getRoute(origin: string, destination: string, date: Date) {
    this.logger.info(
      `Fetching route from ${origin} to ${destination} on ${date.toDateString()}`,
    );
    const directFlights = await this.findDirectFlights(
      origin,
      destination,
      date,
    );
    const transitRoutes = await this.getTransitFlights(
      origin,
      destination,
      date,
    );

    const route = {
      direct: directFlights,
      transit: transitRoutes.length > 0 ? transitRoutes[0] : null,
    };

    this.logger.info(
      `Route fetch completed: ${directFlights.length} direct, ${transitRoutes.length} transit`,
    );

    return route;
  }
}
