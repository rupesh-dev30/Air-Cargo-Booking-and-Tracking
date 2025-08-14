import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { BookingService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { DepartBookingDto } from './dto/depart-booking.dto';
import { ArriveBookingDto } from './dto/arrive-booking.dto';

@Controller('bookings')
export class BookingController {
  constructor(private bookingsService: BookingService) {}

  @Post()
  async createBooking(@Body() body: CreateBookingDto) {
    return this.bookingsService.createBooking(body);
  }

  @Patch(':refId/depart')
  async departBooking(
    @Param('refId') refId: string,
    @Body() body: DepartBookingDto,
  ) {
    return this.bookingsService.departBooking(refId, body.location);
  }

  @Patch(':refId/arrive')
  async arriveBooking(
    @Param('refId') refId: string,
    @Body() body: ArriveBookingDto,
  ) {
    return this.bookingsService.arriveBooking(refId, body.location);
  }

  @Patch(':refId/cancel')
  async cancelBooking(@Param('refId') refId: string) {
    return this.bookingsService.cancelBooking(refId);
  }

  @Get(':refId/history')
  async getHistory(@Param('refId') refId: string) {
    return this.bookingsService.getBookingHistory(refId);
  }
}
