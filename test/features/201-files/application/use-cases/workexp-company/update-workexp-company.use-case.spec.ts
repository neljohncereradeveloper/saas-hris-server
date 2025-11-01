import { Test, TestingModule } from '@nestjs/testing';
import { UpdateWorkExpCompanyUseCase } from '@features/201-files/application/use-cases/workexp-company/update-workexp-company.use-case';
import { WorkexpCompanyRepository } from '@features/201-files/domain/repositories/workexp-company.repository';
import { WorkExpCompany } from '@features/201-files/domain/models/workexp-company.model';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { UpdateWorkExpCompanyCommand } from '@features/201-files/application/commands/workexp-company/update-workexp-company.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@features/shared/exceptions/shared';

describe('UpdateWorkexpCompanyUseCase', () => {
  let useCase: UpdateWorkExpCompanyUseCase;
  let workExpCompanyRepository: jest.Mocked<WorkexpCompanyRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockWorkExpCompanyId = 1;
  const mockExistingWorkExpCompany = new WorkExpCompany({
    id: mockWorkExpCompanyId,
    desc1: 'Tech Corp',
    isActive: true,
  });

  const mockUpdatedWorkExpCompany = new WorkExpCompany({
    id: mockWorkExpCompanyId,
    desc1: 'New Tech Corp',
    isActive: true,
  });

  const mockUpdateCommand: UpdateWorkExpCompanyCommand = {
    desc1: 'New Tech Corp',
  };

  const mockUserId = 'user-123';
  const mockRequestInfo = {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    sessionId: 'session-123',
    username: 'testuser',
  };

  beforeEach(async () => {
    const mockWorkExpCompanyRepository = {
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
        UpdateWorkExpCompanyUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.WORKEXPCOMPANY,
          useValue: mockWorkExpCompanyRepository,
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

    useCase = module.get<UpdateWorkExpCompanyUseCase>(
      UpdateWorkExpCompanyUseCase,
    );
    workExpCompanyRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.WORKEXPCOMPANY,
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
    it('should successfully update a work experience company and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpCompanyRepository.findById
        .mockResolvedValueOnce(mockExistingWorkExpCompany) // First call for validation
        .mockResolvedValueOnce(mockUpdatedWorkExpCompany); // Second call after update
      workExpCompanyRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpCompanyId,
        mockUpdateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.UPDATE_WORKEXPCOMPANY,
        expect.any(Function),
      );
      expect(workExpCompanyRepository.findById).toHaveBeenCalledWith(
        mockWorkExpCompanyId,
        mockManager,
      );
      expect(workExpCompanyRepository.update).toHaveBeenCalledWith(
        mockWorkExpCompanyId,
        expect.objectContaining({
          desc1: mockUpdateCommand.desc1,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_WORKEXPCOMPANY,
          entity: CONSTANTS_DATABASE_MODELS.WORKEXPCOMPANY,
          userId: mockUserId,
          details: JSON.stringify({
            oldData: {
              id: mockExistingWorkExpCompany.id,
              desc1: mockExistingWorkExpCompany.desc1,
              isActive: mockExistingWorkExpCompany.isActive,
            },
            newData: {
              id: mockUpdatedWorkExpCompany.id,
              desc1: mockUpdatedWorkExpCompany.desc1,
              isActive: mockUpdatedWorkExpCompany.isActive,
            },
          }),
          description: `Updated workexpcompany: ${mockUpdatedWorkExpCompany.desc1}`,
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
      expect(result).toEqual(mockUpdatedWorkExpCompany);
    });

    it('should throw NotFoundException when work experience company does not exist', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpCompanyRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockWorkExpCompanyId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(workExpCompanyRepository.findById).toHaveBeenCalledWith(
        mockWorkExpCompanyId,
        mockManager,
      );
      expect(workExpCompanyRepository.update).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_WORKEXPCOMPANY,
          entity: CONSTANTS_DATABASE_MODELS.WORKEXPCOMPANY,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockWorkExpCompanyId,
            dto: mockUpdateCommand,
          }),
          description: `Failed to update workexpcompany with ID: ${mockWorkExpCompanyId}`,
          isSuccess: false,
          errorMessage: 'WorkexpCompany not found',
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
      workExpCompanyRepository.findById.mockResolvedValue(
        mockExistingWorkExpCompany,
      );
      workExpCompanyRepository.update.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockWorkExpCompanyId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(workExpCompanyRepository.findById).toHaveBeenCalledWith(
        mockWorkExpCompanyId,
        mockManager,
      );
      expect(workExpCompanyRepository.update).toHaveBeenCalledWith(
        mockWorkExpCompanyId,
        expect.objectContaining({
          desc1: mockUpdateCommand.desc1,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'WorkexpCompany update failed',
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
      workExpCompanyRepository.findById.mockResolvedValue(
        mockExistingWorkExpCompany,
      );
      workExpCompanyRepository.update.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockWorkExpCompanyId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow('Database connection failed');

      expect(workExpCompanyRepository.findById).toHaveBeenCalledWith(
        mockWorkExpCompanyId,
        mockManager,
      );
      expect(workExpCompanyRepository.update).toHaveBeenCalledWith(
        mockWorkExpCompanyId,
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
      workExpCompanyRepository.findById
        .mockResolvedValueOnce(mockExistingWorkExpCompany)
        .mockResolvedValueOnce(mockUpdatedWorkExpCompany);
      workExpCompanyRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpCompanyId,
        mockUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(workExpCompanyRepository.findById).toHaveBeenCalledWith(
        mockWorkExpCompanyId,
        mockManager,
      );
      expect(workExpCompanyRepository.update).toHaveBeenCalledWith(
        mockWorkExpCompanyId,
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
      expect(result).toEqual(mockUpdatedWorkExpCompany);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpCompanyRepository.findById.mockResolvedValue(
        mockExistingWorkExpCompany,
      );
      workExpCompanyRepository.update.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockWorkExpCompanyId,
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

    it('should handle empty company name update', async () => {
      // Arrange
      const emptyUpdateCommand: UpdateWorkExpCompanyCommand = {
        desc1: '',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpCompanyRepository.findById
        .mockResolvedValueOnce(mockExistingWorkExpCompany)
        .mockResolvedValueOnce(
          new WorkExpCompany({
            id: mockWorkExpCompanyId,
            desc1: '',
            isActive: true,
          }),
        );
      workExpCompanyRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpCompanyId,
        emptyUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(workExpCompanyRepository.update).toHaveBeenCalledWith(
        mockWorkExpCompanyId,
        expect.objectContaining({
          desc1: '',
        }),
        mockManager,
      );
      expect(result?.desc1).toBe('');
    });

    it('should handle long company name update', async () => {
      // Arrange
      const longCompanyName = 'A'.repeat(1000);
      const longUpdateCommand: UpdateWorkExpCompanyCommand = {
        desc1: longCompanyName,
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpCompanyRepository.findById
        .mockResolvedValueOnce(mockExistingWorkExpCompany)
        .mockResolvedValueOnce(
          new WorkExpCompany({
            id: mockWorkExpCompanyId,
            desc1: longCompanyName,
            isActive: true,
          }),
        );
      workExpCompanyRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpCompanyId,
        longUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(workExpCompanyRepository.update).toHaveBeenCalledWith(
        mockWorkExpCompanyId,
        expect.objectContaining({
          desc1: longCompanyName,
        }),
        mockManager,
      );
      expect(result?.desc1).toBe(longCompanyName);
    });

    it('should handle special characters in company name update', async () => {
      // Arrange
      const specialUpdateCommand: UpdateWorkExpCompanyCommand = {
        desc1: 'Tech Corp® - Special Characters!@#$%^&*()',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workExpCompanyRepository.findById
        .mockResolvedValueOnce(mockExistingWorkExpCompany)
        .mockResolvedValueOnce(
          new WorkExpCompany({
            id: mockWorkExpCompanyId,
            desc1: specialUpdateCommand.desc1,
            isActive: true,
          }),
        );
      workExpCompanyRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpCompanyId,
        specialUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(workExpCompanyRepository.update).toHaveBeenCalledWith(
        mockWorkExpCompanyId,
        expect.objectContaining({
          desc1: specialUpdateCommand.desc1,
        }),
        mockManager,
      );
      expect(result?.desc1).toBe(specialUpdateCommand.desc1);
    });
  });
});
