import { IsEmail, IsOptional, IsString, IsEnum } from 'class-validator';
import { CustomerTypeEnum } from './create-customer.dto';

export class UpdateCustomerDto {
  @IsOptional()
  @IsEnum(CustomerTypeEnum)
  customerType?: CustomerTypeEnum;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
