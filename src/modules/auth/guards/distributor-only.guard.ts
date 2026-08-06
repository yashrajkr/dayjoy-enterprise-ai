import { Injectable } from '@nestjs/common';
import { RolesGuard } from '../../../common/guards/roles.guard';

@Injectable()
export class DistributorOnlyGuard extends RolesGuard {
  // This guard is used with @Roles('DISTRIBUTOR') to restrict endpoints to distributors only.
}
