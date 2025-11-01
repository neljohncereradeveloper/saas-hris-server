export class Dept {
  id?: number;
  desc1: string;
  code: string;
  designation: string;
  isActive?: boolean;

  constructor(dto: {
    id?: number;
    desc1: string;
    code: string;
    designation: string;
    isActive?: boolean;
  }) {
    this.id = dto.id;
    this.desc1 = dto.desc1;
    this.code = dto.code;
    this.designation = dto.designation;
    this.isActive = dto.isActive;
  }
}
