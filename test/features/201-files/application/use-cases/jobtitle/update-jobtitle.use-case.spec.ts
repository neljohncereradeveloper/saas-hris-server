import { Test, TestingModule } from '@nestjs/testing';
import { UpdateJobTitleUseCase } from '@features/201-files/application/use-cases/jobtitle/update-jobtitle.use-case';
import { JobTitleRepository } from '@features/201-files/domain/repositories/jobtitle.repository';
import { JobTitle } from '@features/201-files/domain/models/jobtitle.model';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { UpdateJobTitleCommand } from '@features/201-files/application/commands/jobtitle/update-jobtitle.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@features/shared/exceptions/shared';

describe('UpdateJobtitleUseCase', () => {
  let useCase: UpdateJobTitleUseCase;
  let jobTitleRepository: jest.Mocked<JobTitleRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockJobTitleId = 1;
  const mockExistingJobTitle = new JobTitle({
    id: mockJobTitleId,
    desc1: 'Software Engineer',
    isActive: true,
  });

  const mockUpdatedJobTitle = new JobTitle({
    id: mockJobTitleId,
    desc1: 'Senior Software Engineer',
    isActive: true,
  });

  const mockUpdateCommand: UpdateJobTitleCommand = {
    desc1: 'Senior Software Engineer',
  };

  const mockUserId = 'user-123';
  const mockRequestInfo = {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    sessionId: 'session-123',
    username: 'testuser',
  };

  beforeEach(async () => {
    const mockJobTitleRepository = {
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
        UpdateJobTitleUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.JOBTITLE,
          useValue: mockJobTitleRepository,
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

    useCase = module.get<UpdateJobTitleUseCase>(UpdateJobTitleUseCase);
    jobTitleRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.JOBTITLE);
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully update a jobtitle record and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      jobTitleRepository.findById
        .mockResolvedValueOnce(mockExistingJobTitle) // First call for validation
        .mockResolvedValueOnce(mockUpdatedJobTitle); // Second call after update
      jobTitleRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockJobTitleId,
        mockUpdateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.UPDATE_JOBTITLE,
        expect.any(Function),
      );
      expect(jobTitleRepository.findById).toHaveBeenCalledWith(
        mockJobTitleId,
        mockManager,
      );
      expect(jobTitleRepository.update).toHaveBeenCalledWith(
        mockJobTitleId,
        expect.objectContaining({
          desc1: mockUpdateCommand.desc1,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_JOBTITLE,
          entity: CONSTANTS_DATABASE_MODELS.JOBTITLE,
          userId: mockUserId,
          details: JSON.stringify({
            oldData: {
              id: mockExistingJobTitle.id,
              desc1: mockExistingJobTitle.desc1,
              isActive: mockExistingJobTitle.isActive,
            },
            newData: {
              id: mockUpdatedJobTitle.id,
              desc1: mockUpdatedJobTitle.desc1,
              isActive: mockUpdatedJobTitle.isActive,
            },
          }),
          description: `Updated jobtitle: ${mockUpdatedJobTitle.desc1}`,
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
      expect(result).toEqual(mockUpdatedJobTitle);
    });

    it('should throw NotFoundException when jobtitle record does not exist', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      jobTitleRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockJobTitleId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(jobTitleRepository.findById).toHaveBeenCalledWith(
        mockJobTitleId,
        mockManager,
      );
      expect(jobTitleRepository.update).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_JOBTITLE,
          entity: CONSTANTS_DATABASE_MODELS.JOBTITLE,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockJobTitleId,
            dto: mockUpdateCommand,
          }),
          description: `Failed to update jobtitle with ID: ${mockJobTitleId}`,
          isSuccess: false,
          errorMessage: 'Jobtitle not found',
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
      jobTitleRepository.findById.mockResolvedValue(mockExistingJobTitle);
      jobTitleRepository.update.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockJobTitleId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(jobTitleRepository.findById).toHaveBeenCalledWith(
        mockJobTitleId,
        mockManager,
      );
      expect(jobTitleRepository.update).toHaveBeenCalledWith(
        mockJobTitleId,
        expect.objectContaining({
          desc1: mockUpdateCommand.desc1,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Jobtitle update failed',
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
      jobTitleRepository.findById.mockResolvedValue(mockExistingJobTitle);
      jobTitleRepository.update.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockJobTitleId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow('Database connection failed');

      expect(jobTitleRepository.findById).toHaveBeenCalledWith(
        mockJobTitleId,
        mockManager,
      );
      expect(jobTitleRepository.update).toHaveBeenCalledWith(
        mockJobTitleId,
        expect.objectContaining({
          desc1: mockUpdateCommand.desc1,
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
      jobTitleRepository.findById
        .mockResolvedValueOnce(mockExistingJobTitle)
        .mockResolvedValueOnce(mockUpdatedJobTitle);
      jobTitleRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockJobTitleId,
        mockUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(jobTitleRepository.findById).toHaveBeenCalledWith(
        mockJobTitleId,
        mockManager,
      );
      expect(jobTitleRepository.update).toHaveBeenCalledWith(
        mockJobTitleId,
        expect.objectContaining({
          desc1: mockUpdateCommand.desc1,
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
      expect(result).toEqual(mockUpdatedJobTitle);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      jobTitleRepository.findById.mockResolvedValue(mockExistingJobTitle);
      jobTitleRepository.update.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockJobTitleId,
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
