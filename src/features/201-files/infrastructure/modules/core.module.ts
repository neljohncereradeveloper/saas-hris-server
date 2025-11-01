import { Module } from '@nestjs/common';
import { BranchModule } from './branch/branch.module';
import { BarangayModule } from './barangay/barangay.module';
import { CitizenshipModule } from './citizenship/citizenship.module';
import { CityModule } from './city/city.module';
import { CivilStatusModule } from './civilstatus/civil-status.module';
import { DepartmentModule } from './department/department.module';
import { EduModule } from './edu/edu.module';
import { EduCourseModule } from './edu-course/edu-course.module';
import { EduCourseLevelModule } from './edu-courselevel/edu-courselevel.module';
import { EduLevelModule } from './edu-level/edu-level.module';
import { EduSchoolModule } from './edu-school/edu-school.module';
import { EmpStatusModule } from './empstatus/empstatus.module';
import { JobTitleModule } from './jobtitle/jobtitle.module';
import { ProvinceModule } from './province/province.module';
import { ReferenceModule } from './reference/reference.module';
import { EmployeeMovementModule } from '@features/201-files/infrastructure/modules/employee-movement/employee-movement.module';
import { ReligionModule } from './religion/religion.module';
import { TrainingModule } from './training/training.module';
import { TrainingCertModule } from './training-cert/training-cert.module';
import { WorkExpModule } from './workexp/workexp.module';
import { WorkExpCompanyModule } from './workexp-company/workexp-company.module';
import { WorkExpJobTitleModule } from './workexp-jobtitle/workexp-jobtitle.module';
import { EmployeeModule } from './employee/employee.module';
import { EmployeeMovementTypeModule } from './employee-movement-type/employee-movement-type.module';

@Module({
  imports: [
    BranchModule,
    BarangayModule,
    CitizenshipModule,
    CityModule,
    CivilStatusModule,
    DepartmentModule,
    EduModule,
    EduCourseModule,
    EduCourseLevelModule,
    EduLevelModule,
    EduSchoolModule,
    EmpStatusModule,
    JobTitleModule,
    ProvinceModule,
    ReferenceModule,
    EmployeeMovementModule,
    EmployeeMovementTypeModule,
    ReligionModule,
    TrainingModule,
    TrainingCertModule,
    WorkExpModule,
    WorkExpCompanyModule,
    WorkExpJobTitleModule,
    EmployeeModule,
  ],
})
export class Core201FileModule {}
