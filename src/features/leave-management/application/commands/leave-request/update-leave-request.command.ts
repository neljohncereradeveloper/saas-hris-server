export class UpdateLeaveRequestCommand {
  id: number;
  leaveType?: string;
  startDate?: Date;
  endDate?: Date;
  reason?: string;
  totalDays?: number;
  isHalfDay?: boolean;
}

