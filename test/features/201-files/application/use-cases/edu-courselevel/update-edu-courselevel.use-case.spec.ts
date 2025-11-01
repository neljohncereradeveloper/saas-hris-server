import { Test, TestingModule } from '@nestjs/testing';
import { UpdateEduCourseLevelUseCase } from '@features/201-files/application/use-cases/edu-courselevel/update-edu-courselevel.use-case';
import { EduCourseLevelRepository } from '@features/201-files/domain/repositories/edu-courselevel.repository';
import { EduCourseLevel } from '@features/201-files/domain/models/edu-courselevel.model';
import { UpdateEduCourseLevelCommand } from '@features/201-files/application/commands/edu-course-level/update-edu-course-level.command';
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

describe('UpdateEduCourselevelUseCase', () => {
  let useCase: UpdateEduCourseLevelUseCase;
  let eduCourseLevelRepository: jest.Mocked<EduCourseLevelRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockEduCourseLevelId = 1;
  const mockExistingEduCourseLevel = new EduCourseLevel({
    id: mockEduCourseLevelId,
    desc1: 'Bachelor',
    isActive: true,
  });

  const mockUpdateCommand: UpdateEduCourseLevelCommand = {
    desc1: 'Master',
  };

  const mockUpdatedEduCourseLevel = new EduCourseLevel({
    id: mockEduCourseLevelId,
    desc1: 'Master',
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
    const mockEduCourseLevelRepository = {
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
        UpdateEduCourseLevelUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
          useValue: mockTransactionHelper,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EDUCOURSELEVEL,
          useValue: mockEduCourseLevelRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
          useValue: mockActivityLogRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateEduCourseLevelUseCase>(
      UpdateEduCourseLevelUseCase,
    );
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
    it('should successfully update an edu course level and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseLevelRepository.findById
        .mockResolvedValueOnce(mockExistingEduCourseLevel)
        .mockResolvedValueOnce(mockUpdatedEduCourseLevel);
      eduCourseLevelRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduCourseLevelId,
        mockUpdateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.UPDATE_EDUCOURSELEVEL,
        expect.any(Function),
      );
      expect(eduCourseLevelRepository.findById).toHaveBeenCalledWith(
        mockEduCourseLevelId,
        mockManager,
      );
      expect(eduCourseLevelRepository.update).toHaveBeenCalledWith(
        mockEduCourseLevelId,
        expect.any(EduCourseLevel),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_EDUCOURSELEVEL,
          entity: CONSTANTS_DATABASE_MODELS.EDUCOURSELEVEL,
          userId: mockUserId,
          details: JSON.stringify({
            oldData: {
              id: mockExistingEduCourseLevel.id,
              desc1: mockExistingEduCourseLevel.desc1,
              isActive: mockExistingEduCourseLevel.isActive,
            },
            newData: {
              id: mockUpdatedEduCourseLevel.id,
              desc1: mockUpdatedEduCourseLevel.desc1,
              isActive: mockUpdatedEduCourseLevel.isActive,
            },
          }),
          description: `Updated educourselevel: ${mockUpdatedEduCourseLevel.desc1}`,
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
      expect(result).toBe(mockUpdatedEduCourseLevel);
    });

    it('should work without request info', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseLevelRepository.findById
        .mockResolvedValueOnce(mockExistingEduCourseLevel)
        .mockResolvedValueOnce(mockUpdatedEduCourseLevel);
      eduCourseLevelRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduCourseLevelId,
        mockUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(eduCourseLevelRepository.findById).toHaveBeenCalledWith(
        mockEduCourseLevelId,
        mockManager,
      );
      expect(eduCourseLevelRepository.update).toHaveBeenCalledWith(
        mockEduCourseLevelId,
        expect.any(EduCourseLevel),
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
      expect(result).toBe(mockUpdatedEduCourseLevel);
    });

    it('should throw NotFoundException when edu course level does not exist', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseLevelRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockEduCourseLevelId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(eduCourseLevelRepository.findById).toHaveBeenCalledWith(
        mockEduCourseLevelId,
        mockManager,
      );
      expect(eduCourseLevelRepository.update).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_EDUCOURSELEVEL,
          entity: CONSTANTS_DATABASE_MODELS.EDUCOURSELEVEL,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockEduCourseLevelId,
            dto: mockUpdateCommand,
          }),
          description: `Failed to update educourselevel with ID: ${mockEduCourseLevelId}`,
          isSuccess: false,
          errorMessage: 'EduCourselevel not found',
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
      eduCourseLevelRepository.findById.mockResolvedValue(
        mockExistingEduCourseLevel,
      );
      eduCourseLevelRepository.update.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockEduCourseLevelId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(eduCourseLevelRepository.findById).toHaveBeenCalledWith(
        mockEduCourseLevelId,
        mockManager,
      );
      expect(eduCourseLevelRepository.update).toHaveBeenCalledWith(
        mockEduCourseLevelId,
        expect.any(EduCourseLevel),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'EduCourselevel update failed',
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
      eduCourseLevelRepository.findById.mockResolvedValue(
        mockExistingEduCourseLevel,
      );
      eduCourseLevelRepository.update.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockEduCourseLevelId,
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

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseLevelRepository.findById.mockResolvedValue(
        mockExistingEduCourseLevel,
      );
      eduCourseLevelRepository.update.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockEduCourseLevelId,
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

    it('should handle empty desc1 update', async () => {
      // Arrange
      const emptyDescCommand: UpdateEduCourseLevelCommand = {
        desc1: '',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseLevelRepository.findById
        .mockResolvedValueOnce(mockExistingEduCourseLevel)
        .mockResolvedValueOnce(mockUpdatedEduCourseLevel);
      eduCourseLevelRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduCourseLevelId,
        emptyDescCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(eduCourseLevelRepository.update).toHaveBeenCalledWith(
        mockEduCourseLevelId,
        expect.any(EduCourseLevel),
        mockManager,
      );
      expect(result).toBe(mockUpdatedEduCourseLevel);
    });

    it('should handle special characters in desc1 update', async () => {
      // Arrange
      const specialCharCommand: UpdateEduCourseLevelCommand = {
        desc1: "Master's Degree & PhD",
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      eduCourseLevelRepository.findById
        .mockResolvedValueOnce(mockExistingEduCourseLevel)
        .mockResolvedValueOnce(mockUpdatedEduCourseLevel);
      eduCourseLevelRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEduCourseLevelId,
        specialCharCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(eduCourseLevelRepository.update).toHaveBeenCalledWith(
        mockEduCourseLevelId,
        expect.any(EduCourseLevel),
        mockManager,
      );
      expect(result).toBe(mockUpdatedEduCourseLevel);
    });
  });
});
