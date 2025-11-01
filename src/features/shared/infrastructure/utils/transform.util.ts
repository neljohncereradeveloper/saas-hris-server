import { Transform } from 'class-transformer';

/**
 * Utility class for common transformation decorators
 */
export class TransformUtil {
  /**
   * Transforms string values to numbers, handling empty values gracefully
   * @param allowEmpty - Whether to allow empty values (default: true)
   * @returns Transform decorator function
   */
  static toNumber(allowEmpty: boolean = true) {
    return Transform(({ value }) => {
      // Handle empty values
      if (value === '' || value === null || value === undefined) {
        return allowEmpty ? null : 0;
      }

      // Convert string to number
      if (typeof value === 'string') {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? (allowEmpty ? null : 0) : parsed;
      }

      // Return as-is if already a number
      return typeof value === 'number' ? value : allowEmpty ? null : 0;
    });
  }

  /**
   * Transforms string values to floats, handling empty values gracefully
   * @param allowEmpty - Whether to allow empty values (default: true)
   * @returns Transform decorator function
   */
  static toFloat(allowEmpty: boolean = true) {
    return Transform(({ value }) => {
      // Handle empty values
      if (value === '' || value === null || value === undefined) {
        return allowEmpty ? null : 0;
      }

      // Convert string to float
      if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? (allowEmpty ? null : 0) : parsed;
      }

      // Return as-is if already a number
      return typeof value === 'number' ? value : allowEmpty ? null : 0;
    });
  }

  /**
   * Transforms values to strings, handling empty values gracefully
   * @param allowEmpty - Whether to allow empty values (default: true)
   * @param defaultValue - Default value to use when empty (default: undefined)
   * @returns Transform decorator function
   */
  static toString(allowEmpty: boolean = true, defaultValue?: string) {
    return Transform(({ value }) => {
      // Handle empty values
      if (value === '' || value === null || value === undefined) {
        return allowEmpty ? (defaultValue ?? null) : '';
      }

      // Convert to string
      return String(value);
    });
  }

  /**
   * Transforms values to boolean, handling empty values gracefully
   * @param allowEmpty - Whether to allow empty values (default: true)
   * @returns Transform decorator function
   */
  static toBoolean(allowEmpty: boolean = true) {
    return Transform(({ value }) => {
      // Handle empty values
      if (value === '' || value === null || value === undefined) {
        return allowEmpty ? null : false;
      }

      // Convert to boolean
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        if (lowerValue === 'true' || lowerValue === '1') return true;
        if (lowerValue === 'false' || lowerValue === '0') return false;
        return allowEmpty ? null : false;
      }

      return Boolean(value);
    });
  }

  /**
   * Transforms values to Date, handling empty values gracefully
   * @param allowEmpty - Whether to allow empty values (default: true)
   * @returns Transform decorator function
   */
  static toDate(allowEmpty: boolean = true) {
    return Transform(({ value }) => {
      // Handle empty values
      if (value === '' || value === null || value === undefined) {
        return allowEmpty ? null : new Date();
      }

      // Convert to Date
      const date = new Date(value);
      return isNaN(date.getTime()) ? (allowEmpty ? null : new Date()) : date;
    });
  }

  /**
   * Sanitizes string values by trimming and handling empty values
   * @param allowEmpty - Whether to allow empty values (default: true)
   * @param defaultValue - Default value to use when empty (default: undefined)
   * @returns Transform decorator function
   */
  static sanitizeString(allowEmpty: boolean = true, defaultValue?: string) {
    return Transform(({ value }) => {
      // Handle empty values
      if (value === '' || value === null || value === undefined) {
        return allowEmpty ? (defaultValue ?? null) : '';
      }

      // Trim and return
      const trimmed = String(value).trim();
      return trimmed === ''
        ? allowEmpty
          ? (defaultValue ?? null)
          : ''
        : trimmed;
    });
  }

  /**
   * Transforms array values, handling empty values gracefully
   * @param allowEmpty - Whether to allow empty values (default: true)
   * @returns Transform decorator function
   */
  static toArray(allowEmpty: boolean = true) {
    return Transform(({ value }) => {
      // Handle empty values
      if (value === '' || value === null || value === undefined) {
        return allowEmpty ? null : [];
      }

      // Convert to array if not already
      if (Array.isArray(value)) {
        return value;
      }

      // Try to parse as JSON array
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          return [value];
        }
      }

      return [value];
    });
  }

  /**
   * Transforms object values, handling empty values gracefully
   * @param allowEmpty - Whether to allow empty values (default: true)
   * @returns Transform decorator function
   */
  static toObject(allowEmpty: boolean = true) {
    return Transform(({ value }) => {
      // Handle empty values
      if (value === '' || value === null || value === undefined) {
        return allowEmpty ? null : {};
      }

      // Convert to object if not already
      if (typeof value === 'object' && value !== null) {
        return value;
      }

      // Try to parse as JSON object
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return allowEmpty ? null : {};
        }
      }

      return allowEmpty ? null : {};
    });
  }
}
