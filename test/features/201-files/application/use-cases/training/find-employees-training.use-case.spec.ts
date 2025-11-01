import { Test, TestingModule } from '@nestjs/testing';
import { FindEmployeesTrainingUseCase } from '@features/201-files/application/use-cases/training/find-employees-training.use-case';
import { TrainingRepository } from '@features/201-files/domain/repositories/training.repository';
import { Training } from '@features/201-files/domain/models/training.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('FindEmployeesTrainingUseCase', () => {
  let useCase: FindEmployeesTrainingUseCase;
  let trainingRepository: jest.Mocked<TrainingRepository>;

  const mockTrainingRecords = [
    new Training({
      id: 1,
      employeeId: 1,
      trainingDate: new Date('2023-01-15'),
      trainingsCertId: 1,
      trainingTitle: 'AWS Cloud Practitioner',
      desc1: 'Cloud computing fundamentals',
      isActive: true,
    }),
    new Training({
      id: 2,
      employeeId: 1,
      trainingDate: new Date('2023-02-15'),
      trainingsCertId: 2,
      trainingTitle: 'AWS Solutions Architect',
      desc1: 'Advanced cloud architecture',
      isActive: true,
    }),
  ];

  beforeEach(async () => {
    const mockTrainingRepository = {
      findEmployeesTraining: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindEmployeesTrainingUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.TRAINING,
          useValue: mockTrainingRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindEmployeesTrainingUseCase>(
      FindEmployeesTrainingUseCase,
    );
    trainingRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.TRAINING);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return training records for a specific employee', async () => {
      // Arrange
      const employeeId = 1;
      trainingRepository.findEmployeesTraining.mockResolvedValue({
        data: mockTrainingRecords,
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(trainingRepository.findEmployeesTraining).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: mockTrainingRecords });
    });

    it('should handle empty results', async () => {
      // Arrange
      const employeeId = 999;
      trainingRepository.findEmployeesTraining.mockResolvedValue({
        data: [],
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(trainingRepository.findEmployeesTraining).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: [] });
    });

    it('should handle repository errors', async () => {
      // Arrange
      const employeeId = 1;
      const mockError = new Error('Database connection failed');
      trainingRepository.findEmployeesTraining.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute(employeeId)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle negative employee ID', async () => {
      // Arrange
      const employeeId = -1;
      trainingRepository.findEmployeesTraining.mockResolvedValue({
        data: [],
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(trainingRepository.findEmployeesTraining).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: [] });
    });

    it('should handle large employee ID', async () => {
      // Arrange
      const employeeId = 999999;
      trainingRepository.findEmployeesTraining.mockResolvedValue({
        data: [],
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(trainingRepository.findEmployeesTraining).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: [] });
    });

    it('should handle zero employee ID', async () => {
      // Arrange
      const employeeId = 0;
      trainingRepository.findEmployeesTraining.mockResolvedValue({
        data: [],
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(trainingRepository.findEmployeesTraining).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: [] });
    });

    it('should handle null employee ID', async () => {
      // Arrange
      const employeeId = null as any;
      trainingRepository.findEmployeesTraining.mockResolvedValue({
        data: [],
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(trainingRepository.findEmployeesTraining).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: [] });
    });

    it('should handle undefined employee ID', async () => {
      // Arrange
      const employeeId = undefined as any;
      trainingRepository.findEmployeesTraining.mockResolvedValue({
        data: [],
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(trainingRepository.findEmployeesTraining).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: [] });
    });

    it('should handle string employee ID', async () => {
      // Arrange
      const employeeId = '1' as any;
      trainingRepository.findEmployeesTraining.mockResolvedValue({
        data: mockTrainingRecords,
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(trainingRepository.findEmployeesTraining).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: mockTrainingRecords });
    });

    it('should handle multiple training records', async () => {
      // Arrange
      const employeeId = 1;
      const multipleTrainingRecords = [
        ...mockTrainingRecords,
        new Training({
          id: 3,
          employeeId: 1,
          trainingDate: new Date('2023-03-15'),
          trainingsCertId: 3,
          trainingTitle: 'Docker Fundamentals',
          desc1: 'Containerization basics',
          isActive: true,
        }),
      ];
      trainingRepository.findEmployeesTraining.mockResolvedValue({
        data: multipleTrainingRecords,
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(trainingRepository.findEmployeesTraining).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: multipleTrainingRecords });
      expect(result.data).toHaveLength(3);
    });
  });
});
