import { Test, TestingModule } from '@nestjs/testing';
import { FindWorkExpJobTitlePaginatedListUseCase } from '@features/201-files/application/use-cases/workexp-jobtitle/find-workexp-jobtitle-paginated-list.use-case';
import { WorkExpJobTitleRepository } from '@features/201-files/domain/repositories/workexp-jobtitle.repository';
import { WorkExpJobTitle } from '@features/201-files/domain/models/workexp-jobtitle.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('FindWorkexpjobtitlePaginatedListUseCase', () => {
  let useCase: FindWorkExpJobTitlePaginatedListUseCase;
  let workexpjobtitleRepository: jest.Mocked<WorkExpJobTitleRepository>;

  const mockWorkexpjobtitleRecords = [
    new WorkExpJobTitle({
      id: 1,
      desc1: 'Software Engineer',
      isActive: true,
    }),
    new WorkExpJobTitle({
      id: 2,
      desc1: 'Senior Developer',
      isActive: true,
    }),
    new WorkExpJobTitle({
      id: 3,
      desc1: 'Project Manager',
      isActive: true,
    }),
  ];

  const mockPaginatedResult = {
    data: mockWorkexpjobtitleRecords,
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
    const mockWorkexpjobtitleRepository = {
      findPaginatedList: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindWorkExpJobTitlePaginatedListUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.WORKEXPJOBTITLE,
          useValue: mockWorkexpjobtitleRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindWorkExpJobTitlePaginatedListUseCase>(
      FindWorkExpJobTitlePaginatedListUseCase,
    );
    workexpjobtitleRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.WORKEXPJOBTITLE,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return paginated work experience job title list', async () => {
      // Arrange
      const term = 'engineer';
      const page = 1;
      const limit = 10;
      workexpjobtitleRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpjobtitleRepository.findPaginatedList).toHaveBeenCalledWith(
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
      workexpjobtitleRepository.findPaginatedList.mockResolvedValue(
        emptyResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpjobtitleRepository.findPaginatedList).toHaveBeenCalledWith(
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
      const term = 'engineer';
      const page = 1;
      const limit = 10;
      const mockError = new Error('Database connection failed');
      workexpjobtitleRepository.findPaginatedList.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute(term, page, limit)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle different page numbers', async () => {
      // Arrange
      const term = 'engineer';
      const page = 2;
      const limit = 5;
      const page2Result = {
        data: mockWorkexpjobtitleRecords.slice(0, 2),
        meta: {
          page: 2,
          limit: 5,
          totalRecords: 7,
          totalPages: 2,
          nextPage: null,
          previousPage: 1,
        },
      };
      workexpjobtitleRepository.findPaginatedList.mockResolvedValue(
        page2Result,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpjobtitleRepository.findPaginatedList).toHaveBeenCalledWith(
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
      const term = 'engineer';
      const page = 1;
      const limit = 25;
      const largeLimitResult = {
        data: mockWorkexpjobtitleRecords,
        meta: {
          page: 1,
          limit: 25,
          totalRecords: 3,
          totalPages: 1,
          nextPage: null,
          previousPage: null,
        },
      };
      workexpjobtitleRepository.findPaginatedList.mockResolvedValue(
        largeLimitResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpjobtitleRepository.findPaginatedList).toHaveBeenCalledWith(
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
      workexpjobtitleRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpjobtitleRepository.findPaginatedList).toHaveBeenCalledWith(
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
      workexpjobtitleRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpjobtitleRepository.findPaginatedList).toHaveBeenCalledWith(
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
      workexpjobtitleRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpjobtitleRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle zero page number', async () => {
      // Arrange
      const term = 'engineer';
      const page = 0;
      const limit = 10;
      workexpjobtitleRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpjobtitleRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle zero limit', async () => {
      // Arrange
      const term = 'engineer';
      const page = 1;
      const limit = 0;
      workexpjobtitleRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpjobtitleRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle negative page number', async () => {
      // Arrange
      const term = 'engineer';
      const page = -1;
      const limit = 10;
      workexpjobtitleRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpjobtitleRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle negative limit', async () => {
      // Arrange
      const term = 'engineer';
      const page = 1;
      const limit = -5;
      workexpjobtitleRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpjobtitleRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle large page numbers', async () => {
      // Arrange
      const term = 'engineer';
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
      workexpjobtitleRepository.findPaginatedList.mockResolvedValue(
        largePageResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpjobtitleRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result.meta.page).toBe(999999);
    });

    it('should handle large limit values', async () => {
      // Arrange
      const term = 'engineer';
      const page = 1;
      const limit = 999999;
      workexpjobtitleRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpjobtitleRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle special characters in search term', async () => {
      // Arrange
      const term = 'engineer@#$%^&*()';
      const page = 1;
      const limit = 10;
      workexpjobtitleRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpjobtitleRepository.findPaginatedList).toHaveBeenCalledWith(
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
      workexpjobtitleRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpjobtitleRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle job titles with special characters in results', async () => {
      // Arrange
      const term = 'engineer';
      const page = 1;
      const limit = 10;
      const specialCharResult = {
        data: [
          new WorkExpJobTitle({
            id: 1,
            desc1: 'C++ Engineer',
            isActive: true,
          }),
          new WorkExpJobTitle({
            id: 2,
            desc1: 'C# .NET Developer',
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
      workexpjobtitleRepository.findPaginatedList.mockResolvedValue(
        specialCharResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpjobtitleRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(specialCharResult);
      expect(result.data[0].desc1).toBe('C++ Engineer');
      expect(result.data[1].desc1).toBe('C# .NET Developer');
    });

    it('should handle job titles with roman numerals in results', async () => {
      // Arrange
      const term = 'engineer';
      const page = 1;
      const limit = 10;
      const romanNumeralResult = {
        data: [
          new WorkExpJobTitle({
            id: 1,
            desc1: 'Software Engineer II',
            isActive: true,
          }),
          new WorkExpJobTitle({
            id: 2,
            desc1: 'Senior Engineer III',
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
      workexpjobtitleRepository.findPaginatedList.mockResolvedValue(
        romanNumeralResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(workexpjobtitleRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(romanNumeralResult);
      expect(result.data[0].desc1).toBe('Software Engineer II');
      expect(result.data[1].desc1).toBe('Senior Engineer III');
    });
  });
});
