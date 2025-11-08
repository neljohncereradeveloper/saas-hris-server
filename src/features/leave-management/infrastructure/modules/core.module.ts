import { Module } from '@nestjs/common';
import { LeaveTypeModule } from './leave-type/leave-type.module';
import { LeavePolicyModule } from './leave-policy/leave-policy.module';
import { LeaveBalanceModule } from './leave-balance/leave-balance.module';
import { LeaveCycleModule } from './leave-cycle/leave-cycle.module';
import { LeaveRequestModule } from './leave-request/leave-request.module';
import { LeaveYearConfigurationModule } from './leave-year-configuration/leave-year-configuration.module';

@Module({
  imports: [
    LeaveTypeModule,
    LeavePolicyModule,
    LeaveBalanceModule,
    LeaveCycleModule,
    LeaveRequestModule,
    LeaveYearConfigurationModule,
  ],
})
export class CoreLeaveManagementModule {}
