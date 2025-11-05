import { EnumLeavePolicyStatus } from '../enum/leave-policy-status.enum';

export class LeavePolicy {
  id?: number;
  leaveTypeId: number; // the type of leave (e.g. "Vacation", "Sick", "Personal")
  leaveType?: string; // the name of the leave type (e.g. "Vacation", "Sick", "Personal")
  annualEntitlement: number; // the annual entitlement of the leave type
  carryLimit: number; // the maximum number of days that can be carried over to the next year
  encashLimit: number; // the maximum number of days that can be encashed
  cycleLengthYears: number; // the number of years that the policy is effective
  effectiveDate?: Date; // the date from which the policy is effective
  expiryDate?: Date; // the date until which the policy is effective
  status: EnumLeavePolicyStatus; // the status of the policy (e.g. "Active", "Inactive")
  remarks?: string; // any remarks about the policy
  isActive?: boolean; // whether the policy is active

  constructor(dto: {
    id?: number;
    leaveTypeId: number;
    leaveType?: string;
    annualEntitlement: number;
    carryLimit: number;
    encashLimit: number;
    cycleLengthYears: number;
    effectiveDate?: Date;
    expiryDate?: Date;
    status: EnumLeavePolicyStatus;
    remarks?: string;
    isActive?: boolean;
  }) {
    this.id = dto.id;
    this.leaveTypeId = dto.leaveTypeId;
    this.leaveType = dto.leaveType;
    this.annualEntitlement = dto.annualEntitlement;
    this.carryLimit = dto.carryLimit;
    this.encashLimit = dto.encashLimit;
    this.cycleLengthYears = dto.cycleLengthYears;
    this.effectiveDate = dto.effectiveDate;
    this.expiryDate = dto.expiryDate;
    this.status = dto.status;
    this.remarks = dto.remarks;
    this.isActive = dto.isActive;
  }
}
