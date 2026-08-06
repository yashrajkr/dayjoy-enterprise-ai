import { IsOptional, IsString } from 'class-validator';

export class UpdateEmployeeStatusDto {
  @IsOptional()
  @IsString()
  status?: string; // ACTIVE, INACTIVE, SUSPENDED, DELETED
}
