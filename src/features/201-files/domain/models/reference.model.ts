export class Reference {
  id?: number;
  employeeId?: number;
  fname: string;
  mname?: string;
  lname: string;
  suffix?: string;
  cellphoneNumber?: string;
  isActive?: boolean;

  constructor(dto: {
    id?: number;
    employeeId?: number;
    fname: string;
    mname?: string;
    lname: string;
    suffix?: string;
    cellphoneNumber?: string;
    isActive?: boolean;
  }) {
    this.id = dto.id;
    this.employeeId = dto.employeeId;
    this.fname = dto.fname;
    this.mname = dto.mname;
    this.lname = dto.lname;
    this.suffix = dto.suffix;
    this.cellphoneNumber = dto.cellphoneNumber;
    this.isActive = dto.isActive;
  }
}
