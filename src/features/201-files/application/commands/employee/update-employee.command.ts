import { GenderEnum } from '@shared/enum/gender.enum';

export interface UpdateEmployeeCommand {
  /** employment information */
  jobTitle: string;
  employeeStatus: string;
  branch: string;
  department?: string;
  hireDate: Date;
  endDate?: Date;
  regularizationDate?: Date;
  idNumber?: string;
  bioNumber?: string;

  /** personal information */
  fname: string;
  mname?: string;
  lname: string;
  suffix?: string;
  birthDate: Date;
  religion: string;
  civilStatus: string;
  age?: number;
  gender?: string;
  citizenShip?: string;
  height?: number;
  weight?: number;

  /** address information */
  homeAddressStreet: string;
  homeAddressCity: string;
  homeAddressProvince: string;
  homeAddressZipCode: string;
  presentAddressStreet?: string;
  presentAddressBarangay?: string;
  presentAddressCity?: string;
  presentAddressProvince?: string;
  presentAddressZipCode?: string;

  /** contact information */
  cellphoneNumber?: string;
  telephoneNumber?: string;
  email?: string;

  /** emergency contact information */
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  emergencyContactRelationship?: string;
  emergencyContactAddress?: string;

  /** family information */
  husbandOrWifeName?: string;
  husbandOrWifeBirthDate?: Date;
  husbandOrWifeOccupation?: string;
  numberOfChildren?: number;
  fathersName?: string;
  fathersBirthDate?: Date;
  fathersOccupation?: string;
  mothersName?: string;
  mothersBirthDate?: Date;
  mothersOccupation?: string;

  /** bank account information */
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankName?: string;
  bankBranch?: string;

  /** salary information */
  annualSalary?: number;
  monthlySalary?: number;
  dailyRate?: number;
  hourlyRate?: number;
}
