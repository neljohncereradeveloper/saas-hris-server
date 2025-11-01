import { Test, TestingModule } from '@nestjs/testing';
import { CreateLeaveUseCase } from '@features/leave-management/application/use-cases/leave/create-leave.use-case';
import { CreateLeaveCommand } from '@features/leave-management/application/commands/leave/create-leave.command';
import { LeaveType } from '@features/leave-management/domain/models/leave-type.model';
import { LeavePolicy } from '@features/leave-management/domain/models/leave-policy.model';
import { LeaveAllocation } from '@features/leave-management/domain/models/leave-allocation.model';
import { LeaveApproval } from '@features/leave-management/domain/models/leave-approval.model';
import { Leave } from '@features/leave-management/domain/models/leave.model';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { LeaveRepository } from '@features/leave-management/domain/repositories/leave.repository';
import { LeaveTypeRepository } from '@features/leave-management/domain/repositories/leave-type.repository';
import { LeavePolicyRepository } from '@features/leave-management/domain/repositories/leave-policy.repository';
import { LeaveAllocationRepository } from '@features/leave-management/domain/repositories/leave-allocation.repository';
import { LeaveApprovalRepository } from '@features/leave-management/domain/repositories/leave-approval.repository';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { LeaveStatus } from '@features/leave-management/domain/enums/leave-status.enum';
import { ApprovalStatus } from '@features/leave-management/domain/enums/approval-status.enum';
import { LeaveCategory } from '@features/leave-management/domain/enums/leave-category.enum';
import { ApproverType } from '@features/leave-management/domain/enums/approver-type.enum';
import { ApprovalWorkflow } from '@features/leave-management/domain/value-objects/approval-workflow.vo';
import { NotFoundException } from '@features/shared/exceptions/shared/not-found.exception';
import { ValidationException } from '@features/shared/exceptions/shared/validation.exception';

