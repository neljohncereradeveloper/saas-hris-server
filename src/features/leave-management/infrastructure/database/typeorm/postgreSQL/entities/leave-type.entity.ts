import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';

@Entity(CONSTANTS_DATABASE_MODELS.LEAVE_TYPE)
@Index(['code'])
@Index(['isactive'])
export class LeaveTypeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /** Leave type name */
  @Column({ type: 'varchar', length: 100 })
  name: string;

  /** Leave type code */
  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  /** Description */
  @Column({ type: 'varchar', length: 255 })
  desc1: string;

  /** Whether the leave is paid */
  @Column({ type: 'boolean', default: false })
  paid: boolean;

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
