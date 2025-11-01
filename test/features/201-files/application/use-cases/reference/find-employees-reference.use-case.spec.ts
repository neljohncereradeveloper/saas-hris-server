import { Test, TestingModule } from '@nestjs/testing';
import { FindEmployeesReferenceUseCase } from '@features/201-files/application/use-cases/reference/find-employees-reference.use-case';
import { ReferenceRepository } from '@features/201-files/domain/repositories/reference.repository';
import { Reference } from '@features/201-files/domain/models/reference.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('FindEmployeesReferenceUseCase', () => {
  let useCase: FindEmployeesReferenceUseCase;
  let referenceRepository: jest.Mocked<ReferenceRepository>;

  const mockReferenceRecords = [
    new Reference({
      id: 1,
      employeeId: 1,
      fname: 'John',
      mname: 'Michael',
      lname: 'Doe',
      suffix: 'Jr.',
      cellphoneNumber: '+1234567890',
      isActive: true,
    }),
    new Reference({
      id: 2,
      employeeId: 1,
      fname: 'Jane',
      mname: 'Elizabeth',
      lname: 'Smith',
      suffix: '',
      cellphoneNumber: '+0987654321',
      isActive: true,
    }),
  ];

  beforeEach(async () => {
    const mockReferenceRepository = {
      findEmployeesReference: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindEmployeesReferenceUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.REFERENCE,
          useValue: mockReferenceRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindEmployeesReferenceUseCase>(
      FindEmployeesReferenceUseCase,
    );
    referenceRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.REFERENCE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return reference records for a specific employee', async () => {
      // Arrange
      const employeeId = 1;
      referenceRepository.findEmployeesReference.mockResolvedValue({
        data: mockReferenceRecords,
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(referenceRepository.findEmployeesReference).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: mockReferenceRecords });
    });

    it('should handle empty results', async () => {
      // Arrange
      const employeeId = 999;
      referenceRepository.findEmployeesReference.mockResolvedValue({
        data: [],
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(referenceRepository.findEmployeesReference).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: [] });
    });

    it('should handle repository errors', async () => {
      // Arrange
      const employeeId = 1;
      const mockError = new Error('Database connection failed');
      referenceRepository.findEmployeesReference.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute(employeeId)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle negative employee ID', async () => {
      // Arrange
      const employeeId = -1;
      referenceRepository.findEmployeesReference.mockResolvedValue({
        data: [],
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(referenceRepository.findEmployeesReference).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: [] });
    });

    it('should handle large employee ID', async () => {
      // Arrange
      const employeeId = 999999;
      referenceRepository.findEmployeesReference.mockResolvedValue({
        data: [],
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(referenceRepository.findEmployeesReference).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: [] });
    });

    it('should handle zero employee ID', async () => {
      // Arrange
      const employeeId = 0;
      referenceRepository.findEmployeesReference.mockResolvedValue({
        data: [],
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(referenceRepository.findEmployeesReference).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: [] });
    });

    it('should return single reference record', async () => {
      // Arrange
      const employeeId = 1;
      const singleReference = [mockReferenceRecords[0]];
      referenceRepository.findEmployeesReference.mockResolvedValue({
        data: singleReference,
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(referenceRepository.findEmployeesReference).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: singleReference });
      expect(result.data).toHaveLength(1);
    });

    it('should handle references with minimal data', async () => {
      // Arrange
      const employeeId = 1;
      const minimalReferences = [
        new Reference({
          id: 3,
          employeeId: 1,
          fname: 'Bob',
          lname: 'Johnson',
          isActive: true,
        }),
      ];
      referenceRepository.findEmployeesReference.mockResolvedValue({
        data: minimalReferences,
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(referenceRepository.findEmployeesReference).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: minimalReferences });
      expect(result.data[0].mname).toBeUndefined();
      expect(result.data[0].suffix).toBeUndefined();
      expect(result.data[0].cellphoneNumber).toBeUndefined();
    });
  });
});
