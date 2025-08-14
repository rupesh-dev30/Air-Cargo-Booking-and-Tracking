import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  flight_id: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  pieces: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  weight_kg: number;
}
