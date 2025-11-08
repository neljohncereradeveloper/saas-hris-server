import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';

@Entity(CONSTANTS_DATABASE_MODELS.LEAVE_YEAR_CONFIGURATION)
@Index(['year'])
@Index(['isactive'])
@Index(['cutoffstartdate', 'cutoffenddate'])
export class LeaveYearConfigurationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /** Cutoff start date (e.g., Nov 26) */
  @Column({ type: 'date' })
  cutoffstartdate: Date;

  /** Cutoff end date (e.g., Nov 25 of next year) */
  @Column({ type: 'date' })
  cutoffenddate: Date;

  /** Leave year identifier (e.g., "2023-2024") */
  @Column({ type: 'varchar', length: 20, unique: true })
  year: string;

  /** Remarks */
  @Column({ type: 'text', nullable: true })
  remarks?: string;

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
