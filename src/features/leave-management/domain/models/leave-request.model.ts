import { EnumLeaveRequestStatus } from '../enum/leave-request-status.enum';

export class LeaveRequest {
  id?: number;
  employeeId: number;
  leaveTypeId: number;
  leaveType?: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  balanceId: number;
  approvalDate: Date;
  approvalBy: number;
  remarks: string;
  status: EnumLeaveRequestStatus;
  isActive?: boolean;

  constructor(dto: {
    id?: number;
    employeeId: number;
    leaveTypeId: number;
    leaveType?: string;
    startDate: Date;
    endDate: Date;
    totalDays: number;
    reason: string;
    status: EnumLeaveRequestStatus;
    balanceId: number;
    approvalDate: Date;
    approvalBy: number;
    remarks: string;
    isActive?: boolean;
  }) {
    this.id = dto.id;
    this.employeeId = dto.employeeId;
    this.leaveTypeId = dto.leaveTypeId;
    this.leaveType = dto.leaveType;
    this.startDate = dto.startDate;
    this.endDate = dto.endDate;
    this.totalDays = dto.totalDays;
    this.reason = dto.reason;
    this.status = dto.status;
    this.balanceId = dto.balanceId;
    this.approvalDate = dto.approvalDate;
    this.approvalBy = dto.approvalBy;
    this.isActive = dto.isActive;
    this.remarks = dto.remarks;
  }
}
