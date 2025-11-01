import { Test, TestingModule } from '@nestjs/testing';
import { FindJobTitlePaginatedListUseCase } from '@features/201-files/application/use-cases/jobtitle/find-jobtitle-paginated-list.use-case';
import { JobTitleRepository } from '@features/201-files/domain/repositories/jobtitle.repository';
import { JobTitle } from '@features/201-files/domain/models/jobtitle.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('FindJobtitlePaginatedListUseCase', () => {
  let useCase: FindJobTitlePaginatedListUseCase;
  let jobTitleRepository: jest.Mocked<JobTitleRepository>;

  const mockJobTitleRecords = [
    new JobTitle({
      id: 1,
      desc1: 'Software Engineer',
      isActive: true,
    }),
    new JobTitle({
      id: 2,
      desc1: 'Senior Developer',
      isActive: true,
    }),
    new JobTitle({
      id: 3,
      desc1: 'Project Manager',
      isActive: false,
    }),
  ];

  const mockPaginatedResult = {
    data: mockJobTitleRecords,
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
    const mockJobTitleRepository = {
      findPaginatedList: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindJobTitlePaginatedListUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.JOBTITLE,
          useValue: mockJobTitleRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindJobTitlePaginatedListUseCase>(
      FindJobTitlePaginatedListUseCase,
    );
    jobTitleRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.JOBTITLE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return paginated jobtitle list', async () => {
      // Arrange
      const term = 'engineer';
      const page = 1;
      const limit = 10;
      jobTitleRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(jobTitleRepository.findPaginatedList).toHaveBeenCalledWith(
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
      jobTitleRepository.findPaginatedList.mockResolvedValue(emptyResult);

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(jobTitleRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(emptyResult);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const term = 'engineer';
      const page = 1;
      const limit = 10;
      const mockError = new Error('Database connection failed');
      jobTitleRepository.findPaginatedList.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute(term, page, limit)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle pagination with multiple pages', async () => {
      // Arrange
      const term = '';
      const page = 2;
      const limit = 5;
      const multiPageResult = {
        data: mockJobTitleRecords.slice(0, 2),
        meta: {
          page: 2,
          limit: 5,
          totalRecords: 12,
          totalPages: 3,
          nextPage: 3,
          previousPage: 1,
        },
      };
      jobTitleRepository.findPaginatedList.mockResolvedValue(multiPageResult);

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(jobTitleRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(multiPageResult);
    });

    it('should handle zero page number', async () => {
      // Arrange
      const term = 'engineer';
      const page = 0;
      const limit = 10;
      jobTitleRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(jobTitleRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle large limit values', async () => {
      // Arrange
      const term = 'engineer';
      const page = 1;
      const limit = 1000;
      jobTitleRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(jobTitleRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle special characters in search term', async () => {
      // Arrange
      const term = 'full-stack@123';
      const page = 1;
      const limit = 10;
      jobTitleRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(jobTitleRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });
  });
});
