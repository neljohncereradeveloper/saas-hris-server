import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import {
  SomethinWentWrongException,
  NotFoundException,
} from '@features/shared/exceptions/shared';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { UpdateEduCommand } from '@features/201-files/application/commands/edu/update-edu.command';
import { EduRepository } from '@features/201-files/domain/repositories/edu';
import { EduCourseRepository } from '@features/201-files/domain/repositories/edu-course.repository';
import { EduSchoolRepository } from '@features/201-files/domain/repositories/edu-school.repository';
import { EduCourseLevelRepository } from '@features/201-files/domain/repositories/edu-courselevel.repository';
import { EduLevelRepository } from '@features/201-files/domain/repositories/edu-level.repository';
import { Edu } from '@features/201-files/domain/models/edu';

@Injectable()
export class UpdateEduUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EDU)
    private readonly eduRepository: EduRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EDUCOURSE)
    private readonly courseRepository: EduCourseRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EDUCOURSELEVEL)
    private readonly courseLevelRepository: EduCourseLevelRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EDUSCHOOL)
    private readonly eduSchoolRepository: EduSchoolRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EDULEVEL)
    private readonly educationLevelRepository: EduLevelRepository,
  ) {}

  async execute(
    id: number,
    dto: UpdateEduCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<Edu | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_EDU,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_EDU,
          CONSTANTS_DATABASE_MODELS.EDU,
          userId,
          { id, dto },
          requestInfo,
          `Updated edu: ${dto.school}`,
          `Failed to update edu with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Validate employeeEducation existence
            const eduResult = await this.eduRepository.findById(id, manager);
            if (!eduResult) {
              throw new NotFoundException('EmployeeEducation not found');
            }

            // Validate school existence
            const school = await this.eduSchoolRepository.findByDescription(
              dto.school,
              manager,
            );
            if (!school) {
              throw new NotFoundException('School not found');
            }

            // Validate educationLevel existence
            const educationLevelResult =
              await this.educationLevelRepository.findByDescription(
                dto.eduLevel,
                manager,
              );
            if (!educationLevelResult) {
              throw new NotFoundException('Education level not found');
            }

            // Fetch course and courseLevel, but check for null
            const course = dto.course
              ? await this.courseRepository.findByDescription(
                  dto.course,
                  manager,
                )
              : null;

            const courseLevel = dto.courseLevel
              ? await this.courseLevelRepository.findByDescription(
                  dto.courseLevel,
                  manager,
                )
              : null;

            // Update the edu
            const updateSuccessfull = await this.eduRepository.update(
              id,
              new Edu({
                employeeId: eduResult.employeeId,
                eduSchoolId: school.id!,
                eduLevelId: educationLevelResult.id!,
                eduCourseId: course?.id,
                eduCourseLevelId: courseLevel?.id,
                schoolYear: dto.schoolYear,
              }),
              manager,
            );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException('Edu update failed');
            }

            // Retrieve the updated edu
            const edu = await this.eduRepository.findById(id, manager);

            return edu!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
