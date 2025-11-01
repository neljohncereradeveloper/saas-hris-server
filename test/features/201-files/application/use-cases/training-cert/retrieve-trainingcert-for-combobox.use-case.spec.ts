import { Test, TestingModule } from '@nestjs/testing';
import { RetrieveTrainingCertForComboboxUseCase } from '@features/201-files/application/use-cases/training-cert/retrieve-trainingcert-for-combobox.use-case';
import { TrainingCertRepository } from '@features/201-files/domain/repositories/training-cert.repository';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('RetrieveTrainingcertForComboboxUseCase', () => {
  let useCase: RetrieveTrainingCertForComboboxUseCase;
  let trainingcertRepository: jest.Mocked<TrainingCertRepository>;

  const mockTrainingcertData = [
    { desc1: 'aws cloud practitioner' },
    { desc1: 'aws solutions architect' },
    { desc1: 'docker fundamentals' },
    { desc1: 'kubernetes administration' },
    { desc1: 'terraform basics' },
  ];

  beforeEach(async () => {
    const mockTrainingcertRepository = {
      retrieveForCombobox: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetrieveTrainingCertForComboboxUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.TRAININGCERT,
          useValue: mockTrainingcertRepository,
        },
      ],
    }).compile();

    useCase = module.get<RetrieveTrainingCertForComboboxUseCase>(
      RetrieveTrainingCertForComboboxUseCase,
    );
    trainingcertRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.TRAININGCERT,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return formatted training certificate options for combobox', async () => {
      // Arrange
      trainingcertRepository.retrieveForCombobox.mockResolvedValue(
        mockTrainingcertData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(trainingcertRepository.retrieveForCombobox).toHaveBeenCalled();
      expect(result).toEqual([
        { value: 'aws cloud practitioner', label: 'Aws cloud practitioner' },
        { value: 'aws solutions architect', label: 'Aws solutions architect' },
        { value: 'docker fundamentals', label: 'Docker fundamentals' },
        {
          value: 'kubernetes administration',
          label: 'Kubernetes administration',
        },
        { value: 'terraform basics', label: 'Terraform basics' },
      ]);
    });

    it('should handle empty results', async () => {
      // Arrange
      trainingcertRepository.retrieveForCombobox.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(trainingcertRepository.retrieveForCombobox).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      trainingcertRepository.retrieveForCombobox.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should format single word descriptions correctly', async () => {
      // Arrange
      const singleWordData = [{ desc1: 'javascript' }];
      trainingcertRepository.retrieveForCombobox.mockResolvedValue(
        singleWordData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([{ value: 'javascript', label: 'Javascript' }]);
    });

    it('should format multi-word descriptions correctly', async () => {
      // Arrange
      const multiWordData = [
        { desc1: 'react native development' },
        { desc1: 'node.js backend programming' },
      ];
      trainingcertRepository.retrieveForCombobox.mockResolvedValue(
        multiWordData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        {
          value: 'react native development',
          label: 'React native development',
        },
        {
          value: 'node.js backend programming',
          label: 'Node.js backend programming',
        },
      ]);
    });

    it('should handle descriptions with special characters', async () => {
      // Arrange
      const specialCharData = [
        { desc1: 'c++ programming' },
        { desc1: 'c# .net development' },
        { desc1: 'sql server administration' },
      ];
      trainingcertRepository.retrieveForCombobox.mockResolvedValue(
        specialCharData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'c++ programming', label: 'C++ programming' },
        { value: 'c# .net development', label: 'C# .net development' },
        {
          value: 'sql server administration',
          label: 'Sql server administration',
        },
      ]);
    });

    it('should handle descriptions with numbers', async () => {
      // Arrange
      const numberData = [
        { desc1: 'python 3 programming' },
        { desc1: 'html5 css3 web development' },
      ];
      trainingcertRepository.retrieveForCombobox.mockResolvedValue(numberData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'python 3 programming', label: 'Python 3 programming' },
        {
          value: 'html5 css3 web development',
          label: 'Html5 css3 web development',
        },
      ]);
    });

    it('should handle descriptions with mixed case', async () => {
      // Arrange
      const mixedCaseData = [
        { desc1: 'AWS CLOUD PRACTITIONER' },
        { desc1: 'Docker Fundamentals' },
        { desc1: 'kubernetes ADMINISTRATION' },
      ];
      trainingcertRepository.retrieveForCombobox.mockResolvedValue(
        mixedCaseData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'AWS CLOUD PRACTITIONER', label: 'Aws cloud practitioner' },
        { value: 'Docker Fundamentals', label: 'Docker fundamentals' },
        {
          value: 'kubernetes ADMINISTRATION',
          label: 'Kubernetes administration',
        },
      ]);
    });

    it('should handle very long descriptions', async () => {
      // Arrange
      const longDescription = 'A'.repeat(1000);
      const longData = [{ desc1: longDescription }];
      trainingcertRepository.retrieveForCombobox.mockResolvedValue(longData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        {
          value: longDescription,
          label:
            longDescription.charAt(0).toUpperCase() +
            longDescription.slice(1).toLowerCase(),
        },
      ]);
    });

    it('should handle descriptions with leading/trailing spaces', async () => {
      // Arrange
      const spacedData = [
        { desc1: '  aws cloud practitioner  ' },
        { desc1: ' docker fundamentals ' },
      ];
      trainingcertRepository.retrieveForCombobox.mockResolvedValue(spacedData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        {
          value: '  aws cloud practitioner  ',
          label: '  aws cloud practitioner  ',
        },
        { value: ' docker fundamentals ', label: ' docker fundamentals ' },
      ]);
    });

    it('should handle null or undefined descriptions gracefully', async () => {
      // Arrange
      const nullData = [
        { desc1: null as any },
        { desc1: undefined as any },
        { desc1: '' },
      ];
      trainingcertRepository.retrieveForCombobox.mockResolvedValue(nullData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: null, label: '' },
        { value: undefined, label: '' },
        { value: '', label: '' },
      ]);
    });
  });
});
