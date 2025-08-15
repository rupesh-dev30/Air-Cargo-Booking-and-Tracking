import { Controller, Get, Query } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { FlightQueryDto } from './dto/flight-query.dto';

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get('direct')
  async getDirectFlights(@Query() query: FlightQueryDto) {
    return this.flightsService.findDirectFlights(
      query.origin,
      query.destination,
      new Date(query.date),
    );
  }

  @Get('transit')
  async getTransitFlights(@Query() query: FlightQueryDto) {
    return this.flightsService.getTransitFlights(
      query.origin,
      query.destination,
      new Date(query.date),
    );
  }

  @Get('route')
  async getRoute(@Query() query: FlightQueryDto) {
    return this.flightsService.getRoute(
      query.origin,
      query.destination,
      new Date(query.date),
    );
  }
}
