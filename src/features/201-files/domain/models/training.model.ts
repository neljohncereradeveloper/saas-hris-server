export class Training {
  id?: number;
  employeeId?: number;
  trainingDate: Date;
  trainingsCertId: number;
  imagePath?: string;
  trainingTitle?: string;
  desc1?: string;
  isActive?: boolean;

  constructor(dto: {
    id?: number;
    trainingDate: Date;
    trainingsCertId: number;
    trainingTitle?: string;
    desc1?: string;
    employeeId?: number;
    imagePath?: string;
    isActive?: boolean;
  }) {
    this.id = dto.id;
    this.employeeId = dto.employeeId;
    this.trainingDate = dto.trainingDate;
    this.trainingTitle = dto.trainingTitle;
    this.trainingsCertId = dto.trainingsCertId;
    this.desc1 = dto.desc1;
    this.imagePath = dto.imagePath;
    this.isActive = dto.isActive;
  }
}
