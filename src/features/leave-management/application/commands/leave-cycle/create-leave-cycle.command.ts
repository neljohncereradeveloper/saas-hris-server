export interface CreateLeaveCycleCommand {
  employeeId: number;
  leaveType: string;
  year?: number; // Optional: if provided, will use this as base year; otherwise uses current year
}
