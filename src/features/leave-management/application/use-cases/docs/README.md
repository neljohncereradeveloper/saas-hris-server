# Leave Management Use Cases Documentation

## Overview

This directory contains comprehensive documentation for all use cases in the Leave Management module. The documentation is organized by feature area and provides detailed information about each use case, including implementation examples, business rules, and integration patterns.

## Documentation Structure

### 📁 Feature Areas

- **[leave-balance/](leave-balance/docs/)** - Leave balance management operations
- **[leave-policy/](leave-policy/docs/)** - Leave policy configuration and management
- **[leave-type/](leave-type/docs/)** - Leave type definitions and management

### 📋 Setup Guides

- **[Annual Leave Balance Setup](annual-leave-balance-setup.md)** - Complete guide for initial leave management setup

## Quick Start

### Initial Setup

The first step in setting up leave management is to generate annual leave balances:

```typescript
import { GenerateAnnualLeaveBalancesUseCase } from './leave-balance/generate-annual-leave-balances.use-case';

// Generate balances for current year
const result = await generateAnnualLeaveBalancesUseCase.execute(
  { year: 2024, forceRegenerate: false },
  userId,
  requestInfo,
);
```

### Key Business Rules

- **Manual balance updates are NOT allowed** - balances can only be updated through:

  - Leave Request approval/cancellation
  - Encashment approval
  - Year-end reset operations
  - Policy carry-over calculations

- **Administrative operations are SAFE** - these operations don't modify balance values:
  - Creating new balances
  - Closing balances
  - Soft deleting balances
  - Resetting balances for year

## Use Case Categories

### 🔄 Balance Management

- Generate annual leave balances
- Create individual leave balances
- Close leave balances
- Reset balances for year
- Find balances by employee/year
- Find balances by leave type
- Soft delete balances

### ⚙️ Policy Management

- Create leave policies
- Update leave policies
- Activate policies
- Retire policies
- Get active policies
- Find paginated policy lists
- Soft delete policies

### 📝 Type Management

- Create leave types
- Update leave types
- Find paginated type lists
- Retrieve types for UI components
- Soft delete types

## Integration Patterns

### Frontend Integration

Each use case includes examples for:

- **React** - Hook patterns and component integration
- **Angular** - Service injection and component usage
- **Vue** - Composition API and component patterns

### Backend Integration

- **Dependency injection** patterns
- **Error handling** strategies
- **Transaction management** examples
- **Audit logging** implementations

## Best Practices

1. **Always use transactions** for operations that modify multiple records
2. **Implement proper error handling** with meaningful error messages
3. **Log all operations** for audit and debugging purposes
4. **Validate inputs** before processing
5. **Follow the established patterns** for consistency

## Support

For questions about specific use cases, refer to the individual documentation files in each feature area. Each use case includes:

- Detailed implementation examples
- Business rule explanations
- Error handling patterns
- Integration examples
- Performance considerations
