export class CreateLeaveBalanceCommand {
  employeeId: number;
  leaveType: string;
  policyId: number;
  year: string; // Leave year identifier (e.g., "2023-2024")
}
