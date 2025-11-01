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
import { EduCourseEntity } from './edu-course.entity';
import { EduCourseLevelEntity } from './edu-courselevel.entity';
import { EduLevelEntity } from './edu-level.entity';
import { EduSchoolEntity } from './edu-school.entity';
import { EmployeeEntity } from '@features/shared/infrastructure/database/typeorm/postgresql/entities/employee.entity';

@Entity(CONSTANTS_DATABASE_MODELS.EDU)
@Index(['employeeid'])
@Index(['isactive'])
export class EduEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  schoolyear: string;

  @Column()
  eduschooldid: number;

  @Column()
  edulevelid: number;

  @Column({ nullable: true, default: null })
  educourseid?: number;

  @Column({ nullable: true, default: null })
  educourselevelid?: number;

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
  // Many-to-one relationship with EduCourse
  @ManyToOne(() => EduCourseEntity, (eduCourse) => eduCourse.edu)
  @JoinColumn({ name: 'educourseid' })
  eduCourse: EduCourseEntity;
  // // Many-to-one relationship with EduCourseLevel
  @ManyToOne(() => EduCourseLevelEntity, (eduCourseLevel) => eduCourseLevel.edu)
  @JoinColumn({ name: 'educourselevelid' })
  eduCourseLevel: EduCourseLevelEntity;
  // // Many-to-one relationship with EduLevel
  @ManyToOne(() => EduLevelEntity, (eduLevel) => eduLevel.edu)
  @JoinColumn({ name: 'edulevelid' })
  eduLevel: EduLevelEntity;
  // // Many-to-one relationship with EduSchool
  @ManyToOne(() => EduSchoolEntity, (eduSchool) => eduSchool.edu)
  @JoinColumn({ name: 'eduschooldid' })
  eduSchool: EduSchoolEntity;
  // Many-to-one relationship with Employee
  @ManyToOne(() => EmployeeEntity, (employee) => employee.edu)
  @JoinColumn({ name: 'employeeid' })
  employees: EmployeeEntity;
}
