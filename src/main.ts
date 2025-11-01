import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from '@features/shared/infrastructure/logger/winston.logger';
import { DomainExceptionFilter } from '@features/shared/infrastructure/filters/domain-exception.filter';
import { JwtExceptionFilter } from '@features/shared/infrastructure/filters/jwt-exception.filter';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    snapshot: true,
    logger: WinstonModule.createLogger(winstonConfig),
  });

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalFilters(new DomainExceptionFilter(), new JwtExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);
  const PORT = configService.get('PORT');
  const CORS_ORIGINS = configService.get<string>('CORS_ORIGINS');
  const SERVER = configService.get<string>('SERVER');
  const originArray = CORS_ORIGINS
    ? CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : [];

  app.enableCors({
    origin: originArray,
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });

  app.setGlobalPrefix('api');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('HRIS API')
    .setDescription('Human Resource Information System API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    // 201 Management Module - Employee File Management
    .addTag('201-Employee', 'Employee management endpoints')
    .addTag('201-Employee Status', 'Employee status management endpoints')

    // 201 Management Module - Education Management
    .addTag('201-Education', 'Education management endpoints')
    .addTag('201-Education Level', 'Education level management endpoints')
    .addTag('201-Education Course', 'Education course management endpoints')
    .addTag(
      '201-Education Course Level',
      'Education course level management endpoints',
    )
    .addTag('201-Education School', 'Education school management endpoints')

    // 201 Management Module - Training Management
    .addTag('201-Training', 'Training management endpoints')
    .addTag(
      '201-Training Certificate',
      'Training certificate management endpoints',
    )

    // 201 Management Module - Work Experience Management
    .addTag('201-Work Experience', 'Work experience management endpoints')
    .addTag(
      '201-Work Experience Company',
      'Work experience company management endpoints',
    )
    .addTag(
      '201-Work Experience Job Title',
      'Work experience job title management endpoints',
    )

    // 201 Management Module - Organizational Structure
    .addTag('201-Branch', 'Branch management endpoints')
    .addTag('201-Department', 'Department management endpoints')
    .addTag('201-Job Title', 'Job title management endpoints')

    // 201 Management Module - Reference Data
    .addTag('201-Reference', 'Reference management endpoints')
    .addTag('201-Barangay', 'Barangay management endpoints')
    .addTag('201-City', 'City management endpoints')
    .addTag('201-Province', 'Province management endpoints')
    .addTag('201-Citizenship', 'Citizenship management endpoints')
    .addTag('201-Civil Status', 'Civil status management endpoints')
    .addTag('201-Religion', 'Religion management endpoints')

    // 201 Management Module - Employee Movement Management
    .addTag('201-Employee Movement', 'Employee movement management endpoints')
    .addTag(
      '201-Employee Movement Type',
      'Employee movement type management endpoints',
    )

    // Document Management Module
    .addTag('Document', 'Document management endpoints')
    .addTag('Document Type', 'Document type management endpoints')
    .addTag('Upload', 'Upload management endpoints')

    // Leave Management Module (Future)
    // .addTag('Leave Request', 'Leave request management endpoints')
    // .addTag('Leave Type', 'Leave type management endpoints')
    // .addTag('Leave Balance', 'Leave balance management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Add tag groups for better organization
  (document as any)['x-tagGroups'] = [
    {
      name: '201-management',
      tags: [
        '201-Employee',
        '201-Employee Status',
        '201-Education',
        '201-Education Level',
        '201-Education Course',
        '201-Education Course Level',
        '201-Education School',
        '201-Training',
        '201-Training Certificate',
        '201-Work Experience',
        '201-Work Experience Company',
        '201-Work Experience Job Title',
        '201-Branch',
        '201-Department',
        '201-Job Title',
        '201-Reference',
        '201-Barangay',
        '201-City',
        '201-Province',
        '201-Citizenship',
        '201-Civil Status',
        '201-Religion',
        '201-Employee Movement',
        '201-Employee Movement Type',
        'Document',
        'Document Type',
        'Upload',
      ],
    },
    // Future: Leave Management Module
    // {
    //   name: 'leave-management',
    //   tags: [
    //     'Leave Request',
    //     'Leave Type',
    //     'Leave Balance',
    //   ],
    // },
  ];

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(PORT, async () => {
    logger.log(`Application is running on: ${await app.getUrl()} : ${SERVER}`);
    logger.log(
      `Swagger documentation available at: ${await app.getUrl()}/api/docs`,
    );
  });
}
bootstrap();
