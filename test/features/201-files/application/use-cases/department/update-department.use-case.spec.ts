import { Test, TestingModule } from '@nestjs/testing';
import { UpdateDepartmentUseCase } from '@features/201-files/application/use-cases/department/update-department.use-case';
import { DepartmentRepository } from '@features/201-files/domain/repositories/department.repository';
import { Dept } from '@features/201-files/domain/models/dept';
import { UpdateDepartmentCommand } from '@features/201-files/application/commands/department/update-department.command';
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

describe('UpdateDepartmentUseCase', () => {
  let useCase: UpdateDepartmentUseCase;
  let departmentRepository: jest.Mocked<DepartmentRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockDepartmentId = 1;
  const mockExistingDepartment = new Dept({
    id: mockDepartmentId,
    desc1: 'IT Department',
    code: 'IT',
    designation: 'Information Technology',
    isActive: true,
  });

  const mockUpdatedDepartment = new Dept({
    id: mockDepartmentId,
    desc1: 'Software Development',
    code: 'SD',
    designation: 'Software Development Team',
    isActive: true,
  });

  const mockUpdateCommand: UpdateDepartmentCommand = {
    desc1: 'Software Development',
    costPerCent: 15.0,
    code: 'SD',
    designation: 'Software Development Team',
  };

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
        UpdateDepartmentUseCase,
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

    useCase = module.get<UpdateDepartmentUseCase>(UpdateDepartmentUseCase);
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
    it('should successfully update a department and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      departmentRepository.findById
        .mockResolvedValueOnce(mockExistingDepartment) // First call for validation
        .mockResolvedValueOnce(mockUpdatedDepartment); // Second call after update
      departmentRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockDepartmentId,
        mockUpdateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.UPDATE_DEPARTMENT,
        expect.any(Function),
      );
      expect(departmentRepository.findById).toHaveBeenCalledWith(
        mockDepartmentId,
        mockManager,
      );
      expect(departmentRepository.update).toHaveBeenCalledWith(
        mockDepartmentId,
        new Dept(mockUpdateCommand),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_DEPARTMENT,
          entity: CONSTANTS_DATABASE_MODELS.DEPARTMENT,
          userId: mockUserId,
          details: JSON.stringify({
            oldData: {
              id: mockExistingDepartment.id,
              desc1: mockExistingDepartment.desc1,
              code: mockExistingDepartment.code,
              designation: mockExistingDepartment.designation,
              isActive: mockExistingDepartment.isActive,
            },
            newData: {
              id: mockUpdatedDepartment.id,
              desc1: mockUpdatedDepartment.desc1,
              code: mockUpdatedDepartment.code,
              designation: mockUpdatedDepartment.designation,
              isActive: mockUpdatedDepartment.isActive,
            },
          }),
          description: `Updated department: ${mockUpdatedDepartment.desc1}`,
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
      expect(result).toEqual(mockUpdatedDepartment);
    });

    it('should throw NotFoundException when department does not exist', async () => {
      // Arrange
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
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(departmentRepository.findById).toHaveBeenCalledWith(
        mockDepartmentId,
        mockManager,
      );
      expect(departmentRepository.update).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_DEPARTMENT,
          entity: CONSTANTS_DATABASE_MODELS.DEPARTMENT,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockDepartmentId,
            dto: mockUpdateCommand,
          }),
          description: `Failed to update department with ID: ${mockDepartmentId}`,
          isSuccess: false,
          errorMessage: 'Department not found',
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
      departmentRepository.findById.mockResolvedValue(mockExistingDepartment);
      departmentRepository.update.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockDepartmentId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(departmentRepository.findById).toHaveBeenCalledWith(
        mockDepartmentId,
        mockManager,
      );
      expect(departmentRepository.update).toHaveBeenCalledWith(
        mockDepartmentId,
        new Dept(mockUpdateCommand),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Department update failed',
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
      departmentRepository.findById.mockResolvedValue(mockExistingDepartment);
      departmentRepository.update.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockDepartmentId,
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
      departmentRepository.findById
        .mockResolvedValueOnce(mockExistingDepartment)
        .mockResolvedValueOnce(mockUpdatedDepartment);
      departmentRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockDepartmentId,
        mockUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(departmentRepository.findById).toHaveBeenCalledWith(
        mockDepartmentId,
        mockManager,
      );
      expect(departmentRepository.update).toHaveBeenCalledWith(
        mockDepartmentId,
        new Dept(mockUpdateCommand),
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
      expect(result).toEqual(mockUpdatedDepartment);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      departmentRepository.findById.mockResolvedValue(mockExistingDepartment);
      departmentRepository.update.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockDepartmentId,
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
