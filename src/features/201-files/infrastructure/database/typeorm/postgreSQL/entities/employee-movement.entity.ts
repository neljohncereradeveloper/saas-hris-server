import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { EmployeeEntity } from '@features/shared/infrastructure/database/typeorm/postgresql/entities/employee.entity';
import { BranchEntity } from './branch.entity';
import { DeptEntity } from './dept.entity';
import { JobTitleEntity } from './jobtitle.entity';
import { EmployeeMovementTypeEntity } from './employee-movement-type.entity';

@Entity(CONSTANTS_DATABASE_MODELS.EMPLOYEE_MOVEMENT)
@Index(['employeeid', 'effectivedate'])
@Index(['effectivedate'])
export class EmployeeMovementEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /** Employee reference */
  @Column()
  employeeid: number;

  /** Employee movement type */
  @Column()
  employeeovementtypeid: number;

  @Column({ type: 'date' })
  effectivedate: Date;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  /** Previous position details */
  @Column({ nullable: true })
  previousbranchid?: number;

  @Column({ nullable: true })
  previousdepartmentid?: number;

  @Column({ nullable: true })
  previousjobtitleid?: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: true,
  })
  previousannualsalary?: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: true,
  })
  previousmonthlysalary?: number;

  /** New position details */
  @Column({ nullable: true })
  newbranchid?: number;

  @Column({ nullable: true })
  newdepartmentid?: number;

  @Column({ nullable: true })
  newjobtitleid?: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: true,
  })
  newannualsalary?: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: true,
  })
  newmonthlysalary?: number;

  /** Approval details */
  @Column({ type: 'varchar', length: 100, nullable: true })
  approvedby?: string;

  @Column({ type: 'date', nullable: true })
  approveddate?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  /**
   * RELATIONS
   */

  /** Employee */
  @ManyToOne(() => EmployeeEntity, (employee) => employee.movements)
  @JoinColumn({ name: 'employeeid' })
  employee: EmployeeEntity;

  /** Previous branch */
  @ManyToOne(() => BranchEntity, { nullable: true })
  @JoinColumn({ name: 'previousbranchid' })
  previousBranch?: BranchEntity;

  /** New branch */
  @ManyToOne(() => BranchEntity, { nullable: true })
  @JoinColumn({ name: 'newbranchid' })
  newbranch?: BranchEntity;

  /** Previous department */
  @ManyToOne(() => DeptEntity, { nullable: true })
  @JoinColumn({ name: 'previousdepartmentid' })
  previousdepartment?: DeptEntity;

  /** New department */
  @ManyToOne(() => DeptEntity, { nullable: true })
  @JoinColumn({ name: 'newdepartmentid' })
  newdepartment?: DeptEntity;

  /** Previous job title */
  @ManyToOne(() => JobTitleEntity, { nullable: true })
  @JoinColumn({ name: 'previousjobtitleid' })
  previousjobtitle?: JobTitleEntity;

  /** New job title */
  @ManyToOne(() => JobTitleEntity, { nullable: true })
  @JoinColumn({ name: 'newjobtitleid' })
  newjobtitle?: JobTitleEntity;

  /** Employee movement type */
  @ManyToOne(() => EmployeeMovementTypeEntity, { nullable: true })
  @JoinColumn({ name: 'employeeovementtypeid' })
  employeeovementtype?: EmployeeMovementTypeEntity;

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
