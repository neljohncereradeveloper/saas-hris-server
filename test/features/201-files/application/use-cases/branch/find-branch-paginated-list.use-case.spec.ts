import { Test, TestingModule } from '@nestjs/testing';
import { FindBranchPaginatedListUseCase } from '@features/201-files/application/use-cases/branch/find-branch-paginated-list.use-case';
import { BranchRepository } from '@features/201-files/domain/repositories/branch.repository';
import { Branch } from '@features/201-files/domain/models/branch.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('FindBranchPaginatedListUseCase', () => {
  let useCase: FindBranchPaginatedListUseCase;
  let branchRepository: jest.Mocked<BranchRepository>;

  const mockBranches = [
    new Branch({
      id: 1,
      desc1: 'Branch A',
      brCode: 'BR001',
      isActive: true,
    }),
    new Branch({
      id: 2,
      desc1: 'Branch B',
      brCode: 'BR002',
      isActive: true,
    }),
    new Branch({
      id: 3,
      desc1: 'Branch C',
      brCode: 'BR003',
      isActive: false,
    }),
  ];

  const mockPaginatedResult = {
    data: mockBranches,
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
    const mockBranchRepository = {
      findPaginatedList: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindBranchPaginatedListUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.BRANCH,
          useValue: mockBranchRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindBranchPaginatedListUseCase>(
      FindBranchPaginatedListUseCase,
    );
    branchRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.BRANCH);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return paginated list of branches', async () => {
      // Arrange
      const term = 'test';
      const page = 1;
      const limit = 10;
      branchRepository.findPaginatedList.mockResolvedValue(mockPaginatedResult);

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(branchRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
      expect(result.data).toHaveLength(3);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        totalRecords: 3,
        totalPages: 1,
        nextPage: null,
        previousPage: null,
      });
    });

    it('should handle empty search term', async () => {
      // Arrange
      const term = '';
      const page = 1;
      const limit = 10;
      branchRepository.findPaginatedList.mockResolvedValue(mockPaginatedResult);

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(branchRepository.findPaginatedList).toHaveBeenCalledWith(
        '',
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle different page and limit values', async () => {
      // Arrange
      const term = 'branch';
      const page = 2;
      const limit = 5;
      const customResult = {
        data: mockBranches.slice(0, 2),
        meta: {
          page: 2,
          limit: 5,
          totalRecords: 7,
          totalPages: 2,
          nextPage: null,
          previousPage: 1,
        },
      };
      branchRepository.findPaginatedList.mockResolvedValue(customResult);

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(branchRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(customResult);
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(5);
      expect(result.meta.previousPage).toBe(1);
      expect(result.meta.nextPage).toBeNull();
    });

    it('should handle empty results', async () => {
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
      branchRepository.findPaginatedList.mockResolvedValue(emptyResult);

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(branchRepository.findPaginatedList).toHaveBeenCalledWith(
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
      const term = 'test';
      const page = 1;
      const limit = 10;
      const mockError = new Error('Database connection failed');
      branchRepository.findPaginatedList.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute(term, page, limit)).rejects.toThrow(
        'Database connection failed',
      );
      expect(branchRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
    });

    it('should handle large page numbers', async () => {
      // Arrange
      const term = 'test';
      const page = 100;
      const limit = 10;
      const largePageResult = {
        data: [],
        meta: {
          page: 100,
          limit: 10,
          totalRecords: 50,
          totalPages: 5,
          nextPage: null,
          previousPage: 99,
        },
      };
      branchRepository.findPaginatedList.mockResolvedValue(largePageResult);

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(branchRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(largePageResult);
      expect(result.meta.page).toBe(100);
      expect(result.meta.previousPage).toBe(99);
      expect(result.meta.nextPage).toBeNull();
    });

    it('should handle zero limit', async () => {
      // Arrange
      const term = 'test';
      const page = 1;
      const limit = 0;
      const zeroLimitResult = {
        data: [],
        meta: {
          page: 1,
          limit: 0,
          totalRecords: 0,
          totalPages: 0,
          nextPage: null,
          previousPage: null,
        },
      };
      branchRepository.findPaginatedList.mockResolvedValue(zeroLimitResult);

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(branchRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(zeroLimitResult);
    });

    it('should handle special characters in search term', async () => {
      // Arrange
      const term = 'branch@#$%';
      const page = 1;
      const limit = 10;
      branchRepository.findPaginatedList.mockResolvedValue(mockPaginatedResult);

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(branchRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });
  });
});
