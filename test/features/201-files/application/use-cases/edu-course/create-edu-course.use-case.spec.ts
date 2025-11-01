import { Test, TestingModule } from '@nestjs/testing';
import { CreateEduCourseUseCase } from '@features/201-files/application/use-cases/edu-course/create-edu-course.use-case';
import { EduCourseRepository } from '@features/201-files/domain/repositories/edu-course.repository';
import { EduCourse } from '@features/201-files/domain/models/edu-course.model';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { CreateEduCourseCommand } from '@features/201-files/application/commands/edu-course/create-edu-course.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';

describe('CreateEduCourseUseCase', () => {
  let useCase: CreateEduCourseUseCase;
  let eduCourseRepository: jest.Mocked<EduCourseRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockEduCourse = new EduCourse({
    id: 1,
    desc1: 'Computer Science',
    isActive: true,
  });

  const mockCreateCommand: CreateEduCourseCommand = {
    desc1: 'Computer Science',
  };

  const mockUserId = 'user-123';
  const mockRequestInfo = {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    sessionId: 'session-123',
    username: 'testuser',
  };

  beforeEach(async () => {
    const mockEduCourseRepository = {
      create: jest.fn(),
    };

    const mockActivityLogRepository = {
      create: jest.fn(),
    };

    const mockTransactionHelper = {
      executeTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateEduCourseUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
          useValue: mockTransactionHelper,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EDUCOURSE,
          useValue: mockEduCourseRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
          useValue: mockActivityLogRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateEduCourseUseCase>(CreateEduCourseUseCase);
    eduCourseRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.EDUCOURSE);
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully create an edu course and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseRepository.create.mockResolvedValue(mockEduCourse);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockCreateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.CREATE_EDUCOURSE,
        expect.any(Function),
      );
      expect(eduCourseRepository.create).toHaveBeenCalledWith(
        new EduCourse(mockCreateCommand),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_EDUCOURSE,
          entity: CONSTANTS_DATABASE_MODELS.EDUCOURSE,
          userId: mockUserId,
          details: JSON.stringify({
            educourseData: {
              id: mockEduCourse.id,
              desc1: mockEduCourse.desc1,
              isActive: mockEduCourse.isActive,
            },
          }),
          description: `Created new educourse: ${mockEduCourse.desc1}`,
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
      expect(result).toEqual(mockEduCourse);
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
      eduCourseRepository.create.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockCreateCommand, mockUserId, mockRequestInfo),
      ).rejects.toThrow('Database connection failed');

      expect(eduCourseRepository.create).toHaveBeenCalledWith(
        new EduCourse(mockCreateCommand),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_EDUCOURSE,
          entity: CONSTANTS_DATABASE_MODELS.EDUCOURSE,
          userId: mockUserId,
          details: JSON.stringify({ dto: mockCreateCommand }),
          description: `Failed to create educourse: ${mockCreateCommand.desc1}`,
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
      eduCourseRepository.create.mockResolvedValue(mockEduCourse);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(mockCreateCommand, mockUserId);

      // Assert
      expect(eduCourseRepository.create).toHaveBeenCalledWith(
        new EduCourse(mockCreateCommand),
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
      expect(result).toEqual(mockEduCourse);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseRepository.create.mockRejectedValue('Unknown error');
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
