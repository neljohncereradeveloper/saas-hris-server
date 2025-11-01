import { Test, TestingModule } from '@nestjs/testing';
import { UpdateEduUseCase } from '@features/201-files/application/use-cases/edu/update-edu.use-case';
import { EduRepository } from '@features/201-files/domain/repositories/edu';
import { EduSchoolRepository } from '@features/201-files/domain/repositories/edu-school.repository';
import { EduCourseRepository } from '@features/201-files/domain/repositories/edu-course.repository';
import { EduLevelRepository } from '@features/201-files/domain/repositories/edu-level.repository';
import { EduCourseLevelRepository } from '@features/201-files/domain/repositories/edu-courselevel.repository';
import { Edu } from '@features/201-files/domain/models/edu';
import { EduSchool } from '@features/201-files/domain/models/edu-school.model';
import { EduCourse } from '@features/201-files/domain/models/edu-course.model';
import { EduLevel } from '@features/201-files/domain/models/edu-level.model';
import { EduCourseLevel } from '@features/201-files/domain/models/edu-courselevel.model';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { UpdateEduCommand } from '@features/201-files/application/commands/edu/update-edu.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';

describe('UpdateEduUseCase', () => {
  let useCase: UpdateEduUseCase;
  let eduRepository: jest.Mocked<EduRepository>;
  let eduSchoolRepository: jest.Mocked<EduSchoolRepository>;
  let eduCourseRepository: jest.Mocked<EduCourseRepository>;
  let eduLevelRepository: jest.Mocked<EduLevelRepository>;
  let eduCourseLevelRepository: jest.Mocked<EduCourseLevelRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockEduId = 1;
  const mockExistingEdu = new Edu({
    id: mockEduId,
    employeeId: 1,
    eduSchoolId: 1,
    eduLevelId: 1,
    eduCourseId: 1,
    eduCourseLevelId: 1,
    schoolYear: '2020-2021',
    isActive: true,
  });

  const mockUpdatedEdu = new Edu({
    id: mockEduId,
    employeeId: 1,
    eduSchoolId: 2,
    eduLevelId: 2,
    eduCourseId: 2,
    eduCourseLevelId: 2,
    schoolYear: '2021-2022',
    isActive: true,
  });

  const mockEduSchool = new EduSchool({
    id: 2,
    desc1: 'Ateneo de Manila University',
    isActive: true,
  });

  const mockEduCourse = new EduCourse({
    id: 2,
    desc1: 'Information Technology',
    isActive: true,
  });

  const mockEduLevel = new EduLevel({
    id: 2,
    desc1: 'Master',
    isActive: true,
  });

  const mockEduCourseLevel = new EduCourseLevel({
    id: 2,
    desc1: 'Second Year',
    isActive: true,
  });

  const mockUpdateCommand: UpdateEduCommand = {
    employeeId: 1,
    school: 'Ateneo de Manila University',
    eduLevel: 'Master',
    course: 'Information Technology',
    courseLevel: 'Second Year',
    schoolYear: '2021-2022',
  };

  const mockUserId = 'user-123';
  const mockRequestInfo = {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    sessionId: 'session-123',
    username: 'testuser',
  };

  beforeEach(async () => {
    const mockEduRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const mockEduSchoolRepository = {
      findByDescription: jest.fn(),
    };

    const mockEduCourseRepository = {
      findByDescription: jest.fn(),
    };

    const mockEduLevelRepository = {
      findByDescription: jest.fn(),
    };

    const mockEduCourseLevelRepository = {
      findByDescription: jest.fn(),
    };

    const mockActivityLogRepository = {
      create: jest.fn(),
    };

    const mockTransactionHelper = {
      executeTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateEduUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EDU,
          useValue: mockEduRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EDUSCHOOL,
          useValue: mockEduSchoolRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EDUCOURSE,
          useValue: mockEduCourseRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EDULEVEL,
          useValue: mockEduLevelRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EDUCOURSELEVEL,
          useValue: mockEduCourseLevelRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
          useValue: mockActivityLogRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
          useValue: mockTransactionHelper,
        },
      ],
    }).compile();

    useCase = module.get<UpdateEduUseCase>(UpdateEduUseCase);
    eduRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.EDU);
    eduSchoolRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.EDUSCHOOL);
    eduCourseRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.EDUCOURSE);
    eduLevelRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.EDULEVEL);
    eduCourseLevelRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.EDUCOURSELEVEL,
    );
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully update an edu record and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduRepository.findById
        .mockResolvedValueOnce(mockExistingEdu) // First call for validation
        .mockResolvedValueOnce(mockUpdatedEdu); // Second call after update
      eduSchoolRepository.findByDescription.mockResolvedValue(mockEduSchool);
      eduLevelRepository.findByDescription.mockResolvedValue(mockEduLevel);
      eduCourseRepository.findByDescription.mockResolvedValue(mockEduCourse);
      eduCourseLevelRepository.findByDescription.mockResolvedValue(
        mockEduCourseLevel,
      );
      eduRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduId,
        mockUpdateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.UPDATE_EDU,
        expect.any(Function),
      );
      expect(eduRepository.findById).toHaveBeenCalledWith(
        mockEduId,
        mockManager,
      );
      expect(eduSchoolRepository.findByDescription).toHaveBeenCalledWith(
        mockUpdateCommand.school,
        mockManager,
      );
      expect(eduLevelRepository.findByDescription).toHaveBeenCalledWith(
        mockUpdateCommand.eduLevel,
        mockManager,
      );
      expect(eduCourseRepository.findByDescription).toHaveBeenCalledWith(
        mockUpdateCommand.course,
        mockManager,
      );
      expect(eduCourseLevelRepository.findByDescription).toHaveBeenCalledWith(
        mockUpdateCommand.courseLevel,
        mockManager,
      );
      expect(eduRepository.update).toHaveBeenCalledWith(
        mockEduId,
        expect.objectContaining({
          employeeId: mockUpdateCommand.employeeId,
          eduSchoolId: mockEduSchool.id,
          eduLevelId: mockEduLevel.id,
          eduCourseId: mockEduCourse.id,
          eduCourseLevelId: mockEduCourseLevel.id,
          schoolYear: mockUpdateCommand.schoolYear,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_EDU,
          entity: CONSTANTS_DATABASE_MODELS.EDU,
          userId: mockUserId,
          details: JSON.stringify({
            oldData: {
              id: mockExistingEdu.id,
              employeeId: mockExistingEdu.employeeId,
              eduSchoolId: mockExistingEdu.eduSchoolId,
              eduLevelId: mockExistingEdu.eduLevelId,
              eduCourseId: mockExistingEdu.eduCourseId,
              eduCourseLevelId: mockExistingEdu.eduCourseLevelId,
              schoolYear: mockExistingEdu.schoolYear,
              isActive: mockExistingEdu.isActive,
            },
            newData: {
              id: mockUpdatedEdu.id,
              employeeId: mockUpdatedEdu.employeeId,
              eduSchoolId: mockUpdatedEdu.eduSchoolId,
              eduLevelId: mockUpdatedEdu.eduLevelId,
              eduCourseId: mockUpdatedEdu.eduCourseId,
              eduCourseLevelId: mockUpdatedEdu.eduCourseLevelId,
              schoolYear: mockUpdatedEdu.schoolYear,
              isActive: mockUpdatedEdu.isActive,
            },
          }),
          description: `Updated edu: ${mockUpdatedEdu.id}`,
          ipAddress: mockRequestInfo.ipAddress,
          userAgent: mockRequestInfo.userAgent,
          sessionId: mockRequestInfo.sessionId,
          username: mockRequestInfo.username,
          isSuccess: true,
          statusCode: 200,
          createdBy: mockUserId,
        }),
        mockManager,
      );
      expect(result).toEqual(mockUpdatedEdu);
    });

    it('should throw NotFoundException when edu record does not exist', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockEduId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow('EmployeeEducation not found');

      expect(eduRepository.findById).toHaveBeenCalledWith(
        mockEduId,
        mockManager,
      );
      expect(eduRepository.update).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_EDU,
          entity: CONSTANTS_DATABASE_MODELS.EDU,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockEduId,
            dto: mockUpdateCommand,
          }),
          description: `Failed to update edu with ID: ${mockEduId}`,
          isSuccess: false,
          errorMessage: 'EmployeeEducation not found',
          statusCode: 500,
          createdBy: mockUserId,
        }),
        mockManager,
      );
    });

    it('should handle update failure and log error', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduRepository.findById.mockResolvedValue(mockExistingEdu);
      eduSchoolRepository.findByDescription.mockResolvedValue(mockEduSchool);
      eduLevelRepository.findByDescription.mockResolvedValue(mockEduLevel);
      eduCourseRepository.findByDescription.mockResolvedValue(mockEduCourse);
      eduCourseLevelRepository.findByDescription.mockResolvedValue(
        mockEduCourseLevel,
      );
      eduRepository.update.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockEduId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow('Database connection failed');

      expect(eduRepository.findById).toHaveBeenCalledWith(
        mockEduId,
        mockManager,
      );
      expect(eduRepository.update).toHaveBeenCalledWith(
        mockEduId,
        expect.objectContaining({
          employeeId: mockUpdateCommand.employeeId,
          eduSchoolId: mockEduSchool.id,
          eduLevelId: mockEduLevel.id,
          eduCourseId: mockEduCourse.id,
          eduCourseLevelId: mockEduCourseLevel.id,
          schoolYear: mockUpdateCommand.schoolYear,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Database connection failed',
        }),
        mockManager,
      );
    });

    it('should work without request info', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduRepository.findById
        .mockResolvedValueOnce(mockExistingEdu)
        .mockResolvedValueOnce(mockUpdatedEdu);
      eduSchoolRepository.findByDescription.mockResolvedValue(mockEduSchool);
      eduLevelRepository.findByDescription.mockResolvedValue(mockEduLevel);
      eduCourseRepository.findByDescription.mockResolvedValue(mockEduCourse);
      eduCourseLevelRepository.findByDescription.mockResolvedValue(
        mockEduCourseLevel,
      );
      eduRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduId,
        mockUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(eduRepository.findById).toHaveBeenCalledWith(
        mockEduId,
        mockManager,
      );
      expect(eduRepository.update).toHaveBeenCalledWith(
        mockEduId,
        expect.objectContaining({
          employeeId: mockUpdateCommand.employeeId,
          eduSchoolId: mockEduSchool.id,
          eduLevelId: mockEduLevel.id,
          eduCourseId: mockEduCourse.id,
          eduCourseLevelId: mockEduCourseLevel.id,
          schoolYear: mockUpdateCommand.schoolYear,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: null,
          userAgent: null,
          sessionId: null,
          username: null,
        }),
        mockManager,
      );
      expect(result).toEqual(mockUpdatedEdu);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduRepository.findById.mockResolvedValue(mockExistingEdu);
      eduSchoolRepository.findByDescription.mockResolvedValue(mockEduSchool);
      eduLevelRepository.findByDescription.mockResolvedValue(mockEduLevel);
      eduCourseRepository.findByDescription.mockResolvedValue(mockEduCourse);
      eduCourseLevelRepository.findByDescription.mockResolvedValue(
        mockEduCourseLevel,
      );
      eduRepository.update.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockEduId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toBe('Unknown error');

      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Unknown error',
        }),
        mockManager,
      );
    });
  });
});
