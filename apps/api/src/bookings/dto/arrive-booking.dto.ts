import { IsString } from 'class-validator';

export class ArriveBookingDto {
  @IsString()
  location: string;
}
