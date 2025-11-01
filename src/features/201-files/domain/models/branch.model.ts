export class Branch {
  id?: number;
  desc1: string;
  brCode: string;
  isActive?: boolean;

  constructor(dto: {
    id?: number;
    desc1: string;
    brCode: string;
    isActive?: boolean;
  }) {
    this.id = dto.id;
    this.desc1 = dto.desc1;
    this.brCode = dto.brCode;
    this.isActive = dto.isActive;
  }
}
