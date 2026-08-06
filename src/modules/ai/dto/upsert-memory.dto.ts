import { IsOptional, IsString, IsInt } from 'class-validator';

export class UpsertMemoryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsString()
  type: string; // FACT, PREFERENCE, HISTORY, CONTEXT

  @IsString()
  key: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsInt()
  importance?: number;
}
