export class LeaveYearConfiguration {
  id?: number;
  cutoffStartDate: Date;
  cutoffEndDate: Date;
  year: string; // Leave year identifier (e.g., "2023-2024")
  remarks?: string;
  isActive?: boolean;

  constructor(dto: {
    id?: number;
    cutoffStartDate: Date;
    cutoffEndDate: Date;
    year: string;
    remarks?: string;
    isActive?: boolean;
  }) {
    this.id = dto.id;
    this.cutoffStartDate = dto.cutoffStartDate;
    this.cutoffEndDate = dto.cutoffEndDate;
    this.year = dto.year;
    this.remarks = dto.remarks;
    this.isActive = dto.isActive;
  }
}
