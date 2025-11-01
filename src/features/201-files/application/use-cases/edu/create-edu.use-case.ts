import { Edu } from '@features/201-files/domain/models/edu';
import { EduRepository } from '@features/201-files/domain/repositories/edu';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { CreateEduCommand } from '@features/201-files/application/commands/edu/create-edu.command';
import { EduSchoolRepository } from '@features/201-files/domain/repositories/edu-school.repository';
import { EduCourseRepository } from '@features/201-files/domain/repositories/edu-course.repository';
import { EduLevelRepository } from '@features/201-files/domain/repositories/edu-level.repository';
import { EduCourseLevelRepository } from '@features/201-files/domain/repositories/edu-courselevel.repository';
import { NotFoundException } from '@features/shared/exceptions/shared';

@Injectable()
export class CreateEduUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EDU)
    private readonly eduRepository: EduRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EDUSCHOOL)
    private readonly eduSchoolRepository: EduSchoolRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EDULEVEL)
    private readonly educationLevelRepository: EduLevelRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EDUCOURSE)
    private readonly courseRepository: EduCourseRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EDUCOURSELEVEL)
    private readonly courseLevelRepository: EduCourseLevelRepository,
  ) {}

  async execute(
    dto: CreateEduCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<Edu> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_EDU,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_EDU,
          CONSTANTS_DATABASE_MODELS.EDU,
          userId,
          dto,
          requestInfo,
          `Created new edu For Employee: ${dto.employeeId}`,
          `Failed to create edu For Employee: ${dto.employeeId}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            const school = await this.eduSchoolRepository.findByDescription(
              dto.school,
              manager,
            );
            if (!school) {
              throw new NotFoundException('School not found');
            }
            const educationLevel =
              await this.educationLevelRepository.findByDescription(
                dto.eduLevel,
                manager,
              );
            if (!educationLevel) {
              throw new NotFoundException('Education level not found');
            }
            // Fetch course and courseLevel, but check for null
            let course;
            if (dto.course) {
              course = await this.courseRepository.findByDescription(
                dto.course,
                manager,
              );
              if (!course) {
                throw new NotFoundException('Course not found');
              }
            }
            let courseLevel;
            if (dto.courseLevel) {
              courseLevel = await this.courseLevelRepository.findByDescription(
                dto.courseLevel,
                manager,
              );
              if (!courseLevel) {
                throw new NotFoundException('Course level not found');
              }
            }

            const emp = new Edu({
              employeeId: dto.employeeId,
              eduSchoolId: school.id!,
              eduLevelId: educationLevel.id!,
              eduCourseId: course?.id || undefined,
              eduCourseLevelId: courseLevel?.id || undefined,
              schoolYear: dto.schoolYear,
            });

            // Create the edu
            const edu = await this.eduRepository.create(emp, manager);

            return edu;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
