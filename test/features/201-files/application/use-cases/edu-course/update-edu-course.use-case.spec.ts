import { Test, TestingModule } from '@nestjs/testing';
import { UpdateEduCourseUseCase } from '@features/201-files/application/use-cases/edu-course/update-edu-course.use-case';
import { EduCourseRepository } from '@features/201-files/domain/repositories/edu-course.repository';
import { EduCourse } from '@features/201-files/domain/models/edu-course.model';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { UpdateEduCourseCommand } from '@features/201-files/application/commands/edu-course/update-edu-course.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@features/shared/exceptions/shared';

describe('UpdateEduCourseUseCase', () => {
  let useCase: UpdateEduCourseUseCase;
  let eduCourseRepository: jest.Mocked<EduCourseRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockEduCourseId = 1;
  const mockExistingEduCourse = new EduCourse({
    id: mockEduCourseId,
    desc1: 'Computer Science',
    isActive: true,
  });

  const mockUpdatedEduCourse = new EduCourse({
    id: mockEduCourseId,
    desc1: 'Information Technology',
    isActive: true,
  });

  const mockUpdateCommand: UpdateEduCourseCommand = {
    desc1: 'Information Technology',
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
      findById: jest.fn(),
      update: jest.fn(),
    };

    const mockActivityLogRepository = {
      create: jest.fn(),
    };

    const mockTransactionHelper = {
      executeTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateEduCourseUseCase,
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

    useCase = module.get<UpdateEduCourseUseCase>(UpdateEduCourseUseCase);
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
    it('should successfully update an edu course and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseRepository.findById
        .mockResolvedValueOnce(mockExistingEduCourse) // First call for validation
        .mockResolvedValueOnce(mockUpdatedEduCourse); // Second call after update
      eduCourseRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduCourseId,
        mockUpdateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.UPDATE_EDUCOURSE,
        expect.any(Function),
      );
      expect(eduCourseRepository.findById).toHaveBeenCalledWith(
        mockEduCourseId,
        mockManager,
      );
      expect(eduCourseRepository.update).toHaveBeenCalledWith(
        mockEduCourseId,
        new EduCourse(mockUpdateCommand),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_EDUCOURSE,
          entity: CONSTANTS_DATABASE_MODELS.EDUCOURSE,
          userId: mockUserId,
          details: JSON.stringify({
            oldData: {
              id: mockExistingEduCourse.id,
              desc1: mockExistingEduCourse.desc1,
              isActive: mockExistingEduCourse.isActive,
            },
            newData: {
              id: mockUpdatedEduCourse.id,
              desc1: mockUpdatedEduCourse.desc1,
              isActive: mockUpdatedEduCourse.isActive,
            },
          }),
          description: `Updated educourse: ${mockUpdatedEduCourse.desc1}`,
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
      expect(result).toEqual(mockUpdatedEduCourse);
    });

    it('should throw NotFoundException when edu course does not exist', async () => {
      // Arrange
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
        useCase.execute(
          mockEduCourseId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(eduCourseRepository.findById).toHaveBeenCalledWith(
        mockEduCourseId,
        mockManager,
      );
      expect(eduCourseRepository.update).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_EDUCOURSE,
          entity: CONSTANTS_DATABASE_MODELS.EDUCOURSE,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockEduCourseId,
            dto: mockUpdateCommand,
          }),
          description: `Failed to update educourse with ID: ${mockEduCourseId}`,
          isSuccess: false,
          errorMessage: 'EduCourse not found',
          statusCode: 500,
          createdBy: mockUserId,
        }),
        mockManager,
      );
    });

    it('should throw SomethinWentWrongException when update fails', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseRepository.findById.mockResolvedValue(mockExistingEduCourse);
      eduCourseRepository.update.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockEduCourseId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(eduCourseRepository.findById).toHaveBeenCalledWith(
        mockEduCourseId,
        mockManager,
      );
      expect(eduCourseRepository.update).toHaveBeenCalledWith(
        mockEduCourseId,
        new EduCourse(mockUpdateCommand),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'EduCourse update failed',
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
      eduCourseRepository.findById.mockResolvedValue(mockExistingEduCourse);
      eduCourseRepository.update.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockEduCourseId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
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
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseRepository.findById
        .mockResolvedValueOnce(mockExistingEduCourse)
        .mockResolvedValueOnce(mockUpdatedEduCourse);
      eduCourseRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduCourseId,
        mockUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(eduCourseRepository.findById).toHaveBeenCalledWith(
        mockEduCourseId,
        mockManager,
      );
      expect(eduCourseRepository.update).toHaveBeenCalledWith(
        mockEduCourseId,
        new EduCourse(mockUpdateCommand),
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
      expect(result).toEqual(mockUpdatedEduCourse);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseRepository.findById.mockResolvedValue(mockExistingEduCourse);
      eduCourseRepository.update.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockEduCourseId,
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
