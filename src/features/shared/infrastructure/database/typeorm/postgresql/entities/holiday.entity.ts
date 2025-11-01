import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';

@Entity(CONSTANTS_DATABASE_MODELS.HOLIDAY)
@Index(['date'])
@Index(['isactive'])
export class HolidayEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /** Holiday name */
  @Column({ type: 'varchar', length: 100 })
  name: string;

  /** Holiday date */
  @Column({ type: 'date' })
  date: Date;

  /** Description */
  @Column({ type: 'text', nullable: true })
  description?: string;

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
