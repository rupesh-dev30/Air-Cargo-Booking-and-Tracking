import { Controller, Get, Query } from '@nestjs/common';
import { FlightsService } from './flights.service';

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get('direct')
  async getDirectFlights(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
    @Query('date') date: string,
  ) {
    return this.flightsService.findDirectFlights(
      origin,
      destination,
      new Date(date),
    );
  }

  @Get('transit')
  async getTransitFlights(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
    @Query('date') date: string,
  ) {
    return this.flightsService.getTransitFlights(
      origin,
      destination,
      new Date(date),
    );
  }

  @Get('route')
  async getRoute(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
    @Query('date') date: string,
  ) {
    return this.flightsService.getRoute(origin, destination, new Date(date));
  }
}
