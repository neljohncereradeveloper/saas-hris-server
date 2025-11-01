# HR Management System - Server

This project implements a modern server architecture combining Vertical Slice Architecture with Clean Architecture principles for optimal modularity, maintainability, and scalability.

## Project Structure

```
src/
├── core/                  # Core business logic and interfaces shared across features
│   ├── domain/           # Core domain models and logic
│   ├── ports/            # Core interface definitions
│   └── exceptions/       # Core exception definitions
├── infrastructure/        # Cross-cutting infrastructure concerns
│   ├── database/         # Database configurations and connections
│   ├── filters/          # Global filters
│   ├── logger/           # Logging infrastructure
│   └── middlewares/      # Global middleware
├── shared/               # Shared utilities and common components
├── features/             # Feature modules (Vertical Slices)
│   └── feature-name/     # Each feature follows Clean Architecture
│       ├── domain/       # Business entities and logic
│       │   ├── models/
│       │   ├── ports/
│       │   ├── repositories/
│       │   └── exceptions/
│       ├── application/  # Use cases and application logic
│       │   ├── commands/
│       │   └── use-cases/
│       └── infrastructure/ # Feature-specific infrastructure
│           ├── database/
│           └── modules/
├── app.module.ts         # Main application module
└── main.ts              # Application entry point
```

## Architecture Overview

### Vertical Slice Architecture
- Each feature is self-contained and independent
- Features are organized by business functionality rather than technical layers
- Reduces coupling between features
- Enables easier maintenance and modification of individual features

### Clean Architecture Layers

#### Core (Global)
- Domain: Contains shared domain models and logic
- Ports: Defines core interfaces used across features
- Exceptions: Defines core exception types and handlers

#### Infrastructure (Global)
- Database: Global database configurations and connections
- Filters: Global exception filters and request/response filters
- Logger: Centralized logging infrastructure
- Middlewares: Global middleware implementations

#### Shared Directory
- Contains utilities, helpers, and common components used across features
- Includes non-domain specific functionality like date formatting, validation helpers, etc.
- Houses common DTOs and value objects that don't belong to any specific domain
- Contains shared configuration constants and environment utilities

#### Feature Structure
Each feature follows Clean Architecture principles with:

1. **Domain Layer**
   - Models: Business entities and data structures
   - Ports: Interface definitions for external dependencies
   - Repositories: Data access interfaces
   - Exceptions: Domain-specific error definitions

2. **Application Layer**
   - Commands: Command handlers for write operations
   - Use Cases: Business logic implementation

3. **Infrastructure Layer**
   - Database: Database-specific implementations
   - Modules: Feature-specific module configurations

## Communication Flow

### Within a Feature
Communication between layers within a feature follows the dependency rule:

1. **Infrastructure → Application → Domain**
   - Domain layer has no dependencies on other layers
   - Application layer depends on domain layer
   - Infrastructure layer depends on application and domain layers

2. **Request Flow Example**
   - Request arrives at a controller in the infrastructure layer
   - Controller calls appropriate use case or command in application layer
   - Application layer orchestrates the business logic using domain entities
   - Results flow back through the layers to the client

### Between Features
Features are designed to be independent, but communication between them can occur in several ways:

1. **Event-Based Communication**
   - Features publish domain events when significant state changes occur
   - Other features can subscribe to these events
   - This maintains loose coupling between features

2. **Shared Core Services**
   - When direct communication is necessary, use core services as intermediaries
   - Avoid direct dependencies between features

3. **API Boundaries**
   - Each feature should expose a clear API through its infrastructure layer
   - Other features should only interact through these defined APIs

## Practical Implementation Examples

### Feature Organization Example

In our architecture, a typical feature module like "201-files" follows this structure:

```
features/
└── 201-files/
    ├── domain/
    │   ├── models/              # Domain entities
    │   ├── ports/               # Interface definitions
    │   ├── repositories/        # Repository interfaces
    │   └── exceptions/          # Domain-specific exceptions
    ├── application/
    │   ├── commands/            # Command handlers (write operations)
    │   └── use-cases/           # Business logic implementation
    └── infrastructure/
        ├── database/            # Database implementations
        └── modules/             # Feature module definitions
```

