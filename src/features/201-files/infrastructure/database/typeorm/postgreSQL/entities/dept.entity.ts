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

@Entity(CONSTANTS_DATABASE_MODELS.DEPARTMENT)
@Unique(['desc1'])
@Index(['code'])
@Index(['isactive'])
export class DeptEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  desc1: string;

  @Column({ type: 'varchar', length: 20, nullable: true, default: null })
  code?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  designation?: string;

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
  @OneToMany(() => EmployeeEntity, (employee) => employee.department)
  employees: EmployeeEntity[];
}