describe('CreateLeaveUseCase', () => {
  let useCase: CreateLeaveUseCase;
  let mockLeaveRepository: jest.Mocked<LeaveRepository>;
  let mockLeaveTypeRepository: jest.Mocked<LeaveTypeRepository>;
  let mockLeavePolicyRepository: jest.Mocked<LeavePolicyRepository>;
  let mockLeaveAllocationRepository: jest.Mocked<LeaveAllocationRepository>;
  let mockLeaveApprovalRepository: jest.Mocked<LeaveApprovalRepository>;
  let mockActivityLogRepository: jest.Mocked<ActivityLogRepository>;
  let mockTransactionHelper: jest.Mocked<TransactionPort>;

  const mockTransactionManager = {};
  const userId = 'test-user-id';
  const requestInfo = {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    sessionId: 'session-123',
    username: 'testuser',
  };

  beforeEach(async () => {
    // Create minimal mock repositories with only the methods we need for tests
    mockLeaveRepository = {
      create: jest.fn(),
      findOverlappingLeaves: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      findByEmployee: jest.fn(),
      findByStatus: jest.fn(),
      findByEmployeeAndStatus: jest.fn(),
      findPaginatedList: jest.fn(),
      bulkUpdateStatus: jest.fn(),
      countByStatus: jest.fn(),
      countByEmployeeAndStatus: jest.fn(),
      findByCutoffYear: jest.fn(),
      findByEmployeeAndCutoffYear: jest.fn(),
      findByEmployeeAndLeaveType: jest.fn(),
      findByDateRange: jest.fn(),
    } as jest.Mocked<LeaveRepository>;

    mockLeaveTypeRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      findByCategory: jest.fn(),
      findByCode: jest.fn(),
      findActive: jest.fn(),
      findPaidLeaveTypes: jest.fn(),
      findUnpaidLeaveTypes: jest.fn(),
      findAccruableLeaveTypes: jest.fn(),
      findNonAccruableLeaveTypes: jest.fn(),
      findApprovalRequiredLeaveTypes: jest.fn(),
      findNoApprovalRequiredLeaveTypes: jest.fn(),
      findDocumentationRequiredLeaveTypes: jest.fn(),
      findPaginated: jest.fn(),
      bulkUpdateStatus: jest.fn(),
      countByCategory: jest.fn(),
      countActive: jest.fn(),
      countInactive: jest.fn(),
    } as jest.Mocked<LeaveTypeRepository>;

    mockLeavePolicyRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      findByEmployeeType: jest.fn(),
      findByLeaveTypeId: jest.fn(),
      findByEmployeeTypeAndLeaveType: jest.fn(),
      findActive: jest.fn(),
      findInactive: jest.fn(),
      findPaginated: jest.fn(),
      bulkUpdateStatus: jest.fn(),
      countByEmployeeType: jest.fn(),
      countByLeaveType: jest.fn(),
      countActive: jest.fn(),
    } as jest.Mocked<LeavePolicyRepository>;

    mockLeaveAllocationRepository = {
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      findById: jest.fn(),
      findByEmployeeId: jest.fn(),
      findByEmployeeIdAndPeriod: jest.fn(),
      findByEmployeeIdAndLeaveType: jest.fn(),
      findByEmployeeIdAndLeaveTypeAndCutoffYear: jest.fn(),
      findByCutoffYear: jest.fn(),
      findByPeriodStatus: jest.fn(),
      findByLeaveTypeId: jest.fn(),
      findActiveAllocations: jest.fn(),
      updateAllocationForEmployee: jest.fn(),
      findPaginated: jest.fn(),
      countByEmployee: jest.fn(),
      countByPeriod: jest.fn(),
      countActive: jest.fn(),
    } as jest.Mocked<LeaveAllocationRepository>;

    mockLeaveApprovalRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      findByLeaveId: jest.fn(),
      findByLeaveIdOrdered: jest.fn(),
      findByApproverId: jest.fn(),
      findByApproverIdAndStatus: jest.fn(),
      findByStatus: jest.fn(),
      findPendingApprovals: jest.fn(),
      findByApprovalLevel: jest.fn(),
      findByLeaveIdAndApprover: jest.fn(),
      findPaginated: jest.fn(),
      bulkUpdateStatus: jest.fn(),
      countByStatus: jest.fn(),
      countByApprover: jest.fn(),
      countPendingByApprover: jest.fn(),
    } as jest.Mocked<LeaveApprovalRepository>;

    mockActivityLogRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByEntity: jest.fn(),
      findByAction: jest.fn(),
    } as jest.Mocked<ActivityLogRepository>;

    mockTransactionHelper = {
      executeTransaction: jest.fn(),
    } as jest.Mocked<TransactionPort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateLeaveUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.LEAVE,
          useValue: mockLeaveRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.LEAVE_TYPE,
          useValue: mockLeaveTypeRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.LEAVE_POLICY,
          useValue: mockLeavePolicyRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.LEAVE_ALLOCATION,
          useValue: mockLeaveAllocationRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.LEAVE_APPROVAL,
          useValue: mockLeaveApprovalRepository,
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

    useCase = module.get<CreateLeaveUseCase>(CreateLeaveUseCase);

    // Setup default transaction helper behavior
    mockTransactionHelper.executeTransaction.mockImplementation(
      async (action: string, callback: (manager: any) => Promise<any>) => {
        return callback(mockTransactionManager);
      },
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper functions for creating test data
  const createValidCommand = (): CreateLeaveCommand => ({
    employeeId: 123,
    leaveTypeId: 1,
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-06-05'),
    reason: 'Family vacation',
    totalDays: 5,
    cutoffYear: 2024,
  });

  const createMockLeaveType = (id: number = 1): LeaveType =>
    new LeaveType({
      id,
      desc1: 'Annual Leave',
      code: 'AL',
      category: LeaveCategory.VACATION,
      isPaid: true,
      isAccruable: false,
      requiresApproval: true,
      requiresDocumentation: false,
      canBeCarriedOver: true,
      createdBy: userId,
      updatedBy: userId,
    });

  const createMockLeaveAllocation = (
    allocatedDays: number = 25,
    usedDays: number = 5,
    carryOverDays: number = 5,
  ): LeaveAllocation =>
    new LeaveAllocation({
      employeeId: 123,
      leaveTypeId: 1,
      cutoffYear: 2024,
      allocatedDays,
      usedDays,
      carryOverDays,
      expiredDays: 0,
      periodStatus: 'ACTIVE' as any,
      cutoffStartDate: new Date('2023-11-26'),
      cutoffEndDate: new Date('2024-11-25'),
      createdBy: userId,
      updatedBy: userId,
    });

  const createMockLeavePolicy = () =>
    new LeavePolicy({
      employeeType: 'REGULAR',
      leaveTypeId: 1,
      annualAllocation: 25,
      accrualRate: 2.083,
      maxCarryOver: 10,
      carryOverExpiryMonths: 6,
      minimumNoticeHours: 24,
      maxConsecutiveDays: 30,
      maxDaysPerRequest: 10,
      blackoutPeriods: [],
      approvalWorkflow: [
        new ApprovalWorkflow(
          1, // level
          ApproverType.SUPERVISOR, // approverType
          456, // approverId
          true, // isRequired
          false, // canDelegate
          0, // maxDelegationLevels
        ),
      ],
      documentationRequirements: [],
      isActive: true,
      effectiveDate: new Date('2024-01-01'),
      createdBy: userId,
      updatedBy: userId,
    });

  describe('✅ Successful Leave Creation', () => {
    it('should create a leave request successfully when all validations pass', async () => {
      // Arrange
      const command = createValidCommand();
      const mockLeaveType = createMockLeaveType();
      const mockAllocation = createMockLeaveAllocation();
      const mockPolicy = createMockLeavePolicy();

      const createdLeave = new Leave({
        id: 1,
        ...command,
        status: LeaveStatus.PENDING,
        createdBy: userId,
        updatedBy: userId,
      });

      mockLeaveTypeRepository.findById.mockResolvedValue(mockLeaveType);
      mockLeaveAllocationRepository.findByEmployeeIdAndLeaveType.mockResolvedValue(
        [mockAllocation],
      );
      mockLeavePolicyRepository.findByEmployeeTypeAndLeaveType.mockResolvedValue(
        [mockPolicy],
      );
      mockLeaveRepository.findOverlappingLeaves.mockResolvedValue([]);
      mockLeaveRepository.create.mockResolvedValue(createdLeave);
      mockLeaveApprovalRepository.create.mockResolvedValue(
        new LeaveApproval({
          leaveId: 1,
          approverId: 456,
          approvalLevel: 1,
          status: ApprovalStatus.PENDING,
          createdBy: userId,
          updatedBy: userId,
        }),
      );
      mockActivityLogRepository.create.mockResolvedValue(
        new ActivityLog(
          CONSTANTS_LOG_ACTION.CREATE_LEAVE,
          CONSTANTS_DATABASE_MODELS.LEAVE,
          userId,
          {
            isSuccess: true,
            statusCode: 201,
            ipAddress: requestInfo.ipAddress,
            userAgent: requestInfo.userAgent,
            sessionId: requestInfo.sessionId,
            username: requestInfo.username,
            createdBy: userId,
          },
        ),
      );

      // Act
      const result = await useCase.execute(command, userId, requestInfo);

      // Assert
      expect(result).toEqual(createdLeave);
      expect(mockLeaveTypeRepository.findById).toHaveBeenCalledWith(
        command.leaveTypeId,
        mockTransactionManager,
      );
      expect(mockLeaveRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...command,
          status: LeaveStatus.PENDING,
          createdBy: userId,
          updatedBy: userId,
        }),
        mockTransactionManager,
      );
      expect(mockActivityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_LEAVE,
          entity: CONSTANTS_DATABASE_MODELS.LEAVE,
          userId: userId,
          isSuccess: true,
          statusCode: 201,
        }),
        mockTransactionManager,
      );
    });

    it('should create leave without approval workflow when leave type does not require approval', async () => {
      // Arrange
      const command = createValidCommand();
      const mockLeaveType = new LeaveType({
        ...createMockLeaveType(),
        requiresApproval: false,
      });
      const mockAllocation = createMockLeaveAllocation();

      const createdLeave = new Leave({
        id: 1,
        ...command,
        status: LeaveStatus.PENDING,
        createdBy: userId,
        updatedBy: userId,
      });

      mockLeaveTypeRepository.findById.mockResolvedValue(mockLeaveType);
      mockLeaveAllocationRepository.findByEmployeeIdAndLeaveType.mockResolvedValue(
        [mockAllocation],
      );
      mockLeavePolicyRepository.findByEmployeeTypeAndLeaveType.mockResolvedValue(
        [],
      );
      mockLeaveRepository.findOverlappingLeaves.mockResolvedValue([]);
      mockLeaveRepository.create.mockResolvedValue(createdLeave);
      mockActivityLogRepository.create.mockResolvedValue(
        new ActivityLog(
          CONSTANTS_LOG_ACTION.CREATE_LEAVE,
          CONSTANTS_DATABASE_MODELS.LEAVE,
          userId,
          {
            isSuccess: true,
            statusCode: 201,
            ipAddress: requestInfo.ipAddress,
            userAgent: requestInfo.userAgent,
            sessionId: requestInfo.sessionId,
            username: requestInfo.username,
            createdBy: userId,
          },
        ),
      );

      // Act
      const result = await useCase.execute(command, userId, requestInfo);

      // Assert
      expect(result).toEqual(createdLeave);
      expect(mockLeaveApprovalRepository.create).not.toHaveBeenCalled();
    });

    it('should create leave with multiple approval levels', async () => {
      // Arrange
      const command = createValidCommand();
      const mockLeaveType = createMockLeaveType();
      const mockAllocation = createMockLeaveAllocation();
      const mockPolicy = new LeavePolicy({
        ...createMockLeavePolicy(),
        approvalWorkflow: [
          new ApprovalWorkflow(1, ApproverType.SUPERVISOR, 456, true, false, 0),
          new ApprovalWorkflow(2, ApproverType.MANAGER, 789, true, false, 0),
        ],
      });

      const createdLeave = new Leave({
        id: 1,
        ...command,
        status: LeaveStatus.PENDING,
        createdBy: userId,
        updatedBy: userId,
      });

      mockLeaveTypeRepository.findById.mockResolvedValue(mockLeaveType);
      mockLeaveAllocationRepository.findByEmployeeIdAndLeaveType.mockResolvedValue(
        [mockAllocation],
      );
      mockLeavePolicyRepository.findByEmployeeTypeAndLeaveType.mockResolvedValue(
        [mockPolicy],
      );
      mockLeaveRepository.findOverlappingLeaves.mockResolvedValue([]);
      mockLeaveRepository.create.mockResolvedValue(createdLeave);
      mockLeaveApprovalRepository.create.mockResolvedValue(
        new LeaveApproval({
          leaveId: 1,
          approverId: 456,
          approvalLevel: 1,
          status: ApprovalStatus.PENDING,
          createdBy: userId,
          updatedBy: userId,
        }),
      );
      mockActivityLogRepository.create.mockResolvedValue(
        new ActivityLog(
          CONSTANTS_LOG_ACTION.CREATE_LEAVE,
          CONSTANTS_DATABASE_MODELS.LEAVE,
          userId,
          {
            isSuccess: true,
            statusCode: 201,
            ipAddress: requestInfo.ipAddress,
            userAgent: requestInfo.userAgent,
            sessionId: requestInfo.sessionId,
            username: requestInfo.username,
            createdBy: userId,
          },
        ),
      );

      // Act
      await useCase.execute(command, userId, requestInfo);

      // Assert
      expect(mockLeaveApprovalRepository.create).toHaveBeenCalledTimes(2);
      expect(mockLeaveApprovalRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          leaveId: createdLeave.id,
          approverId: 456,
          approvalLevel: 1,
          status: ApprovalStatus.PENDING,
          createdBy: userId,
          updatedBy: userId,
        }),
        mockTransactionManager,
      );
      expect(mockLeaveApprovalRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          leaveId: createdLeave.id,
          approverId: 789,
          approvalLevel: 2,
          status: ApprovalStatus.PENDING,
          createdBy: userId,
          updatedBy: userId,
        }),
        mockTransactionManager,
      );
    });
  });

  describe('❌ Validation Errors', () => {
    it('should throw NotFoundException when leave type does not exist', async () => {
      // Arrange
      const command = createValidCommand();
      mockLeaveTypeRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        useCase.execute(command, userId, requestInfo),
      ).rejects.toThrow(NotFoundException);
      expect(mockLeaveTypeRepository.findById).toHaveBeenCalledWith(
        command.leaveTypeId,
        mockTransactionManager,
      );
    });

    it('should throw ValidationException when start date is not before end date', async () => {
      // Arrange
      const command = {
        ...createValidCommand(),
        startDate: new Date('2024-06-10'),
        endDate: new Date('2024-06-05'),
      };
      const mockLeaveType = createMockLeaveType();

      mockLeaveTypeRepository.findById.mockResolvedValue(mockLeaveType);

      // Act & Assert
      await expect(
        useCase.execute(command, userId, requestInfo),
      ).rejects.toThrow(ValidationException);
      expect(mockLeaveRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationException when total days is not positive', async () => {
      // Arrange
      const command = {
        ...createValidCommand(),
        totalDays: 0,
      };
      const mockLeaveType = createMockLeaveType();

      mockLeaveTypeRepository.findById.mockResolvedValue(mockLeaveType);

      // Act & Assert
      await expect(
        useCase.execute(command, userId, requestInfo),
      ).rejects.toThrow(ValidationException);
      expect(mockLeaveRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationException when leave overlaps with existing approved leave', async () => {
      // Arrange
      const command = createValidCommand();
      const mockLeaveType = createMockLeaveType();
      const overlappingLeave = new Leave({
        id: 2,
        employeeId: 123,
        leaveTypeId: 1,
        startDate: new Date('2024-06-03'),
        endDate: new Date('2024-06-07'),
        reason: 'Overlapping vacation',
        totalDays: 5,
        status: LeaveStatus.APPROVED,
        cutoffYear: 2024,
        createdBy: userId,
        updatedBy: userId,
      });

      mockLeaveTypeRepository.findById.mockResolvedValue(mockLeaveType);
      mockLeaveRepository.findOverlappingLeaves.mockResolvedValue([
        overlappingLeave,
      ]);

      // Act & Assert
      await expect(
        useCase.execute(command, userId, requestInfo),
      ).rejects.toThrow(ValidationException);
      expect(mockLeaveRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('❌ Balance Validation Errors', () => {
    it('should throw NotFoundException when no leave allocation found', async () => {
      // Arrange
      const command = createValidCommand();
      const mockLeaveType = createMockLeaveType();

      mockLeaveTypeRepository.findById.mockResolvedValue(mockLeaveType);
      mockLeaveAllocationRepository.findByEmployeeIdAndLeaveType.mockResolvedValue(
        [],
      );
      mockLeavePolicyRepository.findByEmployeeTypeAndLeaveType.mockResolvedValue(
        [],
      );
      mockLeaveRepository.findOverlappingLeaves.mockResolvedValue([]);

      // Act & Assert
      await expect(
        useCase.execute(command, userId, requestInfo),
      ).rejects.toThrow(NotFoundException);
      expect(mockLeaveRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationException when insufficient leave balance', async () => {
      // Arrange
      const command = createValidCommand(); // Requests 5 days
      const mockLeaveType = createMockLeaveType();
      const mockAllocation = createMockLeaveAllocation(25, 22, 0); // Only 27-22=3 days available (25 allocated, 22 used, 0 carry-over)

      mockLeaveTypeRepository.findById.mockResolvedValue(mockLeaveType);
      mockLeaveAllocationRepository.findByEmployeeIdAndLeaveType.mockResolvedValue(
        [mockAllocation],
      );
      mockLeavePolicyRepository.findByEmployeeTypeAndLeaveType.mockResolvedValue(
        [],
      );
      mockLeaveRepository.findOverlappingLeaves.mockResolvedValue([]);

      // Act & Assert
      await expect(
        useCase.execute(command, userId, requestInfo),
      ).rejects.toThrow(ValidationException);
      expect(mockLeaveRepository.create).not.toHaveBeenCalled();
    });

    it('should allow leave creation when exact balance available', async () => {
      // Arrange
      const command = createValidCommand();
      const mockLeaveType = createMockLeaveType();
      const mockAllocation = createMockLeaveAllocation(25, 20, 0); // Exactly 5 days available
      const mockPolicy = createMockLeavePolicy();

      const createdLeave = new Leave({
        id: 1,
        ...command,
        status: LeaveStatus.PENDING,
        createdBy: userId,
        updatedBy: userId,
      });

      mockLeaveTypeRepository.findById.mockResolvedValue(mockLeaveType);
      mockLeaveAllocationRepository.findByEmployeeIdAndLeaveType.mockResolvedValue(
        [mockAllocation],
      );
      mockLeavePolicyRepository.findByEmployeeTypeAndLeaveType.mockResolvedValue(
        [mockPolicy],
      );
      mockLeaveRepository.findOverlappingLeaves.mockResolvedValue([]);
      mockLeaveRepository.create.mockResolvedValue(createdLeave);
      mockLeaveApprovalRepository.create.mockResolvedValue(
        new LeaveApproval({
          leaveId: 1,
          approverId: 456,
          approvalLevel: 1,
          status: ApprovalStatus.PENDING,
          createdBy: userId,
          updatedBy: userId,
        }),
      );
      mockActivityLogRepository.create.mockResolvedValue(
        new ActivityLog(
          CONSTANTS_LOG_ACTION.CREATE_LEAVE,
          CONSTANTS_DATABASE_MODELS.LEAVE,
          userId,
          {
            isSuccess: true,
            statusCode: 201,
            ipAddress: requestInfo.ipAddress,
            userAgent: requestInfo.userAgent,
            sessionId: requestInfo.sessionId,
            username: requestInfo.username,
            createdBy: userId,
          },
        ),
      );

      // Act
      const result = await useCase.execute(command, userId, requestInfo);

      // Assert
      expect(result).toEqual(createdLeave);
      expect(mockLeaveRepository.create).toHaveBeenCalled();
    });
  });

  describe('📝 Activity Logging', () => {
    it('should log successful leave creation with correct activity details', async () => {
      // Arrange
      const command = createValidCommand();
      const mockLeaveType = createMockLeaveType();
      const mockAllocation = createMockLeaveAllocation();
      const mockPolicy = createMockLeavePolicy();

      const createdLeave = new Leave({
        id: 1,
        ...command,
        status: LeaveStatus.PENDING,
        createdBy: userId,
        updatedBy: userId,
      });

      mockLeaveTypeRepository.findById.mockResolvedValue(mockLeaveType);
      mockLeaveAllocationRepository.findByEmployeeIdAndLeaveType.mockResolvedValue(
        [mockAllocation],
      );
      mockLeavePolicyRepository.findByEmployeeTypeAndLeaveType.mockResolvedValue(
        [mockPolicy],
      );
      mockLeaveRepository.findOverlappingLeaves.mockResolvedValue([]);
      mockLeaveRepository.create.mockResolvedValue(createdLeave);
      mockLeaveApprovalRepository.create.mockResolvedValue(
        new LeaveApproval({
          leaveId: 1,
          approverId: 456,
          approvalLevel: 1,
          status: ApprovalStatus.PENDING,
          createdBy: userId,
          updatedBy: userId,
        }),
      );
      mockActivityLogRepository.create.mockResolvedValue(
        new ActivityLog(
          CONSTANTS_LOG_ACTION.CREATE_LEAVE,
          CONSTANTS_DATABASE_MODELS.LEAVE,
          userId,
          {
            isSuccess: true,
            statusCode: 201,
            ipAddress: requestInfo.ipAddress,
            userAgent: requestInfo.userAgent,
            sessionId: requestInfo.sessionId,
            username: requestInfo.username,
            createdBy: userId,
          },
        ),
      );

      // Act
      await useCase.execute(command, userId, requestInfo);

      // Assert
      expect(mockActivityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_LEAVE,
          entity: CONSTANTS_DATABASE_MODELS.LEAVE,
          userId: userId,
          isSuccess: true,
          statusCode: 201,
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent,
          sessionId: requestInfo.sessionId,
          username: requestInfo.username,
        }),
        mockTransactionManager,
      );
    });

    it('should log failed leave creation with error details', async () => {
      // Arrange
      const command = createValidCommand();
      mockLeaveTypeRepository.findById.mockResolvedValue(null);
      mockActivityLogRepository.create.mockResolvedValue(
        new ActivityLog(
          CONSTANTS_LOG_ACTION.CREATE_LEAVE,
          CONSTANTS_DATABASE_MODELS.LEAVE,
          userId,
          {
            isSuccess: false,
            statusCode: 500,
            ipAddress: requestInfo.ipAddress,
            userAgent: requestInfo.userAgent,
            sessionId: requestInfo.sessionId,
            username: requestInfo.username,
            createdBy: userId,
            errorMessage: 'Leave type with ID 1 not found',
          },
        ),
      );

      // Act & Assert
      await expect(
        useCase.execute(command, userId, requestInfo),
      ).rejects.toThrow(NotFoundException);

      expect(mockActivityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_LEAVE,
          entity: CONSTANTS_DATABASE_MODELS.LEAVE,
          userId: userId,
          isSuccess: false,
          statusCode: 500,
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent,
          sessionId: requestInfo.sessionId,
          username: requestInfo.username,
        }),
        mockTransactionManager,
      );
    });
  });

  describe('🎯 Edge Cases', () => {
    it('should handle leave request without request info', async () => {
      // Arrange
      const command = createValidCommand();
      const mockLeaveType = createMockLeaveType();
      const mockAllocation = createMockLeaveAllocation();
      const mockPolicy = createMockLeavePolicy();

      const createdLeave = new Leave({
        id: 1,
        ...command,
        status: LeaveStatus.PENDING,
        createdBy: userId,
        updatedBy: userId,
      });

      mockLeaveTypeRepository.findById.mockResolvedValue(mockLeaveType);
      mockLeaveAllocationRepository.findByEmployeeIdAndLeaveType.mockResolvedValue(
        [mockAllocation],
      );
      mockLeavePolicyRepository.findByEmployeeTypeAndLeaveType.mockResolvedValue(
        [mockPolicy],
      );
      mockLeaveRepository.findOverlappingLeaves.mockResolvedValue([]);
      mockLeaveRepository.create.mockResolvedValue(createdLeave);
      mockLeaveApprovalRepository.create.mockResolvedValue(
        new LeaveApproval({
          leaveId: 1,
          approverId: 456,
          approvalLevel: 1,
          status: ApprovalStatus.PENDING,
          createdBy: userId,
          updatedBy: userId,
        }),
      );
      mockActivityLogRepository.create.mockResolvedValue(
        new ActivityLog(
          CONSTANTS_LOG_ACTION.CREATE_LEAVE,
          CONSTANTS_DATABASE_MODELS.LEAVE,
          userId,
          {
            isSuccess: true,
            statusCode: 201,
            ipAddress: requestInfo.ipAddress,
            userAgent: requestInfo.userAgent,
            sessionId: requestInfo.sessionId,
            username: requestInfo.username,
            createdBy: userId,
          },
        ),
      );

      // Act
      const result = await useCase.execute(command, userId);

      // Assert
      expect(result).toEqual(createdLeave);
      expect(mockLeaveRepository.create).toHaveBeenCalled();
    });

    it('should handle same leave dates (single day leave)', async () => {
      // Arrange
      const command = {
        ...createValidCommand(),
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-01'),
      };
      const mockLeaveType = createMockLeaveType();
      const mockAllocation = createMockLeaveAllocation();

      mockLeaveTypeRepository.findById.mockResolvedValue(mockLeaveType);
      mockLeaveAllocationRepository.findByEmployeeIdAndLeaveType.mockResolvedValue(
        [mockAllocation],
      );
      mockLeavePolicyRepository.findByEmployeeTypeAndLeaveType.mockResolvedValue(
        [],
      );
      mockLeaveRepository.findOverlappingLeaves.mockResolvedValue([]);

      // Act & Assert
      await expect(
        useCase.execute(command, userId, requestInfo),
      ).rejects.toThrow(ValidationException);
    });

    it('should handle leave type with carry-over but no balance used', async () => {
      // Arrange
      const command = createValidCommand();
      const mockLeaveType = createMockLeaveType();
      const mockAllocation = createMockLeaveAllocation(25, 0, 10); // Fresh allocation with carry-over
      const mockPolicy = createMockLeavePolicy();

      const createdLeave = new Leave({
        id: 1,
        ...command,
        status: LeaveStatus.PENDING,
        createdBy: userId,
        updatedBy: userId,
      });

      mockLeaveTypeRepository.findById.mockResolvedValue(mockLeaveType);
      mockLeaveAllocationRepository.findByEmployeeIdAndLeaveType.mockResolvedValue(
        [mockAllocation],
      );
      mockLeavePolicyRepository.findByEmployeeTypeAndLeaveType.mockResolvedValue(
        [mockPolicy],
      );
      mockLeaveRepository.findOverlappingLeaves.mockResolvedValue([]);
      mockLeaveRepository.create.mockResolvedValue(createdLeave);
      mockLeaveApprovalRepository.create.mockResolvedValue(
        new LeaveApproval({
          leaveId: 1,
          approverId: 456,
          approvalLevel: 1,
          status: ApprovalStatus.PENDING,
          createdBy: userId,
          updatedBy: userId,
        }),
      );
      mockActivityLogRepository.create.mockResolvedValue(
        new ActivityLog(
          CONSTANTS_LOG_ACTION.CREATE_LEAVE,
          CONSTANTS_DATABASE_MODELS.LEAVE,
          userId,
          {
            isSuccess: true,
            statusCode: 201,
            ipAddress: requestInfo.ipAddress,
            userAgent: requestInfo.userAgent,
            sessionId: requestInfo.sessionId,
            username: requestInfo.username,
            createdBy: userId,
          },
        ),
      );

      // Act
      const result = await useCase.execute(command, userId, requestInfo);

      // Assert
      expect(result).toEqual(createdLeave);
      expect(mockLeaveRepository.create).toHaveBeenCalled();
    });
  });
});
