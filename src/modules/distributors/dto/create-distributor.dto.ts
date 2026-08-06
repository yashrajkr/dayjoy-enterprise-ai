import { IsEmail, IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class CreateDistributorDto {
  @IsString()
  distributorCode: string;

  @IsString()
  companyName: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsEmail()
  email: string;

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
