import { Test, TestingModule } from '@nestjs/testing';
import { UpdateWorkExpJobTitleUseCase } from '@features/201-files/application/use-cases/workexp-jobtitle/update-workexp-jobtitle.use-case';
import { WorkExpJobTitleRepository } from '@features/201-files/domain/repositories/workexp-jobtitle.repository';
import { WorkExpJobTitle } from '@features/201-files/domain/models/workexp-jobtitle.model';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { UpdateWorkExpJobTitleCommand } from '@features/201-files/application/commands/workexp-jobtitle/update-workexp-jobtitle.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@features/shared/exceptions/shared';

describe('UpdateWorkExpJobTitleUseCase', () => {
  let useCase: UpdateWorkExpJobTitleUseCase;
  let workExpJobTitleRepository: jest.Mocked<WorkExpJobTitleRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockWorkExpJobTitleId = 1;
  const mockExistingWorkExpJobTitle = new WorkExpJobTitle({
    id: mockWorkExpJobTitleId,
    desc1: 'Software Engineer',
    isActive: true,
  });

  const mockUpdatedWorkExpJobTitle = new WorkExpJobTitle({
    id: mockWorkExpJobTitleId,
    desc1: 'Senior Software Engineer',
    isActive: true,
  });

  const mockUpdateCommand: UpdateWorkExpJobTitleCommand = {
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
    const mockWorkExpJobTitleRepository = {
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
        UpdateWorkExpJobTitleUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.WORKEXPJOBTITLE,
          useValue: mockWorkExpJobTitleRepository,
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

    useCase = module.get<UpdateWorkExpJobTitleUseCase>(
      UpdateWorkExpJobTitleUseCase,
    );
    workExpJobTitleRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.WORKEXPJOBTITLE,
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
    it('should successfully update a work experience job title and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpJobTitleRepository.findById
        .mockResolvedValueOnce(mockExistingWorkExpJobTitle) // First call for validation
        .mockResolvedValueOnce(mockUpdatedWorkExpJobTitle); // Second call after update
      workExpJobTitleRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpJobTitleId,
        mockUpdateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.UPDATE_WORKEXPJOBTITLE,
        expect.any(Function),
      );
      expect(workExpJobTitleRepository.findById).toHaveBeenCalledWith(
        mockWorkExpJobTitleId,
        mockManager,
      );
      expect(workExpJobTitleRepository.update).toHaveBeenCalledWith(
        mockWorkExpJobTitleId,
        expect.objectContaining({
          desc1: mockUpdateCommand.desc1,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_WORKEXPJOBTITLE,
          entity: CONSTANTS_DATABASE_MODELS.WORKEXPJOBTITLE,
          userId: mockUserId,
          details: JSON.stringify({
            oldData: {
              id: mockExistingWorkExpJobTitle.id,
              desc1: mockExistingWorkExpJobTitle.desc1,
              isActive: mockExistingWorkExpJobTitle.isActive,
            },
            newData: {
              id: mockUpdatedWorkExpJobTitle.id,
              desc1: mockUpdatedWorkExpJobTitle.desc1,
              isActive: mockUpdatedWorkExpJobTitle.isActive,
            },
          }),
          description: `Updated workexpjobtitle: ${mockUpdatedWorkExpJobTitle.desc1}`,
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
      expect(result).toEqual(mockUpdatedWorkExpJobTitle);
    });

    it('should throw NotFoundException when work experience job title does not exist', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpJobTitleRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockWorkExpJobTitleId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(workExpJobTitleRepository.findById).toHaveBeenCalledWith(
        mockWorkExpJobTitleId,
        mockManager,
      );
      expect(workExpJobTitleRepository.update).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_WORKEXPJOBTITLE,
          entity: CONSTANTS_DATABASE_MODELS.WORKEXPJOBTITLE,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockWorkExpJobTitleId,
            dto: mockUpdateCommand,
          }),
          description: `Failed to update workexpjobtitle with ID: ${mockWorkExpJobTitleId}`,
          isSuccess: false,
          errorMessage: 'WorkexpJobtitle not found',
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
      workExpJobTitleRepository.findById.mockResolvedValue(
        mockExistingWorkExpJobTitle,
      );
      workExpJobTitleRepository.update.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockWorkExpJobTitleId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(workExpJobTitleRepository.findById).toHaveBeenCalledWith(
        mockWorkExpJobTitleId,
        mockManager,
      );
      expect(workExpJobTitleRepository.update).toHaveBeenCalledWith(
        mockWorkExpJobTitleId,
        expect.objectContaining({
          desc1: mockUpdateCommand.desc1,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'WorkexpJobtitle update failed',
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
      workExpJobTitleRepository.findById.mockResolvedValue(
        mockExistingWorkExpJobTitle,
      );
      workExpJobTitleRepository.update.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockWorkExpJobTitleId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow('Database connection failed');

      expect(workExpJobTitleRepository.findById).toHaveBeenCalledWith(
        mockWorkExpJobTitleId,
        mockManager,
      );
      expect(workExpJobTitleRepository.update).toHaveBeenCalledWith(
        mockWorkExpJobTitleId,
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
      workExpJobTitleRepository.findById
        .mockResolvedValueOnce(mockExistingWorkExpJobTitle)
        .mockResolvedValueOnce(mockUpdatedWorkExpJobTitle);
      workExpJobTitleRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpJobTitleId,
        mockUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(workExpJobTitleRepository.findById).toHaveBeenCalledWith(
        mockWorkExpJobTitleId,
        mockManager,
      );
      expect(workExpJobTitleRepository.update).toHaveBeenCalledWith(
        mockWorkExpJobTitleId,
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
      expect(result).toEqual(mockUpdatedWorkExpJobTitle);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpJobTitleRepository.findById.mockResolvedValue(
        mockExistingWorkExpJobTitle,
      );
      workExpJobTitleRepository.update.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockWorkExpJobTitleId,
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

    it('should handle empty job title update', async () => {
      // Arrange
      const emptyUpdateCommand: UpdateWorkExpJobTitleCommand = {
        desc1: '',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpJobTitleRepository.findById
        .mockResolvedValueOnce(mockExistingWorkExpJobTitle)
        .mockResolvedValueOnce(
          new WorkExpJobTitle({
            id: mockWorkExpJobTitleId,
            desc1: '',
            isActive: true,
          }),
        );
      workExpJobTitleRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpJobTitleId,
        emptyUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(workExpJobTitleRepository.update).toHaveBeenCalledWith(
        mockWorkExpJobTitleId,
        expect.objectContaining({
          desc1: '',
        }),
        mockManager,
      );
      expect(result?.desc1).toBe('');
    });

    it('should handle long job title update', async () => {
      // Arrange
      const longJobTitle = 'A'.repeat(1000);
      const longUpdateCommand: UpdateWorkExpJobTitleCommand = {
        desc1: longJobTitle,
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpJobTitleRepository.findById
        .mockResolvedValueOnce(mockExistingWorkExpJobTitle)
        .mockResolvedValueOnce(
          new WorkExpJobTitle({
            id: mockWorkExpJobTitleId,
            desc1: longJobTitle,
            isActive: true,
          }),
        );
      workExpJobTitleRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpJobTitleId,
        longUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(workExpJobTitleRepository.update).toHaveBeenCalledWith(
        mockWorkExpJobTitleId,
        expect.objectContaining({
          desc1: longJobTitle,
        }),
        mockManager,
      );
      expect(result?.desc1).toBe(longJobTitle);
    });

    it('should handle special characters in job title update', async () => {
      // Arrange
      const specialUpdateCommand: UpdateWorkExpJobTitleCommand = {
        desc1: 'Software Engineer® - Special Characters!@#$%^&*()',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpJobTitleRepository.findById
        .mockResolvedValueOnce(mockExistingWorkExpJobTitle)
        .mockResolvedValueOnce(
          new WorkExpJobTitle({
            id: mockWorkExpJobTitleId,
            desc1: specialUpdateCommand.desc1,
            isActive: true,
          }),
        );
      workExpJobTitleRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpJobTitleId,
        specialUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(workExpJobTitleRepository.update).toHaveBeenCalledWith(
        mockWorkExpJobTitleId,
        expect.objectContaining({
          desc1: specialUpdateCommand.desc1,
        }),
        mockManager,
      );
      expect(result?.desc1).toBe(specialUpdateCommand.desc1);
    });
  });
});
