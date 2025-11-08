import { EnumLeaveBalanceStatus } from '../enum/leave-balance-status.enum';

export class LeaveBalance {
  id?: number;
  employeeId: number;
  leaveTypeId: number;
  leaveType?: string; // the type of leave (e.g. "Vacation", "Sick", "Personal")
  policyId: number; // the policy that applies to this balance
  year: string; // the leave year identifier of the balance (e.g., "2023-2024")
  beginningBalance: number; // starting leave credits at year start
  earned: number; // leaves credited during the year
  used: number; // leaves consumed
  carriedOver: number; // from previous years (based on policy)
  encashed: number; // converted to cash
  remaining: number; // (earned + carriedOver) - (used + encashed)
  lastTransactionDate?: Date; // last update (e.g., leave approval)
  status: EnumLeaveBalanceStatus; // the status of the balance (e.g. "Active", "Closed")
  remarks?: string; // any remarks about the balance
  isActive?: boolean; // whether the balance is active

  constructor(dto: {
    id?: number;
    employeeId: number;
    leaveTypeId: number;
    leaveType?: string;
    policyId: number;
    year: string;
    beginningBalance: number;
    earned: number;
    used: number;
    carriedOver: number;
    encashed: number;
    remaining: number;
    lastTransactionDate?: Date;
    status: EnumLeaveBalanceStatus;
    remarks?: string;
    isActive?: boolean;
  }) {
    this.id = dto.id;
    this.employeeId = dto.employeeId;
    this.leaveTypeId = dto.leaveTypeId;
    this.leaveType = dto.leaveType;
    this.policyId = dto.policyId;
    this.year = dto.year;
    this.beginningBalance = dto.beginningBalance;
    this.earned = dto.earned;
    this.used = dto.used;
    this.carriedOver = dto.carriedOver;
    this.encashed = dto.encashed;
    this.remaining = dto.remaining;
    this.lastTransactionDate = dto.lastTransactionDate;
    this.status = dto.status;
    this.remarks = dto.remarks;
    this.isActive = dto.isActive;
  }
}
