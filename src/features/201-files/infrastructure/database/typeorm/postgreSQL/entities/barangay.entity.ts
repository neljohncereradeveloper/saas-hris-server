import { EmployeeEntity } from '@features/shared/infrastructure/database/typeorm/postgresql/entities/employee.entity';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity(CONSTANTS_DATABASE_MODELS.BARANGAY)
@Unique(['desc1'])
@Index(['isactive'])
export class BarangayEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  desc1: string;

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
  @OneToMany(() => EmployeeEntity, (employee) => employee.homeAddressBarangay)
  employeesHomeAddressBarangay: EmployeeEntity[];
  // One-to-many relationship with Employees
  @OneToMany(
    () => EmployeeEntity,
    (employee) => employee.presentAddressBarangay,
  )
  employeesPresentAddressBarangay: EmployeeEntity[];
}
