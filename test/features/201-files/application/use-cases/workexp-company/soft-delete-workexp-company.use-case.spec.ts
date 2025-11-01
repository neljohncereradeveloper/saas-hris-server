import { Test, TestingModule } from '@nestjs/testing';
import { SoftDeleteWorkExpCompanyUseCase } from '@features/201-files/application/use-cases/workexp-company/soft-delete-workexp-company.use-case';
import { WorkexpCompanyRepository } from '@features/201-files/domain/repositories/workexp-company.repository';
import { WorkExpCompany } from '@features/201-files/domain/models/workexp-company.model';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@features/shared/exceptions/shared';

describe('SoftDeleteWorkexpCompanyUseCase', () => {
  let useCase: SoftDeleteWorkExpCompanyUseCase;
  let workexpCompanyRepository: jest.Mocked<WorkexpCompanyRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockWorkExpCompanyId = 1;
  const mockExistingWorkExpCompany = new WorkExpCompany({
    id: mockWorkExpCompanyId,
    desc1: 'Tech Corp',
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
    const mockWorkexpCompanyRepository = {
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
        SoftDeleteWorkExpCompanyUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.WORKEXPCOMPANY,
          useValue: mockWorkexpCompanyRepository,
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

    useCase = module.get<SoftDeleteWorkExpCompanyUseCase>(
      SoftDeleteWorkExpCompanyUseCase,
    );
    workexpCompanyRepository = module.get(
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
    it('should successfully deactivate a work experience company and log the activity', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpCompanyRepository.findById.mockResolvedValue(
        mockExistingWorkExpCompany,
      );
      workexpCompanyRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpCompanyId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.SOFT_DELETE_WORKEXPCOMPANY,
        expect.any(Function),
      );
      expect(workexpCompanyRepository.findById).toHaveBeenCalledWith(
        mockWorkExpCompanyId,
        mockManager,
      );
      expect(workexpCompanyRepository.softDelete).toHaveBeenCalledWith(
        mockWorkExpCompanyId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_WORKEXPCOMPANY,
          entity: CONSTANTS_DATABASE_MODELS.WORKEXPCOMPANY,
          userId: mockUserId,
          details: JSON.stringify({
            workexpcompanyData: {
              id: mockExistingWorkExpCompany.id,
              desc1: mockExistingWorkExpCompany.desc1,
              previousStatus: mockExistingWorkExpCompany.isActive,
              newStatus: isActive,
            },
          }),
          description: `${mockExistingWorkExpCompany.desc1} has been deactivated`,
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

    it('should successfully activate a work experience company and log the activity', async () => {
      // Arrange
      const isActive = true;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpCompanyRepository.findById.mockResolvedValue(
        mockExistingWorkExpCompany,
      );
      workexpCompanyRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpCompanyId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(workexpCompanyRepository.softDelete).toHaveBeenCalledWith(
        mockWorkExpCompanyId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: `${mockExistingWorkExpCompany.desc1} has been activated`,
        }),
        mockManager,
      );
      expect(result).toBe(true);
    });

    it('should throw NotFoundException when work experience company does not exist', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpCompanyRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockWorkExpCompanyId,
          isActive,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(workexpCompanyRepository.findById).toHaveBeenCalledWith(
        mockWorkExpCompanyId,
        mockManager,
      );
      expect(workexpCompanyRepository.softDelete).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_WORKEXPCOMPANY,
          entity: CONSTANTS_DATABASE_MODELS.WORKEXPCOMPANY,
          userId: mockUserId,
          details: JSON.stringify({ id: mockWorkExpCompanyId, isActive }),
          description: `Failed to deactivate workexpcompany with ID: ${mockWorkExpCompanyId}`,
          isSuccess: false,
          errorMessage: 'WorkexpCompany not found',
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
      workexpCompanyRepository.findById.mockResolvedValue(
        mockExistingWorkExpCompany,
      );
      workexpCompanyRepository.softDelete.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockWorkExpCompanyId,
          isActive,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(workexpCompanyRepository.findById).toHaveBeenCalledWith(
        mockWorkExpCompanyId,
        mockManager,
      );
      expect(workexpCompanyRepository.softDelete).toHaveBeenCalledWith(
        mockWorkExpCompanyId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'WorkexpCompany soft delete failed',
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
      workexpCompanyRepository.findById.mockResolvedValue(
        mockExistingWorkExpCompany,
      );
      workexpCompanyRepository.softDelete.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockWorkExpCompanyId,
          isActive,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow('Database connection failed');

      expect(workexpCompanyRepository.findById).toHaveBeenCalledWith(
        mockWorkExpCompanyId,
        mockManager,
      );
      expect(workexpCompanyRepository.softDelete).toHaveBeenCalledWith(
        mockWorkExpCompanyId,
        isActive,
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
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpCompanyRepository.findById.mockResolvedValue(
        mockExistingWorkExpCompany,
      );
      workexpCompanyRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpCompanyId,
        isActive,
        mockUserId,
      );

      // Assert
      expect(workexpCompanyRepository.findById).toHaveBeenCalledWith(
        mockWorkExpCompanyId,
        mockManager,
      );
      expect(workexpCompanyRepository.softDelete).toHaveBeenCalledWith(
        mockWorkExpCompanyId,
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
      workexpCompanyRepository.findById.mockResolvedValue(
        mockExistingWorkExpCompany,
      );
      workexpCompanyRepository.softDelete.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockWorkExpCompanyId,
          isActive,
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

    it('should handle activation with correct log message', async () => {
      // Arrange
      const isActive = true;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpCompanyRepository.findById.mockResolvedValue(
        mockExistingWorkExpCompany,
      );
      workexpCompanyRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpCompanyId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: `Tech Corp has been activated`,
        }),
        mockManager,
      );
      expect(result).toBe(true);
    });

    it('should handle deactivation with correct log message', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpCompanyRepository.findById.mockResolvedValue(
        mockExistingWorkExpCompany,
      );
      workexpCompanyRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpCompanyId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: `Tech Corp has been deactivated`,
        }),
        mockManager,
      );
      expect(result).toBe(true);
    });

    it('should handle zero work experience company ID', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpCompanyRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(0, isActive, mockUserId, mockRequestInfo),
      ).rejects.toThrow(NotFoundException);

      expect(workexpCompanyRepository.findById).toHaveBeenCalledWith(
        0,
        mockManager,
      );
    });

    it('should handle negative work experience company ID', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpCompanyRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(-1, isActive, mockUserId, mockRequestInfo),
      ).rejects.toThrow(NotFoundException);

      expect(workexpCompanyRepository.findById).toHaveBeenCalledWith(
        -1,
        mockManager,
      );
    });

    it('should handle large work experience company ID', async () => {
      // Arrange
      const isActive = false;
      const largeId = 999999;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpCompanyRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(largeId, isActive, mockUserId, mockRequestInfo),
      ).rejects.toThrow(NotFoundException);

      expect(workexpCompanyRepository.findById).toHaveBeenCalledWith(
        largeId,
        mockManager,
      );
    });
  });
});
