import { GenderEnum } from '@shared/enum/gender.enum';

export class Employee {
  id?: number;
  /** employment information */
  jobTitleId: number;
  jobTitle?: string;
  employeeStatusId: number;
  employeeStatus?: string;
  branchId: number;
  branch?: string;
  departmentId?: number;
  department?: string;
  hireDate: Date;
  endDate?: Date;
  regularizationDate?: Date;
  idNumber?: string;
  bioNumber?: string;
  imagePath?: string;
  /** personal information */
  fname: string;
  mname?: string;
  lname: string;
  suffix?: string;
  birthDate: Date;
  religionId: number;
  religion?: string;
  civilStatusId: number;
  civilStatus?: string;
  age?: number;
  gender?: string;
  citizenShipId?: number;
  citizenShip?: string;
  height?: number;
  weight?: number;
  /**address */
  homeAddressStreet: string;
  homeAddressBarangayId?: number;
  homeAddressBarangay?: string;
  homeAddressCityId: number;
  homeAddressCity?: string;
  homeAddressProvinceId: number;
  homeAddressProvince?: string;
  homeAddressZipCode: string;
  presentAddressStreet?: string;
  presentAddressBarangayId?: number;
  presentAddressBarangay?: string;
  presentAddressCityId?: number;
  presentAddressCity?: string;
  presentAddressProvinceId?: number;
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
  /** government information */
  phic?: string;
  hdmf?: string;
  sssNo?: string;
  tinNo?: string;
  taxExemptCode?: string;

  constructor(dto: {
    id?: number;
    /** employment information */
    jobTitleId: number;
    jobTitle?: string;
    employeeStatusId: number;
    employeeStatus?: string;
    branchId: number;
    branch?: string;
    departmentId?: number;
    department?: string;
    hireDate: Date;
    endDate?: Date;
    regularizationDate?: Date;
    idNumber?: string;
    bioNumber?: string;
    imagePath?: string;
    /** personal information */
    fname: string;
    mname?: string;
    lname: string;
    suffix?: string;
    birthDate: Date;
    religionId: number;
    religion?: string;
    civilStatusId: number;
    civilStatus?: string;
    age?: number;
    gender?: string;
    citizenShipId?: number;
    citizenShip?: string;
    height?: number;
    weight?: number;
    /**address */
    homeAddressStreet: string;
    homeAddressBarangayId?: number;
    homeAddressBarangay?: string;
    homeAddressCityId: number;
    homeAddressCity?: string;
    homeAddressProvinceId: number;
    homeAddressProvince?: string;
    homeAddressZipCode: string;
    presentAddressStreet?: string;
    presentAddressBarangayId?: number;
    presentAddressBarangay?: string;
    presentAddressCityId?: number;
    presentAddressCity?: string;
    presentAddressProvinceId?: number;
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
    /** government information */
    phic?: string;
    hdmf?: string;
    sssNo?: string;
    tinNo?: string;
    taxExemptCode?: string;
  }) {
    this.id = dto.id;
    /** employment information */
    this.jobTitleId = dto.jobTitleId;
    this.jobTitle = dto.jobTitle;
    this.employeeStatusId = dto.employeeStatusId;
    this.employeeStatus = dto.employeeStatus;
    this.branchId = dto.branchId;
    this.branch = dto.branch;
    this.departmentId = dto.departmentId;
    this.department = dto.department;
    this.hireDate = dto.hireDate;
    this.endDate = dto.endDate;
    this.regularizationDate = dto.regularizationDate;
    this.idNumber = dto.idNumber;
    this.bioNumber = dto.bioNumber;
    this.imagePath = dto.imagePath;
    /** personal information */
    this.fname = dto.fname;
    this.mname = dto.mname;
    this.lname = dto.lname;
    this.suffix = dto.suffix;
    this.birthDate = dto.birthDate;
    this.religionId = dto.religionId;
    this.religion = dto.religion;
    this.civilStatusId = dto.civilStatusId;
    this.civilStatus = dto.civilStatus;
    this.age = dto.age;
    this.gender = dto.gender;
    this.citizenShipId = dto.citizenShipId;
    this.citizenShip = dto.citizenShip;
    this.height = dto.height;
    this.weight = dto.weight;
    /**address */
    this.homeAddressStreet = dto.homeAddressStreet;
    this.homeAddressBarangayId = dto.homeAddressBarangayId;
    this.homeAddressBarangay = dto.homeAddressBarangay;
    this.homeAddressCityId = dto.homeAddressCityId;
    this.homeAddressCity = dto.homeAddressCity;
    this.homeAddressProvinceId = dto.homeAddressProvinceId;
    this.homeAddressProvince = dto.homeAddressProvince;
    this.homeAddressZipCode = dto.homeAddressZipCode;
    this.presentAddressStreet = dto.presentAddressStreet;
    this.presentAddressBarangayId = dto.presentAddressBarangayId;
    this.presentAddressBarangay = dto.presentAddressBarangay;
    this.presentAddressCityId = dto.presentAddressCityId;
    this.presentAddressCity = dto.presentAddressCity;
    this.presentAddressProvinceId = dto.presentAddressProvinceId;
    this.presentAddressZipCode = dto.presentAddressZipCode;
    /** contact information */
    this.cellphoneNumber = dto.cellphoneNumber;
    this.telephoneNumber = dto.telephoneNumber;
    this.email = dto.email;
    /** emergency contact information */
    this.emergencyContactName = dto.emergencyContactName;
    this.emergencyContactNumber = dto.emergencyContactNumber;
    this.emergencyContactRelationship = dto.emergencyContactRelationship;
    this.emergencyContactAddress = dto.emergencyContactAddress;
    /** family information */
    this.husbandOrWifeName = dto.husbandOrWifeName;
    this.husbandOrWifeBirthDate = dto.husbandOrWifeBirthDate;
    this.husbandOrWifeOccupation = dto.husbandOrWifeOccupation;
    this.numberOfChildren = dto.numberOfChildren;
    this.fathersName = dto.fathersName;
    this.fathersBirthDate = dto.fathersBirthDate;
    this.fathersOccupation = dto.fathersOccupation;
    this.mothersName = dto.mothersName;
    this.mothersBirthDate = dto.mothersBirthDate;
    this.mothersOccupation = dto.mothersOccupation;
    /** bank account information */
    this.bankAccountNumber = dto.bankAccountNumber;
    this.bankAccountName = dto.bankAccountName;
    this.bankName = dto.bankName;
    this.bankBranch = dto.bankBranch;
    /** salary information */
    this.annualSalary = dto.annualSalary;
    this.monthlySalary = dto.monthlySalary;
    this.dailyRate = dto.dailyRate;
    this.hourlyRate = dto.hourlyRate;
    /** government information */
    this.phic = dto.phic;
    this.hdmf = dto.hdmf;
    this.sssNo = dto.sssNo;
    this.tinNo = dto.tinNo;
    this.taxExemptCode = dto.taxExemptCode;
  }
}
