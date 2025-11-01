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
import { EnumLeaveRequestStatus } from '@features/leave-management/domain/enum/leave-request-status.enum';
import { EmployeeEntity } from '@features/shared/infrastructure/database/typeorm/postgresql/entities/employee.entity';
import { LeaveTypeEntity } from './leave-type.entity';
import { LeaveBalanceEntity } from './leave-balance.entity';

@Entity(CONSTANTS_DATABASE_MODELS.LEAVE_REQUEST)
@Index(['employeeid'])
@Index(['leavetypeid'])
@Index(['balanceid'])
@Index(['status'])
@Index(['isactive'])
export class LeaveRequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /** Employee reference */
  @Column()
  employeeid: number;

  /** Leave type reference */
  @Column()
  leavetypeid: number;

  /** Start date of leave */
  @Column({ type: 'date' })
  startdate: Date;

  /** End date of leave */
  @Column({ type: 'date' })
  enddate: Date;

  /** Total days requested */
  @Column('decimal', { precision: 5, scale: 2 })
  totaldays: number;

  /** Reason for leave */
  @Column({ type: 'text', nullable: true })
  reason?: string;

  /** Balance reference */
  @Column()
  balanceid: number;

  /** Approval date */
  @Column({ type: 'timestamp', nullable: true })
  approvaldate?: Date;

  /** Approver employee ID */
  @Column({ nullable: true })
  approvalby?: number;

  /** Approval/rejection remarks */
  @Column({ type: 'text', nullable: true })
  remarks?: string;

  /** Request status */
  @Column({ type: 'varchar', length: 20 })
  status: EnumLeaveRequestStatus;

  /**
   * RELATIONS
   */

  /** Employee */
  @ManyToOne(() => EmployeeEntity)
  @JoinColumn({ name: 'employeeid' })
  employee: EmployeeEntity;

  /** Leave type */
  @ManyToOne(() => LeaveTypeEntity)
  @JoinColumn({ name: 'leavetypeid' })
  leavetype: LeaveTypeEntity;

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
