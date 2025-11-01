import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { EnumLeaveTransactionType } from '@features/leave-management/domain/enum/leave-transaction-status.enum';
import { LeaveBalanceEntity } from './leave-balance.entity';

@Entity(CONSTANTS_DATABASE_MODELS.LEAVE_TRANSACTION)
@Index(['balanceid'])
@Index(['transactiontype'])
@Index(['isactive'])
export class LeaveTransactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /** Balance reference */
  @Column()
  balanceid: number;

  /** Transaction type */
  @Column({ type: 'varchar', length: 20 })
  transactiontype: EnumLeaveTransactionType;

  /** Number of days affected (positive or negative) */
  @Column('decimal', { precision: 5, scale: 2 })
  days: number;

  /** Transaction description */
  @Column({ type: 'text', nullable: true })
  remarks?: string;

  /**
   * RELATIONS
   */

  /** Leave balance */
  @ManyToOne(() => LeaveBalanceEntity)
  @JoinColumn({ name: 'balanceid' })
  balance: LeaveBalanceEntity;

  /**
   * Audit Fields
   */
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdat: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedat: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  createdby?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedby?: string;

  @Column({ type: 'boolean', default: true })
  isactive: boolean;
}
