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
import { TrainingCertEntity } from './training-cert.entity';
import { EmployeeEntity } from '@features/shared/infrastructure/database/typeorm/postgresql/entities/employee.entity';

@Entity(CONSTANTS_DATABASE_MODELS.TRAINING)
@Index(['employeeid'])
@Index(['trainingscertid'])
@Index(['isactive'])
export class TrainingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    default: null,
  })
  trainingtitle?: string;

  // Description or notes related to the employee training (optional)
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    default: null,
  })
  desc1?: string;

  // Date when the training took place
  @Column({ type: 'date' })
  trainingdate: Date;

  // ID of the associated employee training certificate
  @Column()
  trainingscertid: number;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    default: null,
  })
  imagepath?: string;

  // ID of the employee who received the training
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
  // Many-to-one relationship with TrainingCertificate
  @ManyToOne(() => TrainingCertEntity, (trainingcert) => trainingcert.trainings)
  @JoinColumn({ name: 'trainingscertid' })
  trainingscert: TrainingCertEntity;
  // Many-to-one relationship with Employee
  @ManyToOne(() => EmployeeEntity, (employee) => employee.trainings)
  @JoinColumn({ name: 'employeeid' })
  employees: EmployeeEntity;
}
