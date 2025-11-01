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
import { EmployeeEntity } from '@features/shared/infrastructure/database/typeorm/postgresql/entities/employee.entity';

@Entity(CONSTANTS_DATABASE_MODELS.REFERENCE)
@Index(['employeeid'])
@Index(['isactive'])
export class ReferenceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  fname: string;

  @Column({
    type: 'varchar',
    length: 100,
    default: null,
    nullable: true,
  })
  mname?: string;

  @Column({ type: 'varchar', length: 100 })
  lname: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: null,
    nullable: true,
  })
  suffix?: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: null,
    nullable: true,
  })
  cellphonenumber?: string;

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
  @ManyToOne(() => EmployeeEntity, (employee) => employee.references)
  @JoinColumn({ name: 'employeeid' })
  employee: EmployeeEntity;
}
