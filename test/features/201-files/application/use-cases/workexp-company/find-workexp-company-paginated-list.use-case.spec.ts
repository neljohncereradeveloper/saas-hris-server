import { Test, TestingModule } from '@nestjs/testing';
import { FindWorkExpCompanyPaginatedListUseCase } from '@features/201-files/application/use-cases/workexp-company/find-workexp-company-paginated-list.use-case';
import { WorkexpCompanyRepository } from '@features/201-files/domain/repositories/workexp-company.repository';
import { WorkExpCompany } from '@features/201-files/domain/models/workexp-company.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('FindWorkexpcompanyPaginatedListUseCase', () => {
  let useCase: FindWorkExpCompanyPaginatedListUseCase;
  let workexpcompanyRepository: jest.Mocked<WorkexpCompanyRepository>;

  const mockWorkexpcompanyRecords = [
    new WorkExpCompany({
      id: 1,
      desc1: 'Tech Corp',
      isActive: true,
    }),
    new WorkExpCompany({
      id: 2,
      desc1: 'Startup Inc',
      isActive: true,
    }),
    new WorkExpCompany({
      id: 3,
      desc1: 'Global Solutions',
      isActive: true,
    }),
  ];

  const mockPaginatedResult = {
    data: mockWorkexpcompanyRecords,
    meta: {
      page: 1,
      limit: 10,
      totalRecords: 3,
      totalPages: 1,
      nextPage: null,
      previousPage: null,
    },
  };

  beforeEach(async () => {
    const mockWorkexpcompanyRepository = {
      findPaginatedList: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindWorkExpCompanyPaginatedListUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.WORKEXPCOMPANY,
          useValue: mockWorkexpcompanyRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindWorkExpCompanyPaginatedListUseCase>(
      FindWorkExpCompanyPaginatedListUseCase,
    );
    workexpcompanyRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.WORKEXPCOMPANY,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return paginated work experience company list', async () => {
      // Arrange
      const term = 'tech';
      const page = 1;
      const limit = 10;
      workexpcompanyRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpcompanyRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle empty search results', async () => {
      // Arrange
      const term = 'nonexistent';
      const page = 1;
      const limit = 10;
      const emptyResult = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          totalRecords: 0,
          totalPages: 0,
          nextPage: null,
          previousPage: null,
        },
      };
      workexpcompanyRepository.findPaginatedList.mockResolvedValue(emptyResult);

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpcompanyRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(emptyResult);
      expect(result.data).toHaveLength(0);
      expect(result.meta.totalRecords).toBe(0);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const term = 'tech';
      const page = 1;
      const limit = 10;
      const mockError = new Error('Database connection failed');
      workexpcompanyRepository.findPaginatedList.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute(term, page, limit)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle different page numbers', async () => {
      // Arrange
      const term = 'tech';
      const page = 2;
      const limit = 5;
      const page2Result = {
        data: mockWorkexpcompanyRecords.slice(0, 2),
        meta: {
          page: 2,
          limit: 5,
          totalRecords: 7,
          totalPages: 2,
          nextPage: null,
          previousPage: 1,
        },
      };
      workexpcompanyRepository.findPaginatedList.mockResolvedValue(page2Result);

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpcompanyRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result.meta.page).toBe(2);
      expect(result.meta.previousPage).toBe(1);
      expect(result.meta.nextPage).toBeNull();
    });

    it('should handle different limit values', async () => {
      // Arrange
      const term = 'tech';
      const page = 1;
      const limit = 25;
      const largeLimitResult = {
        data: mockWorkexpcompanyRecords,
        meta: {
          page: 1,
          limit: 25,
          totalRecords: 3,
          totalPages: 1,
          nextPage: null,
          previousPage: null,
        },
      };
      workexpcompanyRepository.findPaginatedList.mockResolvedValue(
        largeLimitResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpcompanyRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result.meta.limit).toBe(25);
    });

    it('should handle empty search term', async () => {
      // Arrange
      const term = '';
      const page = 1;
      const limit = 10;
      workexpcompanyRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpcompanyRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle null search term', async () => {
      // Arrange
      const term = null as any;
      const page = 1;
      const limit = 10;
      workexpcompanyRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpcompanyRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle undefined search term', async () => {
      // Arrange
      const term = undefined as any;
      const page = 1;
      const limit = 10;
      workexpcompanyRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpcompanyRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle zero page number', async () => {
      // Arrange
      const term = 'tech';
      const page = 0;
      const limit = 10;
      workexpcompanyRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpcompanyRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle zero limit', async () => {
      // Arrange
      const term = 'tech';
      const page = 1;
      const limit = 0;
      workexpcompanyRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpcompanyRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle negative page number', async () => {
      // Arrange
      const term = 'tech';
      const page = -1;
      const limit = 10;
      workexpcompanyRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpcompanyRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle negative limit', async () => {
      // Arrange
      const term = 'tech';
      const page = 1;
      const limit = -5;
      workexpcompanyRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpcompanyRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle large page numbers', async () => {
      // Arrange
      const term = 'tech';
      const page = 999999;
      const limit = 10;
      const largePageResult = {
        data: [],
        meta: {
          page: 999999,
          limit: 10,
          totalRecords: 0,
          totalPages: 0,
          nextPage: null,
          previousPage: null,
        },
      };
      workexpcompanyRepository.findPaginatedList.mockResolvedValue(
        largePageResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpcompanyRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result.meta.page).toBe(999999);
    });

    it('should handle large limit values', async () => {
      // Arrange
      const term = 'tech';
      const page = 1;
      const limit = 999999;
      workexpcompanyRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpcompanyRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle special characters in search term', async () => {
      // Arrange
      const term = 'tech@#$%^&*()';
      const page = 1;
      const limit = 10;
      workexpcompanyRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpcompanyRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle very long search terms', async () => {
      // Arrange
      const term = 'A'.repeat(1000);
      const page = 1;
      const limit = 10;
      workexpcompanyRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpcompanyRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle company names with special characters in results', async () => {
      // Arrange
      const term = 'tech';
      const page = 1;
      const limit = 10;
      const specialCharResult = {
        data: [
          new WorkExpCompany({
            id: 1,
            desc1: 'Tech Corp®',
            isActive: true,
          }),
          new WorkExpCompany({
            id: 2,
            desc1: '3M Company',
            isActive: true,
          }),
        ],
        meta: {
          page: 1,
          limit: 10,
          totalRecords: 2,
          totalPages: 1,
          nextPage: null,
          previousPage: null,
        },
      };
      workexpcompanyRepository.findPaginatedList.mockResolvedValue(
        specialCharResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpcompanyRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(specialCharResult);
      expect(result.data[0].desc1).toBe('Tech Corp®');
      expect(result.data[1].desc1).toBe('3M Company');
    });
  });
});
