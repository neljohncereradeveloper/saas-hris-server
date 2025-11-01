import { Test, TestingModule } from '@nestjs/testing';
import { SoftDeleteEduCourseUseCase } from '@features/201-files/application/use-cases/edu-course/soft-delete-edu-course.use-case';
import { EduCourseRepository } from '@features/201-files/domain/repositories/edu-course.repository';
import { EduCourse } from '@features/201-files/domain/models/edu-course.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@features/shared/exceptions/shared';

describe('SoftDeleteEduCourseUseCase', () => {
  let useCase: SoftDeleteEduCourseUseCase;
  let eduCourseRepository: jest.Mocked<EduCourseRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockEduCourseId = 1;
  const mockEduCourse = new EduCourse({
    id: mockEduCourseId,
    desc1: 'Computer Science',
    isActive: true,
  });

  const mockUserId = 'user-123';
  const mockRequestInfo = {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    sessionId: 'session-123',
    username: 'testuser',
  };

  beforeEach(async () => {
    const mockEduCourseRepository = {
      findById: jest.fn(),
      softDelete: jest.fn(),
    };

    const mockActivityLogRepository = {
      create: jest.fn(),
    };

    const mockTransactionHelper = {
      executeTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SoftDeleteEduCourseUseCase,
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

    useCase = module.get<SoftDeleteEduCourseUseCase>(
      SoftDeleteEduCourseUseCase,
    );
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
    it('should successfully soft delete an edu course and log the activity', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseRepository.findById.mockResolvedValue(mockEduCourse);
      eduCourseRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduCourseId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.SOFT_DELETE_EDUCOURSE,
        expect.any(Function),
      );
      expect(eduCourseRepository.findById).toHaveBeenCalledWith(
        mockEduCourseId,
        mockManager,
      );
      expect(eduCourseRepository.softDelete).toHaveBeenCalledWith(
        mockEduCourseId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_EDUCOURSE,
          entity: CONSTANTS_DATABASE_MODELS.EDUCOURSE,
          userId: mockUserId,
          details: JSON.stringify({
            educourseData: {
              id: mockEduCourse.id,
              desc1: mockEduCourse.desc1,
              previousStatus: mockEduCourse.isActive,
              newStatus: isActive,
            },
          }),
          description: `${mockEduCourse.desc1} has been ${isActive ? 'activated' : 'deactivated'}`,
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
      expect(result).toBe(true);
    });

    it('should successfully activate an edu course and log the activity', async () => {
      // Arrange
      const isActive = true;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseRepository.findById.mockResolvedValue(mockEduCourse);
      eduCourseRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduCourseId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.SOFT_DELETE_EDUCOURSE,
        expect.any(Function),
      );
      expect(eduCourseRepository.findById).toHaveBeenCalledWith(
        mockEduCourseId,
        mockManager,
      );
      expect(eduCourseRepository.softDelete).toHaveBeenCalledWith(
        mockEduCourseId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_EDUCOURSE,
          entity: CONSTANTS_DATABASE_MODELS.EDUCOURSE,
          userId: mockUserId,
          details: JSON.stringify({
            educourseData: {
              id: mockEduCourse.id,
              desc1: mockEduCourse.desc1,
              previousStatus: mockEduCourse.isActive,
              newStatus: isActive,
            },
          }),
          description: `${mockEduCourse.desc1} has been ${isActive ? 'activated' : 'deactivated'}`,
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
      expect(result).toBe(true);
    });

    it('should throw NotFoundException when edu course does not exist', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockEduCourseId, isActive, mockUserId, mockRequestInfo),
      ).rejects.toThrow(NotFoundException);

      expect(eduCourseRepository.findById).toHaveBeenCalledWith(
        mockEduCourseId,
        mockManager,
      );
      expect(eduCourseRepository.softDelete).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_EDUCOURSE,
          entity: CONSTANTS_DATABASE_MODELS.EDUCOURSE,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockEduCourseId,
            isActive,
          }),
          description: `Failed to deactivate educourse with ID: ${mockEduCourseId}`,
          isSuccess: false,
          errorMessage: 'EduCourse not found',
          statusCode: 500,
          createdBy: mockUserId,
        }),
        mockManager,
      );
    });

    it('should throw SomethinWentWrongException when soft delete fails', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseRepository.findById.mockResolvedValue(mockEduCourse);
      eduCourseRepository.softDelete.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockEduCourseId, isActive, mockUserId, mockRequestInfo),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(eduCourseRepository.findById).toHaveBeenCalledWith(
        mockEduCourseId,
        mockManager,
      );
      expect(eduCourseRepository.softDelete).toHaveBeenCalledWith(
        mockEduCourseId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'EduCourse soft delete failed',
        }),
        mockManager,
      );
    });

    it('should handle soft delete failure and log error', async () => {
      // Arrange
      const isActive = false;
      const mockError = new Error('Database connection failed');
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseRepository.findById.mockResolvedValue(mockEduCourse);
      eduCourseRepository.softDelete.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockEduCourseId, isActive, mockUserId, mockRequestInfo),
      ).rejects.toThrow('Database connection failed');

      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Database connection failed',
        }),
        mockManager,
      );
    });

    it('should work without request info', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseRepository.findById.mockResolvedValue(mockEduCourse);
      eduCourseRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduCourseId,
        isActive,
        mockUserId,
      );

      // Assert
      expect(eduCourseRepository.findById).toHaveBeenCalledWith(
        mockEduCourseId,
        mockManager,
      );
      expect(eduCourseRepository.softDelete).toHaveBeenCalledWith(
        mockEduCourseId,
        isActive,
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
      expect(result).toBe(true);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseRepository.findById.mockResolvedValue(mockEduCourse);
      eduCourseRepository.softDelete.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockEduCourseId, isActive, mockUserId, mockRequestInfo),
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
