import { Test, TestingModule } from '@nestjs/testing';
import { FindTrainingCertPaginatedListUseCase } from '@features/201-files/application/use-cases/training-cert/find-trainingcert-paginated-list.use-case';
import { TrainingCertRepository } from '@features/201-files/domain/repositories/training-cert.repository';
import { TrainingCert } from '@features/201-files/domain/models/training-cert.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('FindTrainingcertPaginatedListUseCase', () => {
  let useCase: FindTrainingCertPaginatedListUseCase;
  let trainingcertRepository: jest.Mocked<TrainingCertRepository>;

  const mockTrainingcertRecords = [
    new TrainingCert({
      id: 1,
      desc1: 'AWS Cloud Practitioner',
      isActive: true,
    }),
    new TrainingCert({
      id: 2,
      desc1: 'AWS Solutions Architect',
      isActive: true,
    }),
    new TrainingCert({
      id: 3,
      desc1: 'Docker Fundamentals',
      isActive: true,
    }),
  ];

  const mockPaginatedResult = {
    data: mockTrainingcertRecords,
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
    const mockTrainingcertRepository = {
      findPaginatedList: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindTrainingCertPaginatedListUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.TRAININGCERT,
          useValue: mockTrainingcertRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindTrainingCertPaginatedListUseCase>(
      FindTrainingCertPaginatedListUseCase,
    );
    trainingcertRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.TRAININGCERT,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return paginated training certificate list', async () => {
      // Arrange
      const term = 'aws';
      const page = 1;
      const limit = 10;
      trainingcertRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(trainingcertRepository.findPaginatedList).toHaveBeenCalledWith(
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
      trainingcertRepository.findPaginatedList.mockResolvedValue(emptyResult);

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(trainingcertRepository.findPaginatedList).toHaveBeenCalledWith(
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
      const term = 'aws';
      const page = 1;
      const limit = 10;
      const mockError = new Error('Database connection failed');
      trainingcertRepository.findPaginatedList.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute(term, page, limit)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle different page numbers', async () => {
      // Arrange
      const term = 'aws';
      const page = 2;
      const limit = 5;
      const page2Result = {
        data: mockTrainingcertRecords.slice(0, 2),
        meta: {
          page: 2,
          limit: 5,
          totalRecords: 7,
          totalPages: 2,
          nextPage: null,
          previousPage: 1,
        },
      };
      trainingcertRepository.findPaginatedList.mockResolvedValue(page2Result);

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(trainingcertRepository.findPaginatedList).toHaveBeenCalledWith(
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
      const term = 'aws';
      const page = 1;
      const limit = 25;
      const largeLimitResult = {
        data: mockTrainingcertRecords,
        meta: {
          page: 1,
          limit: 25,
          totalRecords: 3,
          totalPages: 1,
          nextPage: null,
          previousPage: null,
        },
      };
      trainingcertRepository.findPaginatedList.mockResolvedValue(
        largeLimitResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(trainingcertRepository.findPaginatedList).toHaveBeenCalledWith(
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
      trainingcertRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(trainingcertRepository.findPaginatedList).toHaveBeenCalledWith(
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
      trainingcertRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(trainingcertRepository.findPaginatedList).toHaveBeenCalledWith(
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
      trainingcertRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(trainingcertRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle zero page number', async () => {
      // Arrange
      const term = 'aws';
      const page = 0;
      const limit = 10;
      trainingcertRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(trainingcertRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle zero limit', async () => {
      // Arrange
      const term = 'aws';
      const page = 1;
      const limit = 0;
      trainingcertRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(trainingcertRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle negative page number', async () => {
      // Arrange
      const term = 'aws';
      const page = -1;
      const limit = 10;
      trainingcertRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(trainingcertRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle negative limit', async () => {
      // Arrange
      const term = 'aws';
      const page = 1;
      const limit = -5;
      trainingcertRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(trainingcertRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle large page numbers', async () => {
      // Arrange
      const term = 'aws';
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
      trainingcertRepository.findPaginatedList.mockResolvedValue(
        largePageResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(trainingcertRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result.meta.page).toBe(999999);
    });

    it('should handle large limit values', async () => {
      // Arrange
      const term = 'aws';
      const page = 1;
      const limit = 999999;
      trainingcertRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(trainingcertRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle special characters in search term', async () => {
      // Arrange
      const term = 'aws@#$%^&*()';
      const page = 1;
      const limit = 10;
      trainingcertRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(trainingcertRepository.findPaginatedList).toHaveBeenCalledWith(
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
      trainingcertRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(trainingcertRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });
  });
});
