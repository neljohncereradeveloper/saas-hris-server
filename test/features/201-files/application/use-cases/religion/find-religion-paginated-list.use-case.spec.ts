import { Test, TestingModule } from '@nestjs/testing';
import { FindReligionPaginatedListUseCase } from '@features/201-files/application/use-cases/religion/find-religion-paginated-list.use-case';
import { ReligionRepository } from '@features/201-files/domain/repositories/religion.repository';
import { Religion } from '@features/201-files/domain/models/religion.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('FindReligionPaginatedListUseCase', () => {
  let useCase: FindReligionPaginatedListUseCase;
  let religionRepository: jest.Mocked<ReligionRepository>;

  const mockReligionRecords = [
    new Religion({
      id: 1,
      desc1: 'Catholic',
      isActive: true,
    }),
    new Religion({
      id: 2,
      desc1: 'Protestant',
      isActive: true,
    }),
    new Religion({
      id: 3,
      desc1: 'Islam',
      isActive: false,
    }),
  ];

  const mockPaginatedResult = {
    data: mockReligionRecords,
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
    const mockReligionRepository = {
      findPaginatedList: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindReligionPaginatedListUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.RELIGION,
          useValue: mockReligionRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindReligionPaginatedListUseCase>(
      FindReligionPaginatedListUseCase,
    );
    religionRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.RELIGION);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return paginated religion list', async () => {
      // Arrange
      const term = 'catholic';
      const page = 1;
      const limit = 10;
      religionRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(religionRepository.findPaginatedList).toHaveBeenCalledWith(
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
      religionRepository.findPaginatedList.mockResolvedValue(emptyResult);

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(religionRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(emptyResult);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const term = 'catholic';
      const page = 1;
      const limit = 10;
      const mockError = new Error('Database connection failed');
      religionRepository.findPaginatedList.mockRejectedValue(mockError);

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
        data: mockReligionRecords.slice(0, 2),
        meta: {
          page: 2,
          limit: 5,
          totalRecords: 12,
          totalPages: 3,
          nextPage: 3,
          previousPage: 1,
        },
      };
      religionRepository.findPaginatedList.mockResolvedValue(multiPageResult);

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(religionRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(multiPageResult);
    });

    it('should handle zero page number', async () => {
      // Arrange
      const term = 'catholic';
      const page = 0;
      const limit = 10;
      religionRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(religionRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle large limit values', async () => {
      // Arrange
      const term = 'catholic';
      const page = 1;
      const limit = 1000;
      religionRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(religionRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle special characters in search term', async () => {
      // Arrange
      const term = "jehovah's@123";
      const page = 1;
      const limit = 10;
      religionRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(religionRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });
  });
});
