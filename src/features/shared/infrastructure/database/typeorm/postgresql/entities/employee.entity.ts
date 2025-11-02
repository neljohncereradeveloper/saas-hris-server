import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { GenderEnum } from '@shared/enum/gender.enum';
import { CitizenShipEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/citizenship.entity';
import { BranchEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/branch.entity';
import { DeptEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/dept.entity';
import { JobTitleEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/jobtitle.entity';
import { EmpStatusEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/empstatus.entity';
import { ReligionEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/religion.entity';
import { CivilStatusEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/civilstatus.entity';
import { CityEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/city.entity';
import { ProvinceEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/province.entity';
import { BarangayEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/barangay.entity';
import { EduEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/edu';
import { TrainingEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/training.entity';
import { ReferenceEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/reference.entity';
import { WorkExpEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/workexp.entity';
import { EmployeeMovementEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/employee-movement.entity';

@Entity(CONSTANTS_DATABASE_MODELS.EMPLOYEE)
@Index(['fname', 'mname', 'lname', 'idnumber'])
@Index(['idnumber'])
@Index(['bionumber'])
@Index(['email'])
export class EmployeeEntity {
  @PrimaryGeneratedColumn()
  id: number;
  /** employment information */
  @Column()
  jobtitleid: number; // foreign key to job_title table
  @Column()
  empstatusid: number; // foreign key to emp_status table
  @Column()
  branchid: number; // foreign key to branch table
  @Column()
  departmentid?: number; // foreign key to department table
  @Column({ type: 'date' })
  hiredate: Date;
  @Column({ type: 'date', nullable: true, default: null })
  enddate?: Date;
  @Column({ type: 'date', nullable: true, default: null })
  regularizationdate?: Date;
  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  idnumber?: string;
  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  bionumber?: string;
  @Column({ type: 'varchar', length: 500, nullable: true })
  imagepath?: string;
  /** personal information */
  @Column({ type: 'varchar', length: 100 })
  fname: string;
  @Column({ type: 'varchar', length: 100 })
  lname: string;
  @Column({ type: 'varchar', length: 100, default: null, nullable: true })
  mname?: string;
  @Column({ type: 'varchar', length: 20, default: null, nullable: true })
  suffix?: string;
  @Column({ type: 'date' })
  birthdate: Date;
  @Column()
  religionid: number; // foreign key to religion table
  @Column()
  civilstatusid: number; // foreign key to civil_status table
  @Column({ nullable: true, default: null })
  age?: number;
  @Column({ type: 'enum', enum: GenderEnum, nullable: true })
  gender?: GenderEnum;
  @Column({ nullable: true, default: null })
  citizenshipid?: number; // foreign key to citizen_ship table
  @Column({ nullable: true, default: null })
  height?: number;
  @Column({ nullable: true, default: null })
  weight?: number;
  /**address */
  /** home address */
  @Column({ type: 'varchar', length: 500 })
  homeaddressstreet: string;
  @Column({ nullable: true, default: null })
  homeaddressbarangayid?: number; // foreign key to barangay table
  @Column()
  homeaddresscityid: number; // foreign key to city table
  @Column({ nullable: true, default: null })
  homeaddressprovinceid: number; // foreign key to province table
  @Column({ type: 'varchar', length: 20 })
  homeaddresszipcode: string;
  /** present address */
  @Column({ type: 'varchar', length: 500, nullable: true, default: null })
  presentaddressstreet?: string;
  @Column({ nullable: true, default: null })
  presentaddressbarangayid?: number; // foreign key to barangay table
  @Column({ nullable: true, default: null })
  presentaddresscityid?: number; // foreign key to city table
  @Column({ nullable: true, default: null })
  presentaddressprovinceid?: number; // foreign key to province table
  @Column({ type: 'varchar', length: 20, nullable: true, default: null })
  presentaddresszipcode?: string;
  /** contact information */
  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  email?: string;
  @Column({ type: 'varchar', length: 20, nullable: true, default: null })
  cellphonenumber?: string;
  @Column({ type: 'varchar', length: 20, nullable: true, default: null })
  telephonenumber?: string;
  /** emergency contact information */
  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  emergencycontactname?: string;
  @Column({ type: 'varchar', length: 20, nullable: true, default: null })
  emergencycontactnumber?: string;
  @Column({ type: 'varchar', length: 100, nullable: true, default: null })
  emergencycontactrelationship?: string;
  @Column({ type: 'varchar', length: 500, nullable: true, default: null })
  emergencycontactaddress?: string;
  /** family information */
  /** husband or wife information */
  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  husbandorwifename?: string;
  @Column({ type: 'date', nullable: true, default: null })
  husbandorwifebirthdate?: Date;
  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  husbandorwifeoccupation?: string;
  /** number of children */
  @Column({ nullable: true, default: null })
  numberofchildren?: number;
  /** fathers information */
  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  fathersname?: string;
  @Column({ type: 'date', nullable: true, default: null })
  fathersbirthdate?: Date;
  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  fathersoccupation?: string;
  /** mothers information */
  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  mothersname?: string;
  @Column({ type: 'date', nullable: true, default: null })
  mothersbirthdate?: Date;
  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  mothersoccupation?: string;
  /** bank account information */
  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  bankaccountnumber?: string;
  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  bankaccountname?: string;
  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  bankname?: string;
  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  bankbranch?: string;
  /** salary information */
  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
  })
  annualsalary?: number;
  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
  })
  monthlysalary?: number;
  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
  })
  dailyrate?: number;
  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
  })
  hourlyrate?: number;
  /** government information */
  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  phic?: string;
  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  hdmf?: string;
  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  sssno?: string;
  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  tinno?: string;
  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  taxexemptcode?: string;

  /**
   * RELATIONS
   */

  /**
   * employment information
   */
  /** branch */
  @ManyToOne(() => BranchEntity, (branch) => branch.employees)
  @JoinColumn({ name: 'branchid' })
  branch: BranchEntity;
  /** department */
  @ManyToOne(() => DeptEntity, (department) => department.employees)
  @JoinColumn({ name: 'departmentid' })
  department: DeptEntity;
  /** job title */
  @ManyToOne(() => JobTitleEntity, (jobtitle) => jobtitle.employees)
  @JoinColumn({ name: 'jobtitleid' })
  jobtitle: JobTitleEntity;
  /** employee status */
  @ManyToOne(() => EmpStatusEntity, (empstatus) => empstatus.employees)
  @JoinColumn({ name: 'empstatusid' })
  empstatus: EmpStatusEntity;
  /**
   * personal information
   */
  /** religion */
  @ManyToOne(() => ReligionEntity, (religion) => religion.employees)
  @JoinColumn({ name: 'religionid' })
  religion: ReligionEntity;
  /** citizen ship */
  @ManyToOne(() => CitizenShipEntity, (citizenship) => citizenship.employees)
  @JoinColumn({ name: 'citizenshipid' })
  citizenship: CitizenShipEntity;
  /** civil status */
  @ManyToOne(() => CivilStatusEntity, (civilstatus) => civilstatus.employees)
  @JoinColumn({ name: 'civilstatusid' })
  civilstatus: CivilStatusEntity;

  /**
   * Address Information
   */
  /**
   * Home Address
   */
  /** home address barangay */
  @ManyToOne(
    () => BarangayEntity,
    (barangay) => barangay.employeeshomeaddressbarangay,
  )
  @JoinColumn({ name: 'homeaddressbarangayid' })
  homeaddressbarangay: BarangayEntity;
  /** home address city */
  @ManyToOne(() => CityEntity, (city) => city.employeeshomeaddresscity)
  @JoinColumn({ name: 'homeaddresscityid' })
  homeaddresscity: CityEntity;
  /** home address province */
  @ManyToOne(
    () => ProvinceEntity,
    (province) => province.employeeshomeaddressprovince,
  )
  @JoinColumn({ name: 'homeaddressprovinceid' })
  homeaddressprovince: ProvinceEntity;
  /**
   * Present Address
   */
  /** present address barangay */
  @ManyToOne(
    () => BarangayEntity,
    (barangay) => barangay.employeespresentaddressbarangay,
  )
  @JoinColumn({ name: 'presentaddressbarangayid' })
  presentaddressbarangay: BarangayEntity;
  /** present address city */
  @ManyToOne(() => CityEntity, (city) => city.employeespresentaddresscity)
  @JoinColumn({ name: 'presentaddresscityid' })
  presentaddresscity: CityEntity;
  /** present address province */
  @ManyToOne(
    () => ProvinceEntity,
    (province) => province.employeespresentaddressprovince,
  )
  @JoinColumn({ name: 'presentaddressprovinceid' })
  presentaddressprovince: ProvinceEntity;

  /**
   * Education Information
   */
  @OneToMany(() => EduEntity, (edu) => edu.employees)
  edu: EduEntity[];

  /**
   * Training Information
   */
  @OneToMany(() => TrainingEntity, (training) => training.employees)
  trainings: TrainingEntity[];

  @OneToMany(() => ReferenceEntity, (reference) => reference.employee)
  references: ReferenceEntity[];

  /**
   * Work Experience Information
   */
  @OneToMany(() => WorkExpEntity, (workexp) => workexp.employees)
  workexps: WorkExpEntity[];

  /** Employee movements */
  @OneToMany(() => EmployeeMovementEntity, (movement) => movement.employee)
  employeemovements: EmployeeMovementEntity[];

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
}
