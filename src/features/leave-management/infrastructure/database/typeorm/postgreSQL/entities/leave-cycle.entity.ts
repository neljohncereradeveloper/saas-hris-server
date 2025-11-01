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
import { EnumLeaveCycleStatus } from '@features/leave-management/domain/enum/leave-cycle-status.enum';
import { EmployeeEntity } from '@features/shared/infrastructure/database/typeorm/postgresql/entities/employee.entity';
import { LeaveTypeEntity } from './leave-type.entity';

@Entity(CONSTANTS_DATABASE_MODELS.LEAVE_CYCLE)
@Index(['employeeid', 'leavetypeid'])
@Index(['status'])
@Index(['isactive'])
export class LeaveCycleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /** Employee reference */
  @Column()
  employeeid: number;

  /** Leave type reference */
  @Column()
  leavetypeid: number;

  /** First year of the cycle */
  @Column()
  cyclestartyear: number;

  /** Last year of the cycle */
  @Column()
  cycleendyear: number;

  /** Total days carried within this cycle */
  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  totalcarried: number;

  /** Status of the cycle */
  @Column({ type: 'varchar', length: 20 })
  status: EnumLeaveCycleStatus;

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
