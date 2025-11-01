export class CreateLeavePolicyCommand {
  leaveType: string;
  annualEntitlement: number;
  carryLimit: number;
  encashLimit: number;
  cycleLengthYears: number;
  effectiveDate: Date;
  expiryDate: Date;
  remarks?: string;
}
