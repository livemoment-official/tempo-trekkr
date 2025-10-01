/**
 * Safe utility functions to prevent "Cannot read properties of undefined" errors
 */

/**
 * Safely checks if an item is in an array
 * @param arr - The array to check (can be undefined/null)
 * @param item - The item to search for
 * @returns boolean - true if item is in array, false otherwise
 */
export const safeIncludes = <T>(arr: T[] | undefined | null, item: T): boolean => {
  return Array.isArray(arr) && arr.includes(item);
};

/**
 * Safely gets array length
 * @param arr - The array to get length from (can be undefined/null)
 * @returns number - array length or 0
 */
export const safeArrayLength = <T>(arr: T[] | undefined | null): number => {
  return Array.isArray(arr) ? arr.length : 0;
};

/**
 * Safely maps over an array
 * @param arr - The array to map (can be undefined/null)
 * @param fn - The mapping function
 * @returns T[] - mapped array or empty array
 */
export const safeMap = <T, U>(
  arr: T[] | undefined | null, 
  fn: (item: T, index: number) => U
): U[] => {
  return Array.isArray(arr) ? arr.map(fn) : [];
};

/**
 * Safely filters an array
 * @param arr - The array to filter (can be undefined/null)
 * @param fn - The filter function
 * @returns T[] - filtered array or empty array
 */
export const safeFilter = <T>(
  arr: T[] | undefined | null,
  fn: (item: T) => boolean
): T[] => {
  return Array.isArray(arr) ? arr.filter(fn) : [];
};

/**
 * Safely gets a property from an object
 * @param obj - The object (can be undefined/null)
 * @param key - The property key
 * @param defaultValue - The default value to return if property doesn't exist
 * @returns The property value or default value
 */
export const safeGet = <T extends Record<string, any>, K extends keyof T>(
  obj: T | undefined | null,
  key: K,
  defaultValue?: T[K]
): T[K] | undefined => {
  if (!obj || typeof obj !== 'object') return defaultValue;
  return key in obj ? obj[key] : defaultValue;
};

/**
 * Safely converts to array
 * @param value - The value to convert (can be undefined/null/single item)
 * @returns T[] - array
 */
export const toSafeArray = <T>(value: T | T[] | undefined | null): T[] => {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
};

/**
 * Validates if a string is a valid UUID
 * @param str - String to validate
 * @returns boolean
 */
export const isValidUUID = (str: string | undefined | null): boolean => {
  if (!str || typeof str !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Safely validates and returns UUID or null
 * @param str - String to validate
 * @returns string | null
 */
export const safeUUID = (str: string | undefined | null): string | null => {
  return isValidUUID(str) ? str! : null;
};

/**
 * Type guard to check if value is defined
 * @param value - Value to check
 * @returns boolean - true if not null/undefined
 */
export const isDefined = <T>(value: T | undefined | null): value is T => {
  return value !== undefined && value !== null;
};

/**
 * Safely merges partial state updates
 * @param currentState - Current state object
 * @param updates - Partial updates to apply
 * @returns Merged state
 */
export const safeMergeState = <T extends Record<string, any>>(
  currentState: T,
  updates: Partial<T>
): T => {
  // Filter out undefined values from updates
  const cleanUpdates = Object.entries(updates).reduce<Partial<T>>((acc, [key, value]) => {
    if (value !== undefined) {
      (acc as any)[key] = value;
    }
    return acc;
  }, {});

  return { ...currentState, ...cleanUpdates };
};
