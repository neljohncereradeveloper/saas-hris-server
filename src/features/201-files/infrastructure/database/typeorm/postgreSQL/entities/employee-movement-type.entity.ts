import { EmployeeMovementEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/employee-movement.entity';
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

@Entity(CONSTANTS_DATABASE_MODELS.EMPLOYEE_MOVEMENT_TYPE)
@Unique(['desc1'])
@Index(['isactive'])
export class EmployeeMovementTypeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
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
  // One-to-many relationship with EmployeeMovements
  @OneToMany(
    () => EmployeeMovementEntity,
    (employeemovement) => employeemovement.employeemovementtype,
  )
  employeemovements: EmployeeMovementEntity[];
}
