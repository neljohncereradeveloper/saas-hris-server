const fs = require('fs');
const path = require('path');

// Define all modules and their corresponding tags
const modules = [
  { name: 'barangay', tag: 'Barangay' },
  { name: 'branch', tag: 'Branch' },
  { name: 'citizenship', tag: 'Citizenship' },
  { name: 'city', tag: 'City' },
  { name: 'civilstatus', tag: 'Civil Status' },
  { name: 'department', tag: 'Department' },
  { name: 'edu', tag: 'Education' },
  { name: 'edu-course', tag: 'Education Course' },
  { name: 'edu-courselevel', tag: 'Education Course Level' },
  { name: 'edu-level', tag: 'Education Level' },
  { name: 'edu-school', tag: 'Education School' },
  { name: 'empstatus', tag: 'Employee Status' },
  { name: 'jobtitle', tag: 'Job Title' },
  { name: 'province', tag: 'Province' },
  { name: 'reference', tag: 'Reference' },
  { name: 'religion', tag: 'Religion' },
  { name: 'training', tag: 'Training' },
  { name: 'training-cert', tag: 'Training Certificate' },
  { name: 'workexp', tag: 'Work Experience' },
  { name: 'workexp-company', tag: 'Work Experience Company' },
  { name: 'workexp-jobtitle', tag: 'Work Experience Job Title' },
];

// Function to add Swagger imports to controller
function addSwaggerImports(content) {
  const swaggerImports = `import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';`;

  // Check if swagger imports already exist
  if (content.includes('@nestjs/swagger')) {
    return content;
  }

  // Find the last import statement
  const importRegex = /import\s+.*?from\s+['"][^'"]+['"];?\s*$/gm;
  const imports = content.match(importRegex);

  if (imports && imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    const insertIndex = lastImportIndex + lastImport.length;

    return (
      content.slice(0, insertIndex) +
      '\n' +
      swaggerImports +
      content.slice(insertIndex)
    );
  }

  return swaggerImports + '\n' + content;
}

// Function to add ApiTags decorator to controller class
function addApiTags(content, tag) {
  const controllerRegex =
    /@Controller\([^)]+\)\s*\n\s*export class \w+Controller/;
  const match = content.match(controllerRegex);

  if (match) {
    const replacement = `@ApiTags('${tag}')
@Controller(${match[0].split('@Controller')[1]}`;
    return content.replace(controllerRegex, replacement);
  }

  return content;
}

