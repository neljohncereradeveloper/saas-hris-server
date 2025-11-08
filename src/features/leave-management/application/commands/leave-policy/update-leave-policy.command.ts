export class UpdateLeavePolicyCommand {
  leaveType?: string;
  annualEntitlement?: number;
  carryLimit?: number;
  encashLimit?: number;
  cycleLengthYears?: number;
  effectiveDate?: Date;
  expiryDate?: Date;
  remarks?: string;
  minimumServiceMonths?: number;
  allowedEmployeeStatuses?: string[];
}
