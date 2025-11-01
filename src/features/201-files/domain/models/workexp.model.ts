export class WorkExp {
  id?: number;
  employeeId?: number;
  companyId?: number;
  workexpJobTitleId?: number;
  years?: string;
  isActive?: boolean;

  constructor(dto: {
    id?: number;
    companyId?: number;
    workexpJobTitleId?: number;
    years?: string;
    employeeId?: number;
    isActive?: boolean;
  }) {
    this.id = dto.id;
    this.employeeId = dto.employeeId;
    this.companyId = dto.companyId;
    this.workexpJobTitleId = dto.workexpJobTitleId;
    this.years = dto.years;
    this.isActive = dto.isActive;
  }
}