// Function to add Swagger decorators to methods
function addMethodDecorators(content, moduleName) {
  // Add decorators to POST method (create)
  content = content.replace(
    /@Version\('1'\)\s*\/\/ API versioning\s*@Post\(\)\s*async create\(/g,
    `@Version('1') // API versioning
  @Post()
  @ApiOperation({ summary: 'Create a new ${moduleName}' })
  @ApiBody({ type: Create${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Dto })
  @ApiResponse({ status: 201, description: '${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async create(`,
  );

  // Add decorators to GET method (findPaginatedList)
  content = content.replace(
    /@Version\('1'\)\s*\/\/ API versioning\s*@Get\(\)\s*async findPaginatedList\(/g,
    `@Version('1') // API versioning
  @Get()
  @ApiOperation({ summary: 'Get paginated list of ${moduleName}s' })
  @ApiQuery({ name: 'term', required: false, description: 'Search term' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: '10',
  })
  @ApiResponse({ status: 200, description: '${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}s retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async findPaginatedList(`,
  );

  // Add decorators to PATCH method (update)
  content = content.replace(
    /@Version\('1'\)\s*\/\/ API versioning\s*@Patch\(':id'\)\s*async update\(/g,
    `@Version('1') // API versioning
  @Patch(':id')
  @ApiOperation({ summary: 'Update ${moduleName} information' })
  @ApiParam({ name: 'id', description: '${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} ID', example: 1 })
  @ApiBody({ type: Update${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Dto })
  @ApiResponse({ status: 200, description: '${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} updated successfully' })
  @ApiResponse({ status: 404, description: '${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(`,
  );

  // Add decorators to archive method
  content = content.replace(
    /@Version\('1'\)\s*\/\/ API versioning\s*@Patch\(':id\/archive'\)\s*async archive\(/g,
    `@Version('1') // API versioning
  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive a ${moduleName}' })
  @ApiParam({ name: 'id', description: '${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} ID', example: 1 })
  @ApiResponse({ status: 200, description: '${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} archived successfully' })
  @ApiResponse({ status: 404, description: '${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(`,
  );

  // Add decorators to unarchive method
  content = content.replace(
    /@Version\('1'\)\s*\/\/ API versioning\s*@Patch\(':id\/unarchive'\)\s*async unarchive\(/g,
    `@Version('1') // API versioning
  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a ${moduleName}' })
  @ApiParam({ name: 'id', description: '${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} ID', example: 1 })
  @ApiResponse({ status: 200, description: '${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} unarchived successfully' })
  @ApiResponse({ status: 404, description: '${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async unarchive(`,
  );

  // Add decorators to combobox method
  content = content.replace(
    /@Version\('1'\)\s*\/\/ API versioning\s*@Get\('combobox'\)\s*async retrieveForCombobox\(/g,
    `@Version('1') // API versioning
  @Get('combobox')
  @ApiOperation({ summary: 'Get ${moduleName}s for combobox dropdown' })
  @ApiResponse({ status: 200, description: '${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}s retrieved successfully for combobox' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async retrieveForCombobox(`,
  );

  return content;
}

// Function to add ApiProperty decorators to DTOs
function addDtoDecorators(content, moduleName) {
  // Add ApiProperty import
  if (!content.includes('@nestjs/swagger')) {
    const importRegex = /import\s+.*?from\s+['"][^'"]+['"];?\s*$/gm;
    const imports = content.match(importRegex);

    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertIndex = lastImportIndex + lastImport.length;

      content =
        content.slice(0, insertIndex) +
        "\nimport { ApiProperty } from '@nestjs/swagger';" +
        content.slice(insertIndex);
    }
  }

  // Add ApiProperty decorators to fields
  content = content.replace(
    /@Transform\([^)]+\)\s*@IsNotEmpty\([^)]+\)\s*@IsString\([^)]+\)\s*@Length\([^)]+\)\s*@Matches\([^)]+\)\s*(\w+):\s*string;/g,
    (match, fieldName) => {
      const apiProperty = `@ApiProperty({
    description: '${fieldName}',
    example: 'Example ${fieldName}',
  })
  `;
      return apiProperty + match;
    },
  );

  return content;
}

// Process all modules
modules.forEach((module) => {
  const controllerPath = `server/src/features/201-files/infrastructure/modules/${module.name}/controller/${module.name}.controller.ts`;
  const createDtoPath = `server/src/features/201-files/infrastructure/modules/${module.name}/dto/create-${module.name}.dto.ts`;
  const updateDtoPath = `server/src/features/201-files/infrastructure/modules/${module.name}/dto/update-${module.name}.dto.ts`;

  // Process controller
  if (fs.existsSync(controllerPath)) {
    let content = fs.readFileSync(controllerPath, 'utf8');

    // Skip if already has Swagger decorators
    if (!content.includes('@ApiTags')) {
      content = addSwaggerImports(content);
      content = addApiTags(content, module.tag);
      content = addMethodDecorators(content, module.name);

      fs.writeFileSync(controllerPath, content);
      console.log(`Updated controller: ${module.name}`);
    }
  }

  // Process create DTO
  if (fs.existsSync(createDtoPath)) {
    let content = fs.readFileSync(createDtoPath, 'utf8');

    if (!content.includes('@ApiProperty')) {
      content = addDtoDecorators(content, module.name);
      fs.writeFileSync(createDtoPath, content);
      console.log(`Updated create DTO: ${module.name}`);
    }
  }

  // Process update DTO
  if (fs.existsSync(updateDtoPath)) {
    let content = fs.readFileSync(updateDtoPath, 'utf8');

    if (!content.includes('@ApiProperty')) {
      content = addDtoDecorators(content, module.name);
      fs.writeFileSync(updateDtoPath, content);
      console.log(`Updated update DTO: ${module.name}`);
    }
  }
});

console.log('Swagger decorators added to all modules!');
