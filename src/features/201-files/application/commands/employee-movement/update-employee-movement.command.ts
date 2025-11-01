import { MovementType } from '@shared/enum/movement-type.enum';

export interface UpdateEmployeeMovementCommand {
  movementType?: MovementType;
  effectiveDate?: Date;
  reason?: string;
  newBranch?: string;
  newDepartment?: string;
  newJobTitle?: string;
  newAnnualSalary?: number;
  newMonthlySalary?: number;
  approvedBy?: string;
  approvedDate?: Date;
  notes?: string;
}
