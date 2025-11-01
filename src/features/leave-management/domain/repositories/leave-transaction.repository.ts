import { LeaveTransaction } from '../models/leave-transaction.model';

export interface LeaveTransactionRepository<Context = unknown> {
  create(tx: LeaveTransaction, context: Context): Promise<LeaveTransaction>;
  findByBalance(
    balanceId: number,
    context: Context,
  ): Promise<LeaveTransaction[]>;
  recordTransaction(
    balanceId: number,
    type: 'earn' | 'use' | 'carry_over' | 'encash',
    days: number,
    remarks: string,
    userId: number,
    context: Context,
  ): Promise<LeaveTransaction>;
}
