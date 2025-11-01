import { Test, TestingModule } from '@nestjs/testing';
import { CreateWorkExpUseCase } from '@features/201-files/application/use-cases/workexp/create-workexp.use-case';
import { WorkExpRepository } from '@features/201-files/domain/repositories/workexp.repository';
import { WorkexpCompanyRepository } from '@features/201-files/domain/repositories/workexp-company.repository';
import { WorkExpJobTitleRepository } from '@features/201-files/domain/repositories/workexp-jobtitle.repository';
import { WorkExp } from '@features/201-files/domain/models/workexp.model';
import { WorkExpCompany } from '@features/201-files/domain/models/workexp-company.model';
import { WorkExpJobTitle } from '@features/201-files/domain/models/workexp-jobtitle.model';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { CreateWorkExpCommand } from '@features/201-files/application/commands/workexp/create-workexp.command';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { NotFoundException } from '@features/shared/exceptions/shared';

describe('CreateWorkexpUseCase', () => {
  let useCase: CreateWorkExpUseCase;
  let workExpRepository: jest.Mocked<WorkExpRepository>;
  let workexpCompanyRepository: jest.Mocked<WorkexpCompanyRepository>;
  let workexpJobTitleRepository: jest.Mocked<WorkExpJobTitleRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let transactionHelper: jest.Mocked<TransactionPort>;

  const mockCreateCommand: CreateWorkExpCommand = {
    employeeId: 1,
    jobTitle: 'Software Engineer',
    company: 'Tech Corp',
    years: '2020-2023',
  };

  const mockCompany = new WorkExpCompany({
    id: 1,
    desc1: 'Tech Corp',
    isActive: true,
  });

  const mockJobTitle = new WorkExpJobTitle({
    id: 1,
    desc1: 'Software Engineer',
    isActive: true,
  });

  const mockCreatedWorkExp = new WorkExp({
    id: 1,
    employeeId: 1,
    desc1: 'Software Engineer at Tech Corp',
    companyId: 1,
    workexpJobTitleId: 1,
    years: '2020-2023',
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
    const mockWorkExpRepository = {
      create: jest.fn(),
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
        CreateWorkExpUseCase,
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

    useCase = module.get<CreateWorkExpUseCase>(CreateWorkExpUseCase);
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
    it('should successfully create a work experience and log the activity', async () => {
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
      workExpRepository.create.mockResolvedValue(mockCreatedWorkExp);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        mockCreateCommand,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(transactionHelper.executeTransaction).toHaveBeenCalledWith(
        CONSTANTS_LOG_ACTION.CREATE_WORKEXP,
        expect.any(Function),
      );
      expect(workexpCompanyRepository.findByDescription).toHaveBeenCalledWith(
        mockCreateCommand.company,
        mockManager,
      );
      expect(workexpJobTitleRepository.findByDescription).toHaveBeenCalledWith(
        mockCreateCommand.jobTitle,
        mockManager,
      );
      expect(workExpRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeId: mockCreateCommand.employeeId,
          years: mockCreateCommand.years,
          companyId: mockCompany.id,
          workexpJobTitleId: mockJobTitle.id,
        }),
        mockManager,
      );
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_WORKEXP,
          entity: CONSTANTS_DATABASE_MODELS.WORKEXP,
          userId: mockUserId,
          details: JSON.stringify({
            workexpData: {
              id: mockCreatedWorkExp.id,
              desc1: mockCreatedWorkExp.desc1,
              employeeId: mockCreatedWorkExp.employeeId,
              companyId: mockCreatedWorkExp.companyId,
              workexpJobTitleId: mockCreatedWorkExp.workexpJobTitleId,
              years: mockCreatedWorkExp.years,
              isActive: mockCreatedWorkExp.isActive,
            },
          }),
          description: `Created new workexp: ${mockCreatedWorkExp.desc1}`,
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
      expect(result).toEqual(mockCreatedWorkExp);
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
        useCase.execute(mockCreateCommand, mockUserId, mockRequestInfo),
      ).rejects.toThrow(NotFoundException);

      expect(workexpCompanyRepository.findByDescription).toHaveBeenCalledWith(
        mockCreateCommand.company,
        mockManager,
      );
      expect(
        workexpJobTitleRepository.findByDescription,
      ).not.toHaveBeenCalled();
      expect(workExpRepository.create).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: CONSTANTS_LOG_ACTION.CREATE_WORKEXP,
          entity: CONSTANTS_DATABASE_MODELS.WORKEXP,
          userId: mockUserId,
          details: JSON.stringify({ dto: mockCreateCommand }),
          description: `Failed to create workexp: ${mockCreateCommand.employeeId}`,
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
        useCase.execute(mockCreateCommand, mockUserId, mockRequestInfo),
      ).rejects.toThrow(NotFoundException);

      expect(workexpCompanyRepository.findByDescription).toHaveBeenCalledWith(
        mockCreateCommand.company,
        mockManager,
      );
      expect(workexpJobTitleRepository.findByDescription).toHaveBeenCalledWith(
        mockCreateCommand.jobTitle,
        mockManager,
      );
      expect(workExpRepository.create).not.toHaveBeenCalled();
      expect(activityLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Jobtitle not found',
        }),
        mockManager,
      );
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
      workexpCompanyRepository.findByDescription.mockResolvedValue(mockCompany);
      workexpJobTitleRepository.findByDescription.mockResolvedValue(
        mockJobTitle,
      );
      workExpRepository.create.mockRejectedValue(mockError);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act & Assert
      await expect(
        useCase.execute(mockCreateCommand, mockUserId, mockRequestInfo),
      ).rejects.toThrow('Database connection failed');

      expect(workexpCompanyRepository.findByDescription).toHaveBeenCalledWith(
        mockCreateCommand.company,
        mockManager,
      );
      expect(workexpJobTitleRepository.findByDescription).toHaveBeenCalledWith(
        mockCreateCommand.jobTitle,
        mockManager,
      );
      expect(workExpRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeId: mockCreateCommand.employeeId,
          years: mockCreateCommand.years,
          companyId: mockCompany.id,
          workexpJobTitleId: mockJobTitle.id,
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
      workExpRepository.create.mockResolvedValue(mockCreatedWorkExp);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(mockCreateCommand, mockUserId);

      // Assert
      expect(workexpCompanyRepository.findByDescription).toHaveBeenCalledWith(
        mockCreateCommand.company,
        mockManager,
      );
      expect(workexpJobTitleRepository.findByDescription).toHaveBeenCalledWith(
        mockCreateCommand.jobTitle,
        mockManager,
      );
      expect(workExpRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeId: mockCreateCommand.employeeId,
          years: mockCreateCommand.years,
          companyId: mockCompany.id,
          workexpJobTitleId: mockJobTitle.id,
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
      expect(result).toEqual(mockCreatedWorkExp);
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
      workExpRepository.create.mockRejectedValue('Unknown error');
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

    it('should handle optional job title', async () => {
      // Arrange
      const commandWithoutJobTitle: CreateWorkExpCommand = {
        employeeId: 1,
        company: 'Tech Corp',
        years: '2020-2023',
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
        useCase.execute(commandWithoutJobTitle, mockUserId, mockRequestInfo),
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
      const commandWithoutYears: CreateWorkExpCommand = {
        employeeId: 1,
        jobTitle: 'Software Engineer',
        company: 'Tech Corp',
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
      workExpRepository.create.mockResolvedValue(mockCreatedWorkExp);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        commandWithoutYears,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(workExpRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeId: commandWithoutYears.employeeId,
          years: undefined,
          companyId: mockCompany.id,
          workexpJobTitleId: mockJobTitle.id,
        }),
        mockManager,
      );
      expect(result).toEqual(mockCreatedWorkExp);
    });

    it('should handle empty company name', async () => {
      // Arrange
      const commandWithEmptyCompany: CreateWorkExpCommand = {
        employeeId: 1,
        jobTitle: 'Software Engineer',
        company: '',
        years: '2020-2023',
      };
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
        useCase.execute(commandWithEmptyCompany, mockUserId, mockRequestInfo),
      ).rejects.toThrow(NotFoundException);

      expect(workexpCompanyRepository.findByDescription).toHaveBeenCalledWith(
        '',
        mockManager,
      );
    });

    it('should handle zero employee ID', async () => {
      // Arrange
      const commandWithZeroEmployeeId: CreateWorkExpCommand = {
        employeeId: 0,
        jobTitle: 'Software Engineer',
        company: 'Tech Corp',
        years: '2020-2023',
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
      workExpRepository.create.mockResolvedValue(mockCreatedWorkExp);
      activityLogRepository.create.mockResolvedValue({} as ActivityLog);

      // Act
      const result = await useCase.execute(
        commandWithZeroEmployeeId,
        mockUserId,
        mockRequestInfo,
      );

      // Assert
      expect(workExpRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeId: 0,
        }),
        mockManager,
      );
      expect(result).toEqual(mockCreatedWorkExp);
    });
  });
});
