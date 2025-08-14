import { IsString, IsNumber, Min } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  origin: string;

  @IsString()
  destination: string;

  @IsNumber()
  @Min(1)
  pieces: number;

  @IsNumber()
  @Min(1)
  weight_kg: number;
}
