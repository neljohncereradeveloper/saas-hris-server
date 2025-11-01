import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
  OneToMany,
} from 'typeorm';
import { DocumentEntity } from './document.entity';

@Entity(CONSTANTS_DATABASE_MODELS.DOCUMENT_TYPE)
@Unique(['name'])
@Index(['isactive'])
export class DocumentTypeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  desc1: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

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
  // One-to-many relationship with Documents
  @OneToMany(() => DocumentEntity, (document) => document.documenttype)
  documents: DocumentEntity[];
}
