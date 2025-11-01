import { EnumLeaveEncashmentStatus } from '../enum/leave-encashment-status.enum';

export class LeaveEncashment {
  id?: number;
  employeeId: number;
  balanceId: number;
  totalDays: number;
  amount: number;
  status: EnumLeaveEncashmentStatus;
  isActive?: boolean;

  constructor(dto: {
    id?: number;
    employeeId: number;
    balanceId: number;
    totalDays: number;
    amount: number;
    status: EnumLeaveEncashmentStatus;
    isActive?: boolean;
  }) {
    this.id = dto.id;
    this.employeeId = dto.employeeId;
    this.balanceId = dto.balanceId;
    this.totalDays = dto.totalDays;
    this.amount = dto.amount;
    this.status = dto.status;
    this.isActive = dto.isActive;
  }
}
