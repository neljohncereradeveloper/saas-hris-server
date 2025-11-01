import { Test, TestingModule } from '@nestjs/testing';
import { CreateReferenceUseCase } from '@features/201-files/application/use-cases/reference/create-reference.use-case';
import { ReferenceRepository } from '@features/201-files/domain/repositories/reference.repository';
import { Reference } from '@features/201-files/domain/models/reference.model';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { CreateReferenceCommand } from '@features/201-files/application/commands/reference/create-reference.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';

describe('CreateReferenceUseCase', () => {
  let useCase: CreateReferenceUseCase;
  let referenceRepository: jest.Mocked<ReferenceRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockReference = new Reference({
    id: 1,
    employeeId: 1,
    fname: 'John',
    mname: 'Michael',
    lname: 'Doe',
    suffix: 'Jr.',
    cellphoneNumber: '+1234567890',
    isActive: true,
  });

  const mockCreateCommand: CreateReferenceCommand = {
    employeeId: 1,
    fname: 'John',
    mname: 'Michael',
    lname: 'Doe',
    suffix: 'Jr.',
    cellphoneNumber: '+1234567890',
  };

  const mockUserId = 'user-123';
  const mockRequestInfo = {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    sessionId: 'session-123',
    username: 'testuser',
  };

  beforeEach(async () => {
    const mockReferenceRepository = {
      create: jest.fn(),
    };

    const mockActivityLogRepository = {
      create: jest.fn(),
    };

    const mockTransactionHelper = {
      executeTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateReferenceUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.REFERENCE,
          useValue: mockReferenceRepository,
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

    useCase = module.get<CreateReferenceUseCase>(CreateReferenceUseCase);
    referenceRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.REFERENCE);
    activityLogRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
    );
    transactionHelper = module.get(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully create a reference record and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      referenceRepository.create.mockResolvedValue(mockReference);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockCreateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.CREATE_REFERENCE,
        expect.any(Function),
      );
      expect(referenceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeId: mockCreateCommand.employeeId,
          fname: mockCreateCommand.fname,
          mname: mockCreateCommand.mname,
          lname: mockCreateCommand.lname,
          suffix: mockCreateCommand.suffix,
          cellphoneNumber: mockCreateCommand.cellphoneNumber,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_REFERENCE,
          entity: CONSTANTS_DATABASE_MODELS.REFERENCE,
          userId: mockUserId,
          details: JSON.stringify({
            referenceData: {
              id: mockReference.id,
              employeeId: mockReference.employeeId,
              fname: mockReference.fname,
              mname: mockReference.mname,
              lname: mockReference.lname,
              suffix: mockReference.suffix,
              cellphoneNumber: mockReference.cellphoneNumber,
              isActive: mockReference.isActive,
            },
          }),
          description: `Created new reference For Employee: ${mockReference.employeeId}`,
          ipAddress: mockRequestInfo.ipAddress,
          userAgent: mockRequestInfo.userAgent,
          sessionId: mockRequestInfo.sessionId,
          username: mockRequestInfo.username,
          isSuccess: true,
          statusCode: 201,
          createdBy: mockUserId,
        }),
        mockManager,
      );
      expect(result).toEqual(mockReference);
    });

    it('should handle creation failure and log error', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      referenceRepository.create.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockCreateCommand, mockUserId, mockRequestInfo),
      ).rejects.toThrow('Database connection failed');

      expect(referenceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeId: mockCreateCommand.employeeId,
          fname: mockCreateCommand.fname,
          mname: mockCreateCommand.mname,
          lname: mockCreateCommand.lname,
          suffix: mockCreateCommand.suffix,
          cellphoneNumber: mockCreateCommand.cellphoneNumber,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_REFERENCE,
          entity: CONSTANTS_DATABASE_MODELS.REFERENCE,
          userId: mockUserId,
          details: JSON.stringify({ dto: mockCreateCommand }),
          description: `Failed to create reference For Employee: ${mockCreateCommand.employeeId}`,
          ipAddress: mockRequestInfo.ipAddress,
          userAgent: mockRequestInfo.userAgent,
          sessionId: mockRequestInfo.sessionId,
          username: mockRequestInfo.username,
          isSuccess: false,
          errorMessage: 'Database connection failed',
          statusCode: 500,
          createdBy: mockUserId,
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
      referenceRepository.create.mockResolvedValue(mockReference);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(mockCreateCommand, mockUserId);

      // Assert
      expect(referenceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeId: mockCreateCommand.employeeId,
          fname: mockCreateCommand.fname,
          mname: mockCreateCommand.mname,
          lname: mockCreateCommand.lname,
          suffix: mockCreateCommand.suffix,
          cellphoneNumber: mockCreateCommand.cellphoneNumber,
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
      expect(result).toEqual(mockReference);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      referenceRepository.create.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockCreateCommand, mockUserId, mockRequestInfo),
      ).rejects.toBe('Unknown error');

      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Unknown error',
        }),
        mockManager,
      );
    });

    it('should handle reference creation with minimal data', async () => {
      // Arrange
      const minimalCommand: CreateReferenceCommand = {
        employeeId: 1,
        fname: 'Jane',
        lname: 'Smith',
      };
      const minimalReference = new Reference({
        id: 2,
        employeeId: 1,
        fname: 'Jane',
        lname: 'Smith',
        isActive: true,
      });
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      referenceRepository.create.mockResolvedValue(minimalReference);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(minimalCommand, mockUserId);

      // Assert
      expect(referenceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeId: minimalCommand.employeeId,
          fname: minimalCommand.fname,
          lname: minimalCommand.lname,
        }),
        mockManager,
      );
      expect(result).toEqual(minimalReference);
    });
  });
});
