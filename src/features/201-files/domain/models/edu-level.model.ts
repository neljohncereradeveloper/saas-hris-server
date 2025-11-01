export class EduLevel {
  id?: number;
  desc1: string;
  isActive?: boolean;

  constructor(dto: { id?: number; desc1: string; isActive?: boolean }) {
    this.id = dto.id;
    this.desc1 = dto.desc1;
    this.isActive = dto.isActive;
  }
}
