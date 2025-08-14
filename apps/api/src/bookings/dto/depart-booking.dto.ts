import { IsString } from 'class-validator';

export class DepartBookingDto {
  @IsString()
  location: string;
}
