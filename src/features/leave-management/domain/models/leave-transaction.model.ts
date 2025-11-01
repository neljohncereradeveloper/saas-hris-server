import { EnumLeaveTransactionType } from '../enum/leave-transaction-status.enum';

export class LeaveTransaction {
  id?: number;
  balanceId: number;
  transactionType: EnumLeaveTransactionType;
  days: number;
  remarks: string;
  isActive?: boolean;

  constructor(dto: {
    id?: number;
    balanceId: number;
    transactionType: EnumLeaveTransactionType;
    days: number;
    remarks: string;
    isActive?: boolean;
  }) {
    this.id = dto.id;
    this.balanceId = dto.balanceId;
    this.transactionType = dto.transactionType;
    this.days = dto.days;
    this.remarks = dto.remarks;
    this.isActive = dto.isActive;
  }
}
