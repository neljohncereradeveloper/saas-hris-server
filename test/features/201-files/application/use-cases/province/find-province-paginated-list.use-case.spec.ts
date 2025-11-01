import { Test, TestingModule } from '@nestjs/testing';
import { FindProvincePaginatedListUseCase } from '@features/201-files/application/use-cases/province/find-province-paginated-list.use-case';
import { ProvinceRepository } from '@features/201-files/domain/repositories/province.repository';
import { Province } from '@features/201-files/domain/models/province.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('FindProvincePaginatedListUseCase', () => {
  let useCase: FindProvincePaginatedListUseCase;
  let provinceRepository: jest.Mocked<ProvinceRepository>;

  const mockProvinceRecords = [
    new Province({
      id: 1,
      desc1: 'Metro Manila',
      isActive: true,
    }),
    new Province({
      id: 2,
      desc1: 'Cavite',
      isActive: true,
    }),
    new Province({
      id: 3,
      desc1: 'Laguna',
      isActive: false,
    }),
  ];

  const mockPaginatedResult = {
    data: mockProvinceRecords,
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
    const mockProvinceRepository = {
      findPaginatedList: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindProvincePaginatedListUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.PROVINCE,
          useValue: mockProvinceRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindProvincePaginatedListUseCase>(
      FindProvincePaginatedListUseCase,
    );
    provinceRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.PROVINCE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return paginated province list', async () => {
      // Arrange
      const term = 'manila';
      const page = 1;
      const limit = 10;
      provinceRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(provinceRepository.findPaginatedList).toHaveBeenCalledWith(
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
      provinceRepository.findPaginatedList.mockResolvedValue(emptyResult);

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(provinceRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(emptyResult);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const term = 'manila';
      const page = 1;
      const limit = 10;
      const mockError = new Error('Database connection failed');
      provinceRepository.findPaginatedList.mockRejectedValue(mockError);

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
        data: mockProvinceRecords.slice(0, 2),
        meta: {
          page: 2,
          limit: 5,
          totalRecords: 12,
          totalPages: 3,
          nextPage: 3,
          previousPage: 1,
        },
      };
      provinceRepository.findPaginatedList.mockResolvedValue(multiPageResult);

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(provinceRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(multiPageResult);
    });

    it('should handle zero page number', async () => {
      // Arrange
      const term = 'manila';
      const page = 0;
      const limit = 10;
      provinceRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(provinceRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle large limit values', async () => {
      // Arrange
      const term = 'manila';
      const page = 1;
      const limit = 1000;
      provinceRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(provinceRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle special characters in search term', async () => {
      // Arrange
      const term = 'nueva-ecija@123';
      const page = 1;
      const limit = 10;
      provinceRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(provinceRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });
  });
});
