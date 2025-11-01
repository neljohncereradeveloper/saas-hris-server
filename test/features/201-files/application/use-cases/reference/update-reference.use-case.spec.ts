import { Test, TestingModule } from '@nestjs/testing';
import { UpdateReferenceUseCase } from '@features/201-files/application/use-cases/reference/update-reference.use-case';
import { ReferenceRepository } from '@features/201-files/domain/repositories/reference.repository';
import { Reference } from '@features/201-files/domain/models/reference.model';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { UpdateReferenceCommand } from '@features/201-files/application/commands/reference/update-reference.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@features/shared/exceptions/shared';

describe('UpdateReferenceUseCase', () => {
  let useCase: UpdateReferenceUseCase;
  let referenceRepository: jest.Mocked<ReferenceRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockReferenceId = 1;
  const mockExistingReference = new Reference({
    id: mockReferenceId,
    employeeId: 1,
    fname: 'John',
    mname: 'Michael',
    lname: 'Doe',
    suffix: 'Jr.',
    cellphoneNumber: '+1234567890',
    isActive: true,
  });

  const mockUpdatedReference = new Reference({
    id: mockReferenceId,
    employeeId: 1,
    fname: 'John',
    mname: 'Michael',
    lname: 'Smith',
    suffix: 'Sr.',
    cellphoneNumber: '+0987654321',
    isActive: true,
  });

  const mockUpdateCommand: UpdateReferenceCommand = {
    fname: 'John',
    mname: 'Michael',
    lname: 'Smith',
    suffix: 'Sr.',
    cellphoneNumber: '+0987654321',
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
        UpdateReferenceUseCase,
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

    useCase = module.get<UpdateReferenceUseCase>(UpdateReferenceUseCase);
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
    it('should successfully update a reference record and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      referenceRepository.findById
        .mockResolvedValueOnce(mockExistingReference) // First call for validation
        .mockResolvedValueOnce(mockUpdatedReference); // Second call after update
      referenceRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockReferenceId,
        mockUpdateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.UPDATE_REFERENCE,
        expect.any(Function),
      );
      expect(referenceRepository.findById).toHaveBeenCalledWith(
        mockReferenceId,
        mockManager,
      );
      expect(referenceRepository.update).toHaveBeenCalledWith(
        mockReferenceId,
        expect.objectContaining({
          fname: mockUpdateCommand.fname,
          mname: mockUpdateCommand.mname,
          lname: mockUpdateCommand.lname,
          suffix: mockUpdateCommand.suffix,
          cellphoneNumber: mockUpdateCommand.cellphoneNumber,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_REFERENCE,
          entity: CONSTANTS_DATABASE_MODELS.REFERENCE,
          userId: mockUserId,
          details: JSON.stringify({
            oldData: {
              id: mockExistingReference.id,
              employeeId: mockExistingReference.employeeId,
              fname: mockExistingReference.fname,
              mname: mockExistingReference.mname,
              lname: mockExistingReference.lname,
              suffix: mockExistingReference.suffix,
              cellphoneNumber: mockExistingReference.cellphoneNumber,
              isActive: mockExistingReference.isActive,
            },
            newData: {
              id: mockUpdatedReference.id,
              employeeId: mockUpdatedReference.employeeId,
              fname: mockUpdatedReference.fname,
              mname: mockUpdatedReference.mname,
              lname: mockUpdatedReference.lname,
              suffix: mockUpdatedReference.suffix,
              cellphoneNumber: mockUpdatedReference.cellphoneNumber,
              isActive: mockUpdatedReference.isActive,
            },
          }),
          description: `Updated reference: ${mockUpdatedReference.id}`,
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
      expect(result).toEqual(mockUpdatedReference);
    });

    it('should throw NotFoundException when reference record does not exist', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      referenceRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockReferenceId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(referenceRepository.findById).toHaveBeenCalledWith(
        mockReferenceId,
        mockManager,
      );
      expect(referenceRepository.update).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_REFERENCE,
          entity: CONSTANTS_DATABASE_MODELS.REFERENCE,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockReferenceId,
            dto: mockUpdateCommand,
          }),
          description: `Failed to update reference with ID: ${mockReferenceId}`,
          isSuccess: false,
          errorMessage: 'Reference not found',
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
      referenceRepository.findById.mockResolvedValue(mockExistingReference);
      referenceRepository.update.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockReferenceId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(referenceRepository.findById).toHaveBeenCalledWith(
        mockReferenceId,
        mockManager,
      );
      expect(referenceRepository.update).toHaveBeenCalledWith(
        mockReferenceId,
        expect.objectContaining({
          fname: mockUpdateCommand.fname,
          mname: mockUpdateCommand.mname,
          lname: mockUpdateCommand.lname,
          suffix: mockUpdateCommand.suffix,
          cellphoneNumber: mockUpdateCommand.cellphoneNumber,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Reference update failed',
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
      referenceRepository.findById.mockResolvedValue(mockExistingReference);
      referenceRepository.update.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockReferenceId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow('Database connection failed');

      expect(referenceRepository.findById).toHaveBeenCalledWith(
        mockReferenceId,
        mockManager,
      );
      expect(referenceRepository.update).toHaveBeenCalledWith(
        mockReferenceId,
        expect.objectContaining({
          fname: mockUpdateCommand.fname,
          mname: mockUpdateCommand.mname,
          lname: mockUpdateCommand.lname,
          suffix: mockUpdateCommand.suffix,
          cellphoneNumber: mockUpdateCommand.cellphoneNumber,
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
      referenceRepository.findById
        .mockResolvedValueOnce(mockExistingReference)
        .mockResolvedValueOnce(mockUpdatedReference);
      referenceRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockReferenceId,
        mockUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(referenceRepository.findById).toHaveBeenCalledWith(
        mockReferenceId,
        mockManager,
      );
      expect(referenceRepository.update).toHaveBeenCalledWith(
        mockReferenceId,
        expect.objectContaining({
          fname: mockUpdateCommand.fname,
          mname: mockUpdateCommand.mname,
          lname: mockUpdateCommand.lname,
          suffix: mockUpdateCommand.suffix,
          cellphoneNumber: mockUpdateCommand.cellphoneNumber,
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
      expect(result).toEqual(mockUpdatedReference);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      referenceRepository.findById.mockResolvedValue(mockExistingReference);
      referenceRepository.update.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockReferenceId,
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
