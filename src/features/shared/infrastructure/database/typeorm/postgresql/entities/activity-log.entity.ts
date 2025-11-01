import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';

@Entity(CONSTANTS_DATABASE_MODELS.ACTIVITYLOGS)
@Index(['userid', 'createdat'])
@Index(['entity', 'createdat'])
@Index(['action', 'createdat'])
@Index(['createdat'])
export class ActivityLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Type of action performed (from CONSTANTS_LOG_ACTION)',
  })
  action: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  entity: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'JSON string containing activity details',
  })
  details: string | null;

  @Column({ type: 'text', nullable: true, comment: 'Additional metadata' })
  metadata: string | null;

  @Column({
    type: 'varchar',
    length: 45,
    nullable: true,
    comment: 'IP address of the user',
  })
  ipaddress: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'User agent string',
  })
  useragent: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Session ID',
  })
  sessionid: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    comment: 'ID of the user who performed the action',
  })
  userid: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Username for display purposes',
  })
  username: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Description of the action',
  })
  description: string | null;

  @Column({
    type: 'boolean',
    default: true,
    comment: 'Whether the action was successful',
  })
  issuccess: boolean;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Error message if action failed',
  })
  errormessage: string | null;

  @Column({ type: 'integer', nullable: true, comment: 'HTTP status code' })
  statuscode: number | null;

  @Column({
    type: 'integer',
    nullable: true,
    comment: 'Duration of the action in milliseconds',
  })
  duration: number | null;

  @CreateDateColumn({
    comment: 'When the activity was created',
    update: false, // Prevent updates to this field
  })
  createdat: Date;

  @Column({
    type: 'varchar',
    length: 100,
    default: 'system',
    comment: 'Who created this record',
    update: false, // Prevent updates to this field
  })
  createdby: string;
}
