import { IsString, IsDateString } from 'class-validator';

export class FlightQueryDto {
  @IsString()
  origin: string;

  @IsString()
  destination: string;

  @IsDateString()
  date: string;
}
