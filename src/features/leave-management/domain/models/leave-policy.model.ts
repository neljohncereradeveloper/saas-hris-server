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
  minimumServiceMonths?: number; // Minimum months of service required (0 = no requirement)
  allowedEmployeeStatuses?: string[]; // Array of allowed employee status names (null/empty = all statuses allowed)

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
    minimumServiceMonths?: number;
    allowedEmployeeStatuses?: string[];
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
    this.minimumServiceMonths = dto.minimumServiceMonths ?? 0;
    this.allowedEmployeeStatuses = dto.allowedEmployeeStatuses ?? [];
  }

  /**
   * Check if an employee is eligible for this leave policy
   * Validates both service period and employee status
   */
  isEmployeeEligible(
    employeeHireDate: Date,
    employeeStatus: string,
    referenceDate: Date = new Date(),
  ): { eligible: boolean; reason?: string } {
    // Check minimum service period
    if (this.minimumServiceMonths && this.minimumServiceMonths > 0) {
      const monthsOfService = this.calculateMonthsOfService(
        employeeHireDate,
        referenceDate,
      );
      if (monthsOfService < this.minimumServiceMonths) {
        return {
          eligible: false,
          reason: `Minimum service period not met. Required: ${this.minimumServiceMonths} months, Employee has: ${monthsOfService} months, Hire Date: ${employeeHireDate.toISOString()}`,
        };
      }
    }

    // Check employee status restriction
    if (
      this.allowedEmployeeStatuses &&
      this.allowedEmployeeStatuses.length > 0
    ) {
      const normalizedEmployeeStatus = employeeStatus?.toLowerCase().trim();
      const normalizedAllowedStatuses = this.allowedEmployeeStatuses.map((s) =>
        s.toLowerCase().trim(),
      );

      if (!normalizedAllowedStatuses.includes(normalizedEmployeeStatus)) {
        return {
          eligible: false,
          reason: `Employee status "${employeeStatus}" is not allowed. Allowed statuses: ${this.allowedEmployeeStatuses.join(', ')}`,
        };
      }
    }

    return { eligible: true };
  }

  /**
   * Calculate months of service from hire date to reference date
   */
  private calculateMonthsOfService(
    hireDate: Date,
    referenceDate: Date,
  ): number {
    const years = referenceDate.getFullYear() - hireDate.getFullYear();
    const months = referenceDate.getMonth() - hireDate.getMonth();
    const days = referenceDate.getDate() - hireDate.getDate();

    let totalMonths = years * 12 + months;

    // If the day of month in reference date is before hire date, subtract one month
    if (days < 0) {
      totalMonths--;
    }

    return Math.max(0, totalMonths); // Ensure non-negative
  }
}
