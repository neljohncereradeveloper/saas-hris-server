import { EmployeeEntity } from '@features/shared/infrastructure/database/typeorm/postgresql/entities/employee.entity';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity(CONSTANTS_DATABASE_MODELS.BRANCH)
@Unique(['brcode', 'desc1'])
@Index(['brcode'])
@Index(['isactive'])
export class BranchEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  desc1: string;

  @Column({ type: 'varchar', length: 10 })
  brcode: string;

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
  // One-to-many relationship with Employees
  @OneToMany(() => EmployeeEntity, (employee) => employee.branch)
  employees: EmployeeEntity[];
}
