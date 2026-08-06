import { IsString, IsOptional } from 'class-validator';

export class UpdateTenantConfigDto {
  @IsString()
  key: string;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