This structure ensures that our domain logic remains isolated from implementation details, while application logic orchestrates the use of domain objects and infrastructure implements the technical requirements.

### Model Dependencies

Our core contains shared models and interfaces that can be used across features:

```
core/
├── domain/                 # Core domain models
├── ports/                  # Core interface definitions
└── exceptions/             # Core exception types
```

When a feature needs to use a model defined in core, it imports it directly, but still maintains its own domain integrity. Features don't depend on other features directly - they only depend on core when necessary.

### Cross-Cutting Concerns

Infrastructure handles cross-cutting concerns that span multiple features:

```
infrastructure/
├── database/              # Database configurations
├── filters/               # Global filters
├── logger/                # Logging services
└── middlewares/           # Global middleware
```

For example, our global logging infrastructure can be used by any feature through dependency injection, without creating inappropriate dependencies between features.

## Feature Implementation Strategy

When implementing a new feature in our architecture:

1. Start by defining domain models and interfaces in the feature's domain layer
2. Implement business logic in use cases within the application layer 
3. Create database entities and repository implementations in the infrastructure layer
4. Finally, wire everything together in the feature module

This "inside-out" approach ensures that the domain remains the focus, with technical details implemented later.


## Developer Workflow

### Creating a New Feature

1. **Plan the Feature**
   - Define the domain models, use cases, and external dependencies
   - Identify interactions with other features or core components

2. **Implement from Inside Out**
   - Start with domain models and logic
   - Implement application use cases
   - Finally, add infrastructure components

3. **Testing**
   - Write tests for each layer as you implement it
   - Ensure domain logic is thoroughly tested
   - Use integration tests for infrastructure components

4. **Integration**
   - Register the feature module in the application
   - Configure any necessary middleware or filters

### Modifying an Existing Feature

1. **Identify the layer that needs changes**
2. **Make changes respecting the dependency rule**
3. **Update tests to reflect the changes**
4. **Ensure no new dependencies are introduced that violate the architecture**

## Dependency Management

### Rules to Follow

1. **Dependencies always point inward**
   - Infrastructure → Application → Domain
   - Never the other direction

2. **Use interfaces for dependencies**
   - Define interfaces in the domain layer
   - Implement them in the infrastructure layer
   - Inject implementations through DI

3. **Keep core components focused**
   - Core components should be stable and change infrequently
   - Move feature-specific logic to feature modules

4. **Avoid circular dependencies**
   - Feature A should not depend on Feature B if B depends on A
   - Use events or shared core services to break cycles

## Troubleshooting

### Common Issues

1. **Domain Logic Leaking to Application Layer**
   - Symptom: Complex business rules in use cases
   - Solution: Move business logic to domain models and services

2. **Direct Database Access in Application Layer**
   - Symptom: TypeORM repositories used directly in use cases
   - Solution: Use domain repository interfaces and inject implementations

3. **Cross-Feature Dependencies**
   - Symptom: Feature A imports directly from Feature B
   - Solution: Extract shared components to core or use event-based communication

4. **Too Much Code in Infrastructure Layer**
   - Symptom: Complex logic in controllers or repositories
   - Solution: Move business logic to appropriate application or domain layer

## Key Principles

1. **Independence**: Features are independent and self-contained
2. **Clean Architecture**: Each feature follows clean architecture principles
3. **Domain-Driven**: Business logic is central to the architecture
4. **Separation of Concerns**: Clear separation between layers
5. **Dependency Rule**: Dependencies point inward, with domain at the center

## Guidelines

1. Keep feature-specific code within its feature directory
2. Use the core and infrastructure directories only for truly shared components
3. Follow Clean Architecture's dependency rule within each feature
4. Avoid cross-feature dependencies
5. Use interfaces to define contracts between layers
6. Keep the domain layer pure and framework-independent

## Best Practices

1. Each feature should be independently deployable
2. Use DTOs for data transfer between layers
3. Implement proper error handling at each layer
4. Follow SOLID principles
5. Write unit tests for each layer
6. Document public APIs and interfaces
