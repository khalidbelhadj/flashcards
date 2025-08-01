/**
 * Represents a successful result containing data of type T.
 *
 * @template T - The type of the successful result data.
 * @property _variant - Discriminant for the Ok variant.
 * @property success - Always true for Ok.
 * @property data - The successful result data.
 */
export type Ok<T> = {
  _variant: "Ok";
  success: true;
  data: T;
};

/**
 * Represents an error result containing an error of type E.
 *
 * @template E - The type of the error.
 * @property _variant - Discriminant for the Err variant.
 * @property success - Always false for Err.
 * @property error - The error value.
 */
export type Err<E> = {
  _variant: "Err";
  success: false;
  error: E;
};

/**
 * Creates a tagged error class with a specified tag.
 *
 * This utility function returns a class that can be used to construct error objects
 * with a specific tag and associated data. The resulting class has a readonly `_tag`
 * property set to the provided tag, and a `data` property containing the error payload.
 *
 * @template Tag - The string literal type representing the error tag.
 * @param tag - The tag to associate with the error class.
 * @returns A class that constructs tagged error objects with the given tag and data.
 *
 * @example
 * const NotFoundError = TaggedError("NotFound");
 * throw new NotFoundError({ resource: "Deck" });
 */
export function TaggedError<Tag extends string>(tag: Tag) {
  /**
   * Tagged error class with a static tag and optional data.
   * @template T - The type of the error data.
   */
  return class<T = undefined> {
    readonly _tag: Tag = tag;
    data: T | undefined;
    /**
     * Constructs a tagged error instance.
     * @param args - The error data, if any.
     */
    constructor(...args: T extends undefined ? [] : [data: T]) {
      if (args.length > 0) {
        this.data = args[0];
      }
    }
  };
}

/**
 * A type representing either a successful result (Ok) or an error (Err).
 *
 * @template T - The type of the successful result data.
 * @template E - The type of the error.
 */
export type Result<T, E> = Ok<T> | Err<E>;

/**
 * Creates a successful result containing the provided data.
 *
 * @template T - The type of the successful result data.
 * @param data - The data to wrap in an Ok result.
 * @returns An Ok result containing the data.
 */
export function ok<T>(data: T): Ok<T> {
  return {
    _variant: "Ok",
    success: true,
    data,
  };
}

/**
 * Creates an error result containing the provided error.
 *
 * @template E - The type of the error.
 * @param error - The error to wrap in an Err result.
 * @returns An Err result containing the error.
 */
export function err<E>(error: E): Err<E> {
  return {
    _variant: "Err",
    success: false,
    error,
  };
}

/**
 * Executes a synchronous operation and returns a Result.
 *
 * @template T - The type of the successful result data.
 * @template E - The type of the error.
 * @param o - An object with a `try` function and optional `catch` handler.
 * @param o.try - The function to execute.
 * @param o.catch - Optional error handler to transform the error.
 * @returns A Result containing the data or error.
 */
export function trySync<T, E>(o: {
  try: () => T;
  catch?: (error: unknown) => E;
}): Result<T, E | unknown> {
  try {
    const data = o.try();
    return ok(data);
  } catch (error) {
    if (!o.catch) {
      return err(error as E | unknown);
    }
    return err(o.catch(error));
  }
}

/**
 * Executes an asynchronous operation and returns a Promise of Result.
 *
 * @template T - The type of the successful result data.
 * @template E - The type of the error.
 * @param o - An object with a `try` function and optional `catch` handler.
 * @param o.try - The async function to execute.
 * @param o.catch - Optional async error handler to transform the error.
 * @returns A Promise resolving to a Result containing the data or error.
 */
export async function tryAsync<T, E>(o: {
  try: () => Promise<T>;
  catch?: (error: unknown) => Promise<E>;
}): Promise<Result<T, E | unknown>> {
  try {
    const data = await o.try();
    return ok(data);
  } catch (error) {
    if (!o.catch) {
      return err(error as E | unknown);
    }
    return err(await o.catch(error));
  }
}

/**
 * Converts a nullable value to a Result. Returns Ok if the value is not null or undefined, otherwise returns Err with the provided error.
 *
 * @template T - The type of the value.
 * @template E - The type of the error.
 * @param value - The value that may be null or undefined.
 * @param error - The error to use if the value is null or undefined.
 * @returns An Ok result if value is not null/undefined, otherwise an Err result with the provided error.
 */
export function fromNullable<T, E>(
  value: T | null | undefined,
  error: E,
): Result<T, E> {
  if (value !== null && value !== undefined) {
    return ok(value);
  }
  return err(error);
}

/**
 * Unwraps a Result, returning the data if successful, or throwing the error if not.
 *
 * @template T - The type of the successful result data.
 * @template E - The type of the error.
 * @param result - The Result to unwrap.
 * @returns The data if the result is Ok.
 * @throws The error if the result is Err.
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.success) {
    return result.data;
  }
  throw result.error;
}

/**
 * Unwraps a Result, returning the data if successful, or a default value if not.
 *
 * @template T - The type of the successful result data.
 * @template U - The type of the default value.
 * @template E - The type of the error.
 * @param result - The Result to unwrap.
 * @param defaultValue - The value to return if the result is Err.
 * @returns The data if the result is Ok, otherwise the default value.
 */
export function unwrapOr<T, U, E>(
  result: Result<T, E>,
  defaultValue: U,
): T | U {
  if (result.success) {
    return result.data;
  }
  return defaultValue;
}
