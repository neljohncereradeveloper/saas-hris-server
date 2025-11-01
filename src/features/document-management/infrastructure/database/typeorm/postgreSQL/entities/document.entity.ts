import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DocumentTypeEntity } from './document-type.entity';
import { EmployeeEntity } from '@features/shared/infrastructure/database/typeorm/postgresql/entities/employee.entity';

@Entity(CONSTANTS_DATABASE_MODELS.DOCUMENT)
@Unique(['title'])
@Index(['isactive'])
@Index(['scope'])
@Index(['employeeid'])
@Index(['documenttypeid'])
export class DocumentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  filename?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  filepath?: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  scope: string;

  @Column({ type: 'int', nullable: true })
  employeeid?: number;

  @Column({ type: 'int', nullable: true })
  documenttypeid?: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'timestamp', nullable: true })
  expirationdate?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  targetdepartment?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  targetbranch?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  uploadedby?: string;

  @Column({ type: 'timestamp', nullable: true })
  uploadedat?: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedat: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedby?: string;

  @Column({ type: 'boolean', default: true })
  isactive: boolean;

  /**
   * RELATIONS
   */
  // Many-to-one relationship with Employee
  @ManyToOne(() => EmployeeEntity, (employee) => employee.documents)
  @JoinColumn({ name: 'employeeid' })
  employee: EmployeeEntity;
  // Many-to-one relationship with DocumentType
  @ManyToOne(() => DocumentTypeEntity, (documentType) => documentType.documents)
  @JoinColumn({ name: 'documenttypeid' })
  documenttype: DocumentTypeEntity;
}
