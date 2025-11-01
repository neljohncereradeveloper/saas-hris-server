export class EmployeeMovement {
  id?: number;
  employeeId: number;
  employeeMovementTypeId: number;
  effectiveDate: Date;
  reason?: string;

  /** Previous position details */
  previousBranchId?: number;
  previousBranch?: string;
  previousDepartmentId?: number;
  previousDepartment?: string;
  previousJobTitleId?: number;
  previousJobTitle?: string;
  previousAnnualSalary?: number;
  previousMonthlySalary?: number;

  /** New position details */
  newBranchId?: number;
  newBranch?: string;
  newDepartmentId?: number;
  newDepartment?: string;
  newJobTitleId?: number;
  newJobTitle?: string;
  newAnnualSalary?: number;
  newMonthlySalary?: number;

  /** Approval details */
  approvedBy?: string;
  approvedDate?: Date;
  notes?: string;

  /** Audit fields */
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;

  isActive?: boolean;

  constructor(
    employeeId: number,
    employeeMovementTypeId: number,
    effectiveDate: Date,
    options: {
      reason?: string;
      previousBranchId?: number;
      previousBranch?: string;
      previousDepartmentId?: number;
      previousDepartment?: string;
      previousJobTitleId?: number;
      previousJobTitle?: string;
      previousAnnualSalary?: number;
      previousMonthlySalary?: number;
      newBranchId?: number;
      newBranch?: string;
      newDepartmentId?: number;
      newDepartment?: string;
      newJobTitleId?: number;
      newJobTitle?: string;
      newAnnualSalary?: number;
      newMonthlySalary?: number;
      approvedBy?: string;
      approvedDate?: Date;
      notes?: string;
      createdBy?: string;
      isActive?: boolean;
    } = {},
  ) {
    this.employeeId = employeeId;
    this.employeeMovementTypeId = employeeMovementTypeId;
    this.effectiveDate = effectiveDate;
    this.reason = options.reason;
    this.previousBranchId = options.previousBranchId;
    this.previousBranch = options.previousBranch;
    this.previousDepartmentId = options.previousDepartmentId;
    this.previousDepartment = options.previousDepartment;
    this.previousJobTitle = options.previousJobTitle;
    this.previousJobTitleId = options.previousJobTitleId;
    this.previousAnnualSalary = options.previousAnnualSalary;
    this.previousMonthlySalary = options.previousMonthlySalary;
    this.newBranchId = options.newBranchId;
    this.newBranch = options.newBranch;
    this.newDepartmentId = options.newDepartmentId;
    this.newDepartment = options.newDepartment;
    this.newJobTitle = options.newJobTitle;
    this.newJobTitleId = options.newJobTitleId;
    this.newAnnualSalary = options.newAnnualSalary;
    this.newMonthlySalary = options.newMonthlySalary;
    this.approvedBy = options.approvedBy;
    this.approvedDate = options.approvedDate;
    this.notes = options.notes;
    this.createdBy = options.createdBy || 'system';
    this.createdAt = new Date();
    this.isActive = options.isActive;
  }

  // Business logic: Check if movement involves salary change
  hasSalaryChange(): boolean {
    return (
      this.previousAnnualSalary !== this.newAnnualSalary ||
      this.previousMonthlySalary !== this.newMonthlySalary
    );
  }

  // Business logic: Check if movement involves department change
  hasDepartmentChange(): boolean {
    return this.previousDepartmentId !== this.newDepartmentId;
  }

  // Business logic: Check if movement involves branch change
  hasBranchChange(): boolean {
    return this.previousBranchId !== this.newBranchId;
  }

  // Business logic: Check if movement involves job title change
  hasJobTitleChange(): boolean {
    return this.previousJobTitleId !== this.newJobTitleId;
  }

  // Business logic: Get salary change amount
  getSalaryChangeAmount(): number {
    const previousSalary =
      this.previousAnnualSalary || this.previousMonthlySalary || 0;
    const newSalary = this.newAnnualSalary || this.newMonthlySalary || 0;
    return newSalary - previousSalary;
  }

  // Business logic: Check if movement is approved
  isApproved(): boolean {
    return !!this.approvedBy && !!this.approvedDate;
  }

  // Business logic: Check if movement is effective (past effective date)
  isEffective(): boolean {
    return new Date() >= this.effectiveDate;
  }
}
