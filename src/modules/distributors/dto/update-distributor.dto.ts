import { IsEmail, IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class UpdateDistributorDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  commissionRate?: number;

  @IsOptional()
  @IsString()
  status?: string;
}
