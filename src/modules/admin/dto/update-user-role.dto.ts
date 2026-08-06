import { IsString, IsEnum } from 'class-validator';

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  DISTRIBUTOR = 'DISTRIBUTOR',
  CUSTOMER = 'CUSTOMER',
}

export class UpdateUserRoleDto {
  @IsString()
  userId: string;

  @IsEnum(UserRole)
  role: UserRole;
}
