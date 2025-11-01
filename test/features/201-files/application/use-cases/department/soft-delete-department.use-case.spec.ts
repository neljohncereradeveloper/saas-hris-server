import { Test, TestingModule } from '@nestjs/testing';
import { SoftDeleteDepartmentUseCase } from '@features/201-files/application/use-cases/department/soft-delete-department.use-case';
import { DepartmentRepository } from '@features/201-files/domain/repositories/department.repository';
import { Dept } from '@features/201-files/domain/models/dept';
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

describe('SoftDeleteDepartmentUseCase', () => {
  let useCase: SoftDeleteDepartmentUseCase;
  let departmentRepository: jest.Mocked<DepartmentRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockDepartmentId = 1;
  const mockDepartment = new Dept({
    id: mockDepartmentId,
    desc1: 'IT Department',
    code: 'IT',
    designation: 'Information Technology',
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
    const mockDepartmentRepository = {
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
        SoftDeleteDepartmentUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.DEPARTMENT,
          useValue: mockDepartmentRepository,
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

    useCase = module.get<SoftDeleteDepartmentUseCase>(
      SoftDeleteDepartmentUseCase,
    );
    departmentRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.DEPARTMENT);
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully soft delete a department and log the activity', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      departmentRepository.findById.mockResolvedValue(mockDepartment);
      departmentRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockDepartmentId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.SOFT_DELETE_DEPARTMENT,
        expect.any(Function),
      );
      expect(departmentRepository.findById).toHaveBeenCalledWith(
        mockDepartmentId,
        mockManager,
      );
      expect(departmentRepository.softDelete).toHaveBeenCalledWith(
        mockDepartmentId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_DEPARTMENT,
          entity: CONSTANTS_DATABASE_MODELS.DEPARTMENT,
          userId: mockUserId,
          details: JSON.stringify({
            departmentData: {
              id: mockDepartment.id,
              desc1: mockDepartment.desc1,
              code: mockDepartment.code,
              designation: mockDepartment.designation,
              previousStatus: mockDepartment.isActive,
              newStatus: isActive,
            },
          }),
          description: `Soft deleted department: ${mockDepartment.desc1}`,
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

    it('should successfully activate a department and log the activity', async () => {
      // Arrange
      const isActive = true;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      departmentRepository.findById.mockResolvedValue(mockDepartment);
      departmentRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockDepartmentId,
        isActive,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.SOFT_DELETE_DEPARTMENT,
        expect.any(Function),
      );
      expect(departmentRepository.findById).toHaveBeenCalledWith(
        mockDepartmentId,
        mockManager,
      );
      expect(departmentRepository.softDelete).toHaveBeenCalledWith(
        mockDepartmentId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_DEPARTMENT,
          entity: CONSTANTS_DATABASE_MODELS.DEPARTMENT,
          userId: mockUserId,
          details: JSON.stringify({
            departmentData: {
              id: mockDepartment.id,
              desc1: mockDepartment.desc1,
              code: mockDepartment.code,
              designation: mockDepartment.designation,
              previousStatus: mockDepartment.isActive,
              newStatus: isActive,
            },
          }),
          description: `Soft deleted department: ${mockDepartment.desc1}`,
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

    it('should throw NotFoundException when department does not exist', async () => {
      // Arrange
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      departmentRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockDepartmentId,
          isActive,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(departmentRepository.findById).toHaveBeenCalledWith(
        mockDepartmentId,
        mockManager,
      );
      expect(departmentRepository.softDelete).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.SOFT_DELETE_DEPARTMENT,
          entity: CONSTANTS_DATABASE_MODELS.DEPARTMENT,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockDepartmentId,
            isActive,
          }),
          description: `Failed to deactivate department with ID: ${mockDepartmentId}`,
          isSuccess: false,
          errorMessage: 'Department not found',
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
      departmentRepository.findById.mockResolvedValue(mockDepartment);
      departmentRepository.softDelete.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockDepartmentId,
          isActive,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(departmentRepository.findById).toHaveBeenCalledWith(
        mockDepartmentId,
        mockManager,
      );
      expect(departmentRepository.softDelete).toHaveBeenCalledWith(
        mockDepartmentId,
        isActive,
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Department soft delete failed',
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
      departmentRepository.findById.mockResolvedValue(mockDepartment);
      departmentRepository.softDelete.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockDepartmentId,
          isActive,
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
      const isActive = false;
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      departmentRepository.findById.mockResolvedValue(mockDepartment);
      departmentRepository.softDelete.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockDepartmentId,
        isActive,
        mockUserId,
      );

      // Assert
      expect(departmentRepository.findById).toHaveBeenCalledWith(
        mockDepartmentId,
        mockManager,
      );
      expect(departmentRepository.softDelete).toHaveBeenCalledWith(
        mockDepartmentId,
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
      departmentRepository.findById.mockResolvedValue(mockDepartment);
      departmentRepository.softDelete.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockDepartmentId,
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
  });
});
