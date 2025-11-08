import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { EnumLeaveBalanceStatus } from '@features/leave-management/domain/enum/leave-balance-status.enum';
import { EmployeeEntity } from '@features/shared/infrastructure/database/typeorm/postgresql/entities/employee.entity';
import { LeaveTypeEntity } from './leave-type.entity';
import { LeavePolicyEntity } from './leave-policy.entity';

@Entity(CONSTANTS_DATABASE_MODELS.LEAVE_BALANCE)
@Index(['employeeid', 'year'])
@Index(['leavetypeid', 'year'])
@Index(['status'])
@Index(['isactive'])
export class LeaveBalanceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /** Employee reference */
  @Column()
  employeeid: number;

  /** Leave type reference */
  @Column()
  leavetypeid: number;

  /** Policy reference */
  @Column()
  policyid: number;

  /** Year of the balance (leave year identifier, e.g., "2023-2024") */
  @Column({ type: 'varchar', length: 20 })
  year: string;

  /** Starting leave credits at year start */
  @Column('decimal', { precision: 5, scale: 2 })
  beginningbalance: number;

  /** Leaves credited during the year */
  @Column('decimal', { precision: 5, scale: 2 })
  earned: number;

  /** Leaves consumed */
  @Column('decimal', { precision: 5, scale: 2 })
  used: number;

  /** From previous years (based on policy) */
  @Column('decimal', { precision: 5, scale: 2 })
  carriedover: number;

  /** Converted to cash */
  @Column('decimal', { precision: 5, scale: 2 })
  encashed: number;

  /** (earned + carriedOver) - (used + encashed) */
  @Column('decimal', { precision: 5, scale: 2 })
  remaining: number;

  /** Last update (e.g., leave approval) */
  @Column({ type: 'date', nullable: true })
  lasttransactiondate?: Date;

  /** Status of the balance */
  @Column({ type: 'varchar', length: 20 })
  status: EnumLeaveBalanceStatus;

  /** Any remarks about the balance */
  @Column({ type: 'text', nullable: true })
  remarks?: string;

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

  /** Leave policy */
  @ManyToOne(() => LeavePolicyEntity)
  @JoinColumn({ name: 'policyid' })
  policy: LeavePolicyEntity;

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
