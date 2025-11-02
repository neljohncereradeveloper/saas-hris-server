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
import { WorkExpCompanyEntity } from './workexp-company.entity';
import { WorkExpJobTitleEntity } from './workexp-jobtitle.entity';
import { EmployeeEntity } from '@features/shared/infrastructure/database/typeorm/postgresql/entities/employee.entity';

@Entity(CONSTANTS_DATABASE_MODELS.WORKEXP)
@Index(['employeeid'])
@Index(['companyid'])
@Index(['isactive'])
export class WorkExpEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, default: null })
  companyid?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  years?: string;

  @Column({ nullable: true, default: null })
  workexpjobtitleid?: number;

  @Column()
  employeeid: number;

  @Column({ type: 'boolean', default: true })
  isactive: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdat: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedat: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  createdby?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedby?: string;

  /**
   * RELATIONS
   */
  // Many-to-one relationship with Employee
  @ManyToOne(() => EmployeeEntity, (employee) => employee.workexps)
  @JoinColumn({ name: 'employeeid' })
  employees: EmployeeEntity;
  // Many-to-one relationship with WorkExpJobTitle
  @ManyToOne(
    () => WorkExpJobTitleEntity,
    (workexpjobtitle) => workexpjobtitle.workexp,
  )
  @JoinColumn({ name: 'workexpjobtitleid' })
  workexpjobtitle: WorkExpJobTitleEntity;
  // Many-to-one relationship with WorkCompany
  @ManyToOne(
    () => WorkExpCompanyEntity,
    (workexpcompany) => workexpcompany.workexp,
  )
  @JoinColumn({ name: 'companyid' })
  workexpcompany: WorkExpCompanyEntity;
}
