import { Test, TestingModule } from '@nestjs/testing';
import { CreateEduUseCase } from '@features/201-files/application/use-cases/edu/create-edu.use-case';
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
import { CreateEduCommand } from '@features/201-files/application/commands/edu/create-edu.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';

describe('CreateEduUseCase', () => {
  let useCase: CreateEduUseCase;
  let eduRepository: jest.Mocked<EduRepository>;
  let eduSchoolRepository: jest.Mocked<EduSchoolRepository>;
  let eduCourseRepository: jest.Mocked<EduCourseRepository>;
  let eduLevelRepository: jest.Mocked<EduLevelRepository>;
  let eduCourseLevelRepository: jest.Mocked<EduCourseLevelRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockEdu = new Edu({
    id: 1,
    employeeId: 1,
    eduSchoolId: 1,
    eduLevelId: 1,
    eduCourseId: 1,
    eduCourseLevelId: 1,
    schoolYear: '2020-2021',
    isActive: true,
  });

  const mockEduSchool = new EduSchool({
    id: 1,
    desc1: 'University of the Philippines',
    isActive: true,
  });

  const mockEduCourse = new EduCourse({
    id: 1,
    desc1: 'Computer Science',
    isActive: true,
  });

  const mockEduLevel = new EduLevel({
    id: 1,
    desc1: 'Bachelor',
    isActive: true,
  });

  const mockEduCourseLevel = new EduCourseLevel({
    id: 1,
    desc1: 'First Year',
    isActive: true,
  });

  const mockCreateCommand: CreateEduCommand = {
    employeeId: 1,
    school: 'University of the Philippines',
    eduLevel: 'Bachelor',
    course: 'Computer Science',
    courseLevel: 'First Year',
    schoolYear: '2020-2021',
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
      create: jest.fn(),
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
        CreateEduUseCase,
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

    useCase = module.get<CreateEduUseCase>(CreateEduUseCase);
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
    it('should successfully create an edu record and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduSchoolRepository.findByDescription.mockResolvedValue(mockEduSchool);
      eduLevelRepository.findByDescription.mockResolvedValue(mockEduLevel);
      eduCourseRepository.findByDescription.mockResolvedValue(mockEduCourse);
      eduCourseLevelRepository.findByDescription.mockResolvedValue(
        mockEduCourseLevel,
      );
      eduRepository.create.mockResolvedValue(mockEdu);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockCreateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.CREATE_EDU,
        expect.any(Function),
      );
      expect(eduSchoolRepository.findByDescription).toHaveBeenCalledWith(
        mockCreateCommand.school,
        mockManager,
      );
      expect(eduLevelRepository.findByDescription).toHaveBeenCalledWith(
        mockCreateCommand.eduLevel,
        mockManager,
      );
      expect(eduCourseRepository.findByDescription).toHaveBeenCalledWith(
        mockCreateCommand.course,
        mockManager,
      );
      expect(eduCourseLevelRepository.findByDescription).toHaveBeenCalledWith(
        mockCreateCommand.courseLevel,
        mockManager,
      );
      expect(eduRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeId: mockCreateCommand.employeeId,
          eduSchoolId: mockEduSchool.id,
          eduLevelId: mockEduLevel.id,
          eduCourseId: mockEduCourse.id,
          eduCourseLevelId: mockEduCourseLevel.id,
          schoolYear: mockCreateCommand.schoolYear,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_EDU,
          entity: CONSTANTS_DATABASE_MODELS.EDU,
          userId: mockUserId,
          details: JSON.stringify({
            eduData: {
              id: mockEdu.id,
              employeeId: mockEdu.employeeId,
              eduSchoolId: mockEdu.eduSchoolId,
              eduLevelId: mockEdu.eduLevelId,
              eduCourseId: mockEdu.eduCourseId,
              eduCourseLevelId: mockEdu.eduCourseLevelId,
              schoolYear: mockEdu.schoolYear,
              isActive: mockEdu.isActive,
            },
          }),
          description: `Created new edu For Employee: ${mockEdu.employeeId}`,
          ipAddress: mockRequestInfo.ipAddress,
          userAgent: mockRequestInfo.userAgent,
          sessionId: mockRequestInfo.sessionId,
          username: mockRequestInfo.username,
          isSuccess: true,
          statusCode: 201,
          createdBy: mockUserId,
        }),
        mockManager,
      );
      expect(result).toEqual(mockEdu);
    });

    it('should handle creation failure and log error', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduSchoolRepository.findByDescription.mockResolvedValue(mockEduSchool);
      eduLevelRepository.findByDescription.mockResolvedValue(mockEduLevel);
      eduCourseRepository.findByDescription.mockResolvedValue(mockEduCourse);
      eduCourseLevelRepository.findByDescription.mockResolvedValue(
        mockEduCourseLevel,
      );
      eduRepository.create.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockCreateCommand, mockUserId, mockRequestInfo),
      ).rejects.toThrow('Database connection failed');

      expect(eduRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeId: mockCreateCommand.employeeId,
          eduSchoolId: mockEduSchool.id,
          eduLevelId: mockEduLevel.id,
          eduCourseId: mockEduCourse.id,
          eduCourseLevelId: mockEduCourseLevel.id,
          schoolYear: mockCreateCommand.schoolYear,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_EDU,
          entity: CONSTANTS_DATABASE_MODELS.EDU,
          userId: mockUserId,
          details: JSON.stringify({ dto: mockCreateCommand }),
          description: `Failed to create edu For Employee: ${mockCreateCommand.employeeId}`,
          ipAddress: mockRequestInfo.ipAddress,
          userAgent: mockRequestInfo.userAgent,
          sessionId: mockRequestInfo.sessionId,
          username: mockRequestInfo.username,
          isSuccess: false,
          errorMessage: 'Database connection failed',
          statusCode: 500,
          createdBy: mockUserId,
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
      eduSchoolRepository.findByDescription.mockResolvedValue(mockEduSchool);
      eduLevelRepository.findByDescription.mockResolvedValue(mockEduLevel);
      eduCourseRepository.findByDescription.mockResolvedValue(mockEduCourse);
      eduCourseLevelRepository.findByDescription.mockResolvedValue(
        mockEduCourseLevel,
      );
      eduRepository.create.mockResolvedValue(mockEdu);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(mockCreateCommand, mockUserId);

      // Assert
      expect(eduRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeId: mockCreateCommand.employeeId,
          eduSchoolId: mockEduSchool.id,
          eduLevelId: mockEduLevel.id,
          eduCourseId: mockEduCourse.id,
          eduCourseLevelId: mockEduCourseLevel.id,
          schoolYear: mockCreateCommand.schoolYear,
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
      expect(result).toEqual(mockEdu);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduSchoolRepository.findByDescription.mockResolvedValue(mockEduSchool);
      eduLevelRepository.findByDescription.mockResolvedValue(mockEduLevel);
      eduCourseRepository.findByDescription.mockResolvedValue(mockEduCourse);
      eduCourseLevelRepository.findByDescription.mockResolvedValue(
        mockEduCourseLevel,
      );
      eduRepository.create.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockCreateCommand, mockUserId, mockRequestInfo),
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
