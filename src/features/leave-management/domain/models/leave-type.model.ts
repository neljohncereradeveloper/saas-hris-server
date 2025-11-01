export class LeaveType {
  id?: number;
  name: string;
  code: string;
  desc1: string;
  paid: boolean;
  remarks?: string;
  isActive?: boolean;

  constructor(dto: {
    id?: number;
    name: string;
    code: string;
    desc1: string;
    paid: boolean;
    remarks?: string;
    isActive?: boolean;
  }) {
    this.id = dto.id;
    this.name = dto.name;
    this.code = dto.code;
    this.desc1 = dto.desc1;
    this.paid = dto.paid;
    this.remarks = dto.remarks;
    this.isActive = dto.isActive;
  }
}
