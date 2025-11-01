import { Test, TestingModule } from '@nestjs/testing';
import { UpdateWorkExpUseCase } from '@features/201-files/application/use-cases/workexp/update-workexp.use-case';
import { WorkExpRepository } from '@features/201-files/domain/repositories/workexp.repository';
import { WorkexpCompanyRepository } from '@features/201-files/domain/repositories/workexp-company.repository';
import { WorkExpJobTitleRepository } from '@features/201-files/domain/repositories/workexp-jobtitle.repository';
import { WorkExp } from '@features/201-files/domain/models/workexp.model';
import { WorkExpCompany } from '@features/201-files/domain/models/workexp-company.model';
import { WorkExpJobTitle } from '@features/201-files/domain/models/workexp-jobtitle.model';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { UpdateWorkExpCommand } from '@features/201-files/application/commands/workexp/update-workexp.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@features/shared/exceptions/shared';

describe('UpdateWorkexpUseCase', () => {
  let useCase: UpdateWorkExpUseCase;
  let workExpRepository: jest.Mocked<WorkExpRepository>;
  let workexpCompanyRepository: jest.Mocked<WorkexpCompanyRepository>;
  let workexpJobTitleRepository: jest.Mocked<WorkExpJobTitleRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockWorkExpId = 1;
  const mockExistingWorkExp = new WorkExp({
    id: mockWorkExpId,
    employeeId: 1,
    desc1: 'Software Engineer at Tech Corp',
    companyId: 1,
    workexpJobTitleId: 1,
    years: '2020-2023',
    isActive: true,
  });

  const mockUpdatedWorkExp = new WorkExp({
    id: mockWorkExpId,
    employeeId: 1,
    desc1: 'Senior Software Engineer at New Tech Corp',
    companyId: 2,
    workexpJobTitleId: 2,
    years: '2020-2024',
    isActive: true,
  });

  const mockCompany = new WorkExpCompany({
    id: 2,
    desc1: 'New Tech Corp',
    isActive: true,
  });

  const mockJobTitle = new WorkExpJobTitle({
    id: 2,
    desc1: 'Senior Software Engineer',
    isActive: true,
  });

  const mockUpdateCommand: UpdateWorkExpCommand = {
    employeeId: 1,
    jobTitle: 'Senior Software Engineer',
    company: 'New Tech Corp',
    years: '2020-2024',
  };

  const mockUserId = 'user-123';
  const mockRequestInfo = {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    sessionId: 'session-123',
    username: 'testuser',
  };

  beforeEach(async () => {
    const mockWorkExpRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const mockWorkexpCompanyRepository = {
      findByDescription: jest.fn(),
    };

    const mockWorkexpJobTitleRepository = {
      findByDescription: jest.fn(),
    };

    const mockActivityLogRepository = {
      create: jest.fn(),
    };

    const mockTransactionHelper = {
      executeTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateWorkExpUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.WORKEXP,
          useValue: mockWorkExpRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.WORKEXPCOMPANY,
          useValue: mockWorkexpCompanyRepository,
        },
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.WORKEXPJOBTITLE,
          useValue: mockWorkexpJobTitleRepository,
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

    useCase = module.get<UpdateWorkExpUseCase>(UpdateWorkExpUseCase);
    workExpRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.WORKEXP);
    workexpCompanyRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.WORKEXPCOMPANY,
    );
    workexpJobTitleRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.WORKEXPJOBTITLE,
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
    it('should successfully update a work experience and log the activity', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpCompanyRepository.findByDescription.mockResolvedValue(mockCompany);
      workexpJobTitleRepository.findByDescription.mockResolvedValue(
        mockJobTitle,
      );
      workExpRepository.findById
        .mockResolvedValueOnce(mockExistingWorkExp) // First call for validation
        .mockResolvedValueOnce(mockUpdatedWorkExp); // Second call after update
      workExpRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpId,
        mockUpdateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.UPDATE_WORKEXP,
        expect.any(Function),
      );
      expect(workexpCompanyRepository.findByDescription).toHaveBeenCalledWith(
        mockUpdateCommand.company,
        mockManager,
      );
      expect(workexpJobTitleRepository.findByDescription).toHaveBeenCalledWith(
        mockUpdateCommand.jobTitle,
        mockManager,
      );
      expect(workExpRepository.findById).toHaveBeenCalledWith(
        mockWorkExpId,
        mockManager,
      );
      expect(workExpRepository.update).toHaveBeenCalledWith(
        mockWorkExpId,
        expect.objectContaining({
          ...mockExistingWorkExp,
          companyId: mockCompany.id,
          workexpJobTitleId: mockJobTitle.id,
          years: mockUpdateCommand.years,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_WORKEXP,
          entity: CONSTANTS_DATABASE_MODELS.WORKEXP,
          userId: mockUserId,
          details: JSON.stringify({
            oldData: {
              id: mockExistingWorkExp.id,
              desc1: mockExistingWorkExp.desc1,
              employeeId: mockExistingWorkExp.employeeId,
              companyId: mockExistingWorkExp.companyId,
              workexpJobTitleId: mockExistingWorkExp.workexpJobTitleId,
              years: mockExistingWorkExp.years,
              isActive: mockExistingWorkExp.isActive,
            },
            newData: {
              id: mockUpdatedWorkExp.id,
              desc1: mockUpdatedWorkExp.desc1,
              employeeId: mockUpdatedWorkExp.employeeId,
              companyId: mockUpdatedWorkExp.companyId,
              workexpJobTitleId: mockUpdatedWorkExp.workexpJobTitleId,
              years: mockUpdatedWorkExp.years,
              isActive: mockUpdatedWorkExp.isActive,
            },
          }),
          description: `Updated workexp: ${mockUpdatedWorkExp.desc1}`,
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
      expect(result).toEqual(mockUpdatedWorkExp);
    });

    it('should throw NotFoundException when company does not exist', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpCompanyRepository.findByDescription.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockWorkExpId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(workexpCompanyRepository.findByDescription).toHaveBeenCalledWith(
        mockUpdateCommand.company,
        mockManager,
      );
      expect(
        workexpJobTitleRepository.findByDescription,
      ).not.toHaveBeenCalled();
      expect(workExpRepository.findById).not.toHaveBeenCalled();
      expect(workExpRepository.update).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.UPDATE_WORKEXP,
          entity: CONSTANTS_DATABASE_MODELS.WORKEXP,
          userId: mockUserId,
          details: JSON.stringify({
            id: mockWorkExpId,
            dto: mockUpdateCommand,
          }),
          description: `Failed to update workexp with ID: ${mockWorkExpId}`,
          isSuccess: false,
          errorMessage: 'Company not found',
          statusCode: 500,
          createdBy: mockUserId,
        }),
        mockManager,
      );
    });

    it('should throw NotFoundException when job title does not exist', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpCompanyRepository.findByDescription.mockResolvedValue(mockCompany);
      workexpJobTitleRepository.findByDescription.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockWorkExpId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(workexpCompanyRepository.findByDescription).toHaveBeenCalledWith(
        mockUpdateCommand.company,
        mockManager,
      );
      expect(workexpJobTitleRepository.findByDescription).toHaveBeenCalledWith(
        mockUpdateCommand.jobTitle,
        mockManager,
      );
      expect(workExpRepository.findById).not.toHaveBeenCalled();
      expect(workExpRepository.update).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Job title not found',
        }),
        mockManager,
      );
    });

    it('should throw NotFoundException when work experience does not exist', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpCompanyRepository.findByDescription.mockResolvedValue(mockCompany);
      workexpJobTitleRepository.findByDescription.mockResolvedValue(
        mockJobTitle,
      );
      workExpRepository.findById.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockWorkExpId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(workexpCompanyRepository.findByDescription).toHaveBeenCalledWith(
        mockUpdateCommand.company,
        mockManager,
      );
      expect(workexpJobTitleRepository.findByDescription).toHaveBeenCalledWith(
        mockUpdateCommand.jobTitle,
        mockManager,
      );
      expect(workExpRepository.findById).toHaveBeenCalledWith(
        mockWorkExpId,
        mockManager,
      );
      expect(workExpRepository.update).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'WorkExperience not found',
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
      workexpCompanyRepository.findByDescription.mockResolvedValue(mockCompany);
      workexpJobTitleRepository.findByDescription.mockResolvedValue(
        mockJobTitle,
      );
      workExpRepository.findById.mockResolvedValue(mockExistingWorkExp);
      workExpRepository.update.mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockWorkExpId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(SomethinWentWrongException);

      expect(workexpCompanyRepository.findByDescription).toHaveBeenCalledWith(
        mockUpdateCommand.company,
        mockManager,
      );
      expect(workexpJobTitleRepository.findByDescription).toHaveBeenCalledWith(
        mockUpdateCommand.jobTitle,
        mockManager,
      );
      expect(workExpRepository.findById).toHaveBeenCalledWith(
        mockWorkExpId,
        mockManager,
      );
      expect(workExpRepository.update).toHaveBeenCalledWith(
        mockWorkExpId,
        expect.objectContaining({
          ...mockExistingWorkExp,
          companyId: mockCompany.id,
          workexpJobTitleId: mockJobTitle.id,
          years: mockUpdateCommand.years,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Workexp update failed',
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
      workexpCompanyRepository.findByDescription.mockResolvedValue(mockCompany);
      workexpJobTitleRepository.findByDescription.mockResolvedValue(
        mockJobTitle,
      );
      workExpRepository.findById.mockResolvedValue(mockExistingWorkExp);
      workExpRepository.update.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockWorkExpId,
          mockUpdateCommand,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow('Database connection failed');

      expect(workexpCompanyRepository.findByDescription).toHaveBeenCalledWith(
        mockUpdateCommand.company,
        mockManager,
      );
      expect(workexpJobTitleRepository.findByDescription).toHaveBeenCalledWith(
        mockUpdateCommand.jobTitle,
        mockManager,
      );
      expect(workExpRepository.findById).toHaveBeenCalledWith(
        mockWorkExpId,
        mockManager,
      );
      expect(workExpRepository.update).toHaveBeenCalledWith(
        mockWorkExpId,
        expect.objectContaining({
          ...mockExistingWorkExp,
          companyId: mockCompany.id,
          workexpJobTitleId: mockJobTitle.id,
          years: mockUpdateCommand.years,
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
      workexpCompanyRepository.findByDescription.mockResolvedValue(mockCompany);
      workexpJobTitleRepository.findByDescription.mockResolvedValue(
        mockJobTitle,
      );
      workExpRepository.findById
        .mockResolvedValueOnce(mockExistingWorkExp)
        .mockResolvedValueOnce(mockUpdatedWorkExp);
      workExpRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpId,
        mockUpdateCommand,
        mockUserId,
      );

      // Assert
      expect(workexpCompanyRepository.findByDescription).toHaveBeenCalledWith(
        mockUpdateCommand.company,
        mockManager,
      );
      expect(workexpJobTitleRepository.findByDescription).toHaveBeenCalledWith(
        mockUpdateCommand.jobTitle,
        mockManager,
      );
      expect(workExpRepository.findById).toHaveBeenCalledWith(
        mockWorkExpId,
        mockManager,
      );
      expect(workExpRepository.update).toHaveBeenCalledWith(
        mockWorkExpId,
        expect.objectContaining({
          ...mockExistingWorkExp,
          companyId: mockCompany.id,
          workexpJobTitleId: mockJobTitle.id,
          years: mockUpdateCommand.years,
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
      expect(result).toEqual(mockUpdatedWorkExp);
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpCompanyRepository.findByDescription.mockResolvedValue(mockCompany);
      workexpJobTitleRepository.findByDescription.mockResolvedValue(
        mockJobTitle,
      );
      workExpRepository.findById.mockResolvedValue(mockExistingWorkExp);
      workExpRepository.update.mockRejectedValue('Unknown error');
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockWorkExpId,
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

    it('should handle optional job title', async () => {
      // Arrange
      const commandWithoutJobTitle: UpdateWorkExpCommand = {
        employeeId: 1,
        company: 'New Tech Corp',
        years: '2020-2024',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpCompanyRepository.findByDescription.mockResolvedValue(mockCompany);
      workexpJobTitleRepository.findByDescription.mockResolvedValue(null);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(
          mockWorkExpId,
          commandWithoutJobTitle,
          mockUserId,
          mockRequestInfo,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(workexpCompanyRepository.findByDescription).toHaveBeenCalledWith(
        commandWithoutJobTitle.company,
        mockManager,
      );
      expect(workexpJobTitleRepository.findByDescription).toHaveBeenCalledWith(
        undefined,
        mockManager,
      );
    });

    it('should handle optional years', async () => {
      // Arrange
      const commandWithoutYears: UpdateWorkExpCommand = {
        employeeId: 1,
        jobTitle: 'Senior Software Engineer',
        company: 'New Tech Corp',
      };
      const mockManager = {};
      transactionHelper.executeTransaction.mockImplementation(
        async (action, callback) => {
          return callback(mockManager);
        },
      );
      workexpCompanyRepository.findByDescription.mockResolvedValue(mockCompany);
      workexpJobTitleRepository.findByDescription.mockResolvedValue(
        mockJobTitle,
      );
      workExpRepository.findById
        .mockResolvedValueOnce(mockExistingWorkExp)
        .mockResolvedValueOnce(mockUpdatedWorkExp);
      workExpRepository.update.mockResolvedValue(true);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockWorkExpId,
        commandWithoutYears,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(workExpRepository.update).toHaveBeenCalledWith(
        mockWorkExpId,
        expect.objectContaining({
          ...mockExistingWorkExp,
          companyId: mockCompany.id,
          workexpJobTitleId: mockJobTitle.id,
          years: undefined,
        }),
        mockManager,
      );
      expect(result).toEqual(mockUpdatedWorkExp);
    });
  });
});
