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
import { LeaveTypeEntity } from './leave-type.entity';
import { EnumLeavePolicyStatus } from '@features/leave-management/domain/enum/leave-policy-status.enum';

@Entity(CONSTANTS_DATABASE_MODELS.LEAVE_POLICY)
@Index(['leavetypeid', 'effectivedate'], { unique: true })
@Index(['status'])
@Index(['isactive'])
export class LeavePolicyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /** Leave type reference */
  @Column()
  leavetypeid: number;

  /** Annual entitlement days */
  @Column('decimal', { precision: 5, scale: 2 })
  annualentitlement: number;

  /** Maximum days that can be carried over */
  @Column('decimal', { precision: 5, scale: 2 })
  carrylimit: number;

  /** Maximum days that can be encashed */
  @Column('decimal', { precision: 5, scale: 2 })
  encashlimit: number;

  /** Number of years the policy is effective */
  @Column()
  cyclelengthyears: number;

  /** Effective date */
  @Column({ type: 'date', nullable: true })
  effectivedate: Date;

  /** Expiry date */
  @Column({ type: 'date', nullable: true })
  expirydate: Date;

  /** Policy status */
  @Column({ type: 'varchar', length: 20 })
  status: EnumLeavePolicyStatus;

  /** Remarks */
  @Column({ type: 'text', nullable: true })
  remarks?: string;

  /** Minimum service period in months required for eligibility (0 = no requirement) */
  @Column({ type: 'integer', default: 0, nullable: true })
  minimumservicemonths?: number;

  /** Array of allowed employee status names (null/empty = all statuses allowed) */
  @Column({ type: 'text', array: true, nullable: true, default: null })
  allowedemployeestatuses?: string[];

  /**
   * RELATIONS
   */

  /** Leave type */
  @ManyToOne(() => LeaveTypeEntity)
  @JoinColumn({ name: 'leavetypeid' })
  leavetype: LeaveTypeEntity;

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
