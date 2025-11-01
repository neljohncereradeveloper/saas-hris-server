import { Test, TestingModule } from '@nestjs/testing';
import { UpdateBranchUseCase } from '@features/201-files/application/use-cases/branch/update-branch.use-case';
import { BranchRepository } from '@features/201-files/domain/repositories/branch.repository';
import { Branch } from '@features/201-files/domain/models/branch.model';
import { UpdateBranchCommand } from '@features/201-files/application/commands/branch/update-branch.command';
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

describe('UpdateAddressBranchUseCase', () => {
  let useCase: UpdateBranchUseCase;
  let branchRepository: jest.Mocked<BranchRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockBranchId = 1;
  const mockExistingBranch = new Branch({
    id: mockBranchId,
    desc1: 'Old Branch Name',
    brCode: 'BR001',
    isActive: true,
  });

  const mockUpdatedBranch = new Branch({
    id: mockBranchId,
    desc1: 'Updated Branch Name',
    brCode: 'BR001',
    isActive: true,
  });

  const mockUpdateCommand: UpdateBranchCommand = {
    desc1: 'Updated Branch Name',
    brCode: 'BR001',
  };

  const mockUserId = 'user-123';
  const mockRequestInfo = {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    sessionId: 'session-123',
    username: 'testuser',
  };

  beforeEach(async () => {
    const mockBranchRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      findByBrCode: jest.fn(),
      create: jest.fn(),
      softDelete: jest.fn(),
      findPaginatedList: jest.fn(),
      findByDescription: jest.fn(),
      retrieveForCombobox: jest.fn(),
    };

    const mockActivityLogRepository = {
      create: jest.fn(),
    };

    const mockTransactionHelper = {
      executeTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateBranchUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.BRANCH,
          useValue: mockBranchRepository,
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

    useCase = module.get<UpdateBranchUseCase>(UpdateBranchUseCase);
    branchRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.BRANCH);
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully update a branch and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      branchRepository.findById
        .mockResolvedValueOnce(mockExistingBranch) // First call for validation
        .mockResolvedValueOnce(mockUpdatedBranch); // Second call after update
      branchRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockBranchId,
        mockUpdateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.UPDATE_BRANCH,
        expect.any(Function),
      );
      expect(branchRepository.findById).toHaveBeenCalledWith(
        mockBranchId,
        mockManager,
      );
      expect(branchRepository.update).toHaveBeenCalledWith(
        mockBranchId,
        new Branch(mockUpdateCommand),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_BRANCH,
          entity: CONSTANTS_DATABASE_MODELS.BRANCH,
          userId: mockUserId,
          details: JSON.stringify({
            oldData: {
              id: mockExistingBranch.id,
              desc1: mockExistingBranch.desc1,
              brCode: mockExistingBranch.brCode,
              isActive: mockExistingBranch.isActive,
            },
            newData: {
              id: mockUpdatedBranch.id,
              desc1: mockUpdatedBranch.desc1,
              brCode: mockUpdatedBranch.brCode,
              isActive: mockUpdatedBranch.isActive,
            },
          }),
          description: `Updated branch: ${mockUpdatedBranch.desc1}`,
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
      expect(result).toEqual(mockUpdatedBranch);
    });

    it('should throw NotFoundException when branch does not exist', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      branchRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockBranchId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(branchRepository.findById).toHaveBeenCalledWith(
        mockBranchId,
        mockManager,
      );
      expect(branchRepository.update).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_BRANCH,
          entity: CONSTANTS_DATABASE_MODELS.BRANCH,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockBranchId,
            dto: mockUpdateCommand,
          }),
          description: `Failed to update branch with ID: ${mockBranchId}`,
          isSuccess: false,
          errorMessage: 'Branch not found',
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
      branchRepository.findById.mockResolvedValue(mockExistingBranch);
      branchRepository.update.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockBranchId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(branchRepository.findById).toHaveBeenCalledWith(
        mockBranchId,
        mockManager,
      );
      expect(branchRepository.update).toHaveBeenCalledWith(
        mockBranchId,
        new Branch(mockUpdateCommand),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Branch update failed',
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
      branchRepository.findById.mockResolvedValue(mockExistingBranch);
      branchRepository.update.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockBranchId,
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
      branchRepository.findById
        .mockResolvedValueOnce(mockExistingBranch)
        .mockResolvedValueOnce(mockUpdatedBranch);
      branchRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockBranchId,
        mockUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(branchRepository.findById).toHaveBeenCalledWith(
        mockBranchId,
        mockManager,
      );
      expect(branchRepository.update).toHaveBeenCalledWith(
        mockBranchId,
        new Branch(mockUpdateCommand),
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
      expect(result).toEqual(mockUpdatedBranch);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      branchRepository.findById.mockResolvedValue(mockExistingBranch);
      branchRepository.update.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockBranchId,
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
