export enum IsolationLevel {
  READ_UNCOMMITTED = 'READ UNCOMMITTED',
  READ_COMMITTED = 'READ COMMITTED',
  REPEATABLE_READ = 'REPEATABLE READ',
  SERIALIZABLE = 'SERIALIZABLE',
}

export interface TransactionOptions {
  isolationLevel?: IsolationLevel;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface TransactionPort {
  executeTransaction<T>(
    actionlog: string,
    work: (manager: any) => Promise<T>,
    options?: TransactionOptions,
  ): Promise<T>;
}
