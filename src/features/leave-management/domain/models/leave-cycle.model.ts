import { EnumLeaveCycleStatus } from '../enum/leave-cycle-status.enum';

export class LeaveCycle {
  id?: number;
  employeeId: number;
  leaveTypeId: number;
  leaveType?: string;
  cycleStartYear: number;
  cycleEndYear: number;
  totalCarried: number;
  status: EnumLeaveCycleStatus;
  isActive?: boolean;

  constructor(dto: {
    id?: number;
    employeeId: number;
    leaveTypeId: number;
    leaveType?: string;
    cycleStartYear: number;
    cycleEndYear: number;
    totalCarried: number;
    status: EnumLeaveCycleStatus;
    isActive?: boolean;
  }) {
    this.id = dto.id;
    this.employeeId = dto.employeeId;
    this.leaveTypeId = dto.leaveTypeId;
    this.leaveType = dto.leaveType;
    this.cycleStartYear = dto.cycleStartYear;
    this.cycleEndYear = dto.cycleEndYear;
    this.totalCarried = dto.totalCarried;
    this.status = dto.status;
    this.isActive = dto.isActive;
  }
}
