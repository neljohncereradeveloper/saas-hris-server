import { Test, TestingModule } from '@nestjs/testing';
import { SoftDeleteEmpStatusUseCase } from '@features/201-files/application/use-cases/empstatus/soft-delete-empstatus.use-case';
import { EmpStatusRepository } from '@features/201-files/domain/repositories/empstatus.repository';
import { EmpStatus } from '@features/201-files/domain/models/empstatus';
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

describe('SoftDeleteEmpStatusUseCase', () => {
  let useCase: SoftDeleteEmpStatusUseCase;
  let empStatusRepository: jest.Mocked<EmpStatusRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockEmpStatusId = 1;
  const mockEmpStatus = new EmpStatus({
    id: mockEmpStatusId,
    desc1: 'Active',
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
    const mockEmpStatusRepository = {
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
        SoftDeleteEmpStatusUseCase,
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

    useCase = module.get<SoftDeleteEmpStatusUseCase>(
      SoftDeleteEmpStatusUseCase,
    );
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
    it('should successfully soft delete an empstatus record and log the activity', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      empStatusRepository.findById.mockResolvedValue(mockEmpStatus);
      empStatusRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEmpStatusId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.SOFT_DELETE_EMPSTATUS,
        expect.any(Function),
      );
      expect(empStatusRepository.findById).toHaveBeenCalledWith(
        mockEmpStatusId,
        mockManager,
      );
      expect(empStatusRepository.softDelete).toHaveBeenCalledWith(
        mockEmpStatusId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_EMPSTATUS,
          entity: CONSTANTS_DATABASE_MODELS.EMPSTATUS,
          userId: mockUserId,
          details: JSON.stringify({
            empstatusData: {
              id: mockEmpStatus.id,
              desc1: mockEmpStatus.desc1,
              previousStatus: mockEmpStatus.isActive,
              newStatus: isActive,
            },
          }),
          description: `${mockEmpStatus.desc1} has been deactivated`,
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

    it('should successfully activate an empstatus record and log the activity', async () => {
      // Arrange
      const isActive = true;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      empStatusRepository.findById.mockResolvedValue(mockEmpStatus);
      empStatusRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEmpStatusId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.SOFT_DELETE_EMPSTATUS,
        expect.any(Function),
      );
      expect(empStatusRepository.findById).toHaveBeenCalledWith(
        mockEmpStatusId,
        mockManager,
      );
      expect(empStatusRepository.softDelete).toHaveBeenCalledWith(
        mockEmpStatusId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_EMPSTATUS,
          entity: CONSTANTS_DATABASE_MODELS.EMPSTATUS,
          userId: mockUserId,
          details: JSON.stringify({
            empstatusData: {
              id: mockEmpStatus.id,
              desc1: mockEmpStatus.desc1,
              previousStatus: mockEmpStatus.isActive,
              newStatus: isActive,
            },
          }),
          description: `${mockEmpStatus.desc1} has been activated`,
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

    it('should throw NotFoundException when empstatus record does not exist', async () => {
      // Arrange
      const isActive = false;
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
        useCase.execute(mockEmpStatusId, isActive, mockUserId, mockRequestInfo),
      ).rejects.toThrow(NotFoundException);

      expect(empStatusRepository.findById).toHaveBeenCalledWith(
        mockEmpStatusId,
        mockManager,
      );
      expect(empStatusRepository.softDelete).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_EMPSTATUS,
          entity: CONSTANTS_DATABASE_MODELS.EMPSTATUS,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockEmpStatusId,
            isActive,
          }),
          description: `Failed to deactivate empstatus with ID: ${mockEmpStatusId}`,
          isSuccess: false,
          errorMessage: 'Empstatus not found',
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
      empStatusRepository.findById.mockResolvedValue(mockEmpStatus);
      empStatusRepository.softDelete.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockEmpStatusId, isActive, mockUserId, mockRequestInfo),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(empStatusRepository.findById).toHaveBeenCalledWith(
        mockEmpStatusId,
        mockManager,
      );
      expect(empStatusRepository.softDelete).toHaveBeenCalledWith(
        mockEmpStatusId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Empstatus soft delete failed',
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
      empStatusRepository.findById.mockResolvedValue(mockEmpStatus);
      empStatusRepository.softDelete.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockEmpStatusId, isActive, mockUserId, mockRequestInfo),
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
      empStatusRepository.findById.mockResolvedValue(mockEmpStatus);
      empStatusRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockEmpStatusId,
        isActive,
        mockUserId,
      );

      // Assert
      expect(empStatusRepository.findById).toHaveBeenCalledWith(
        mockEmpStatusId,
        mockManager,
      );
      expect(empStatusRepository.softDelete).toHaveBeenCalledWith(
        mockEmpStatusId,
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
      empStatusRepository.findById.mockResolvedValue(mockEmpStatus);
      empStatusRepository.softDelete.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockEmpStatusId, isActive, mockUserId, mockRequestInfo),
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
