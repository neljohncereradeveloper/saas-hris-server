import { Test, TestingModule } from '@nestjs/testing';
import { UpdateEmpStatusUseCase } from '@features/201-files/application/use-cases/empstatus/update-empstatus.use-case';
import { EmpStatusRepository } from '@features/201-files/domain/repositories/empstatus.repository';
import { EmpStatus } from '@features/201-files/domain/models/empstatus';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { UpdateEmpStatusCommand } from '@features/201-files/application/commands/empstatus/update-empstatus.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@features/shared/exceptions/shared';

describe('UpdateEmpStatusUseCase', () => {
  let useCase: UpdateEmpStatusUseCase;
  let empStatusRepository: jest.Mocked<EmpStatusRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockEmpStatusId = 1;
  const mockExistingEmpStatus = new EmpStatus({
    id: mockEmpStatusId,
    desc1: 'Active',
    isActive: true,
  });

  const mockUpdatedEmpStatus = new EmpStatus({
    id: mockEmpStatusId,
    desc1: 'Inactive',
    isActive: false,
  });

  const mockUpdateCommand: UpdateEmpStatusCommand = {
    desc1: 'Inactive',
  };

  const mockUserId = 'user-123';
  const mockRequestInfo = {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    sessionId: 'session-123',
    username: 'testuser',
  };

  beforeEach(async () => {
    const mockEmpStatusRepository = {
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
        UpdateEmpStatusUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EMPSTATUS,
          useValue: mockEmpStatusRepository,
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

    useCase = module.get<UpdateEmpStatusUseCase>(UpdateEmpStatusUseCase);
    empStatusRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.EMPSTATUS);
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully update an empstatus record and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      empStatusRepository.findById
        .mockResolvedValueOnce(mockExistingEmpStatus) // First call for validation
        .mockResolvedValueOnce(mockUpdatedEmpStatus); // Second call after update
      empStatusRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEmpStatusId,
        mockUpdateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.UPDATE_EMPSTATUS,
        expect.any(Function),
      );
      expect(empStatusRepository.findById).toHaveBeenCalledWith(
        mockEmpStatusId,
        mockManager,
      );
      expect(empStatusRepository.update).toHaveBeenCalledWith(
        mockEmpStatusId,
        expect.objectContaining({
          desc1: mockUpdateCommand.desc1,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_EMPSTATUS,
          entity: CONSTANTS_DATABASE_MODELS.EMPSTATUS,
          userId: mockUserId,
          details: JSON.stringify({
            oldData: {
              id: mockExistingEmpStatus.id,
              desc1: mockExistingEmpStatus.desc1,
              isActive: mockExistingEmpStatus.isActive,
            },
            newData: {
              id: mockUpdatedEmpStatus.id,
              desc1: mockUpdatedEmpStatus.desc1,
              isActive: mockUpdatedEmpStatus.isActive,
            },
          }),
          description: `Updated empstatus: ${mockUpdatedEmpStatus.desc1}`,
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
      expect(result).toEqual(mockUpdatedEmpStatus);
    });

    it('should throw NotFoundException when empstatus record does not exist', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      empStatusRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockEmpStatusId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(empStatusRepository.findById).toHaveBeenCalledWith(
        mockEmpStatusId,
        mockManager,
      );
      expect(empStatusRepository.update).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_EMPSTATUS,
          entity: CONSTANTS_DATABASE_MODELS.EMPSTATUS,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockEmpStatusId,
            dto: mockUpdateCommand,
          }),
          description: `Failed to update empstatus with ID: ${mockEmpStatusId}`,
          isSuccess: false,
          errorMessage: 'Empstatus not found',
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
      empStatusRepository.findById.mockResolvedValue(mockExistingEmpStatus);
      empStatusRepository.update.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockEmpStatusId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(empStatusRepository.findById).toHaveBeenCalledWith(
        mockEmpStatusId,
        mockManager,
      );
      expect(empStatusRepository.update).toHaveBeenCalledWith(
        mockEmpStatusId,
        expect.objectContaining({
          desc1: mockUpdateCommand.desc1,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Empstatus update failed',
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
      empStatusRepository.findById.mockResolvedValue(mockExistingEmpStatus);
      empStatusRepository.update.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockEmpStatusId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow('Database connection failed');

      expect(empStatusRepository.findById).toHaveBeenCalledWith(
        mockEmpStatusId,
        mockManager,
      );
      expect(empStatusRepository.update).toHaveBeenCalledWith(
        mockEmpStatusId,
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
      empStatusRepository.findById
        .mockResolvedValueOnce(mockExistingEmpStatus)
        .mockResolvedValueOnce(mockUpdatedEmpStatus);
      empStatusRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEmpStatusId,
        mockUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(empStatusRepository.findById).toHaveBeenCalledWith(
        mockEmpStatusId,
        mockManager,
      );
      expect(empStatusRepository.update).toHaveBeenCalledWith(
        mockEmpStatusId,
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
      expect(result).toEqual(mockUpdatedEmpStatus);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      empStatusRepository.findById.mockResolvedValue(mockExistingEmpStatus);
      empStatusRepository.update.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockEmpStatusId,
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
