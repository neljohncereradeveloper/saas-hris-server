export class Edu {
  id?: number;
  employeeId: number;
  eduSchoolId: number;
  eduLevelId: number;
  eduCourseId?: number;
  eduCourseLevelId?: number;
  schoolYear: string;
  isActive?: boolean;

  constructor(dto: {
    id?: number;
    employeeId: number;
    eduSchoolId: number;
    eduLevelId: number;
    eduCourseId?: number;
    eduCourseLevelId?: number;
    schoolYear: string;
    isActive?: boolean;
  }) {
    this.id = dto.id;
    this.employeeId = dto.employeeId;
    this.eduSchoolId = dto.eduSchoolId;
    this.eduLevelId = dto.eduLevelId;
    this.eduCourseId = dto.eduCourseId;
    this.eduCourseLevelId = dto.eduCourseLevelId;
    this.schoolYear = dto.schoolYear;
    this.isActive = dto.isActive;
  }
}
