import type { FieldError, FieldErrors, Resolver } from "react-hook-form";
import type { ZodError, ZodSchema, input } from "zod";

const toFieldError = (issue: ZodError["issues"][number]): FieldError => ({
  type: issue.code,
  message: issue.message,
});

const setNestedError = (
  errors: FieldErrors,
  path: (string | number)[],
  error: FieldError,
): void => {
  if (path.length === 0) {
    return;
  }

  const [key, ...rest] = path;
  const stringKey = String(key);

  if (rest.length === 0) {
    errors[stringKey] = error;
    return;
  }

  if (!errors[stringKey] || typeof errors[stringKey] !== "object") {
    errors[stringKey] = {} as FieldErrors;
  }

  setNestedError(errors[stringKey] as FieldErrors, rest, error);
};

export const zodResolver = <TSchema extends ZodSchema>(
  schema: TSchema,
): Resolver<input<TSchema>> => {
  return async (values) => {
    try {
      const data = await schema.parseAsync(values);
      return {
        values: data,
        errors: {},
      };
    } catch (error) {
      const zodError = error as ZodError;
      const fieldErrors: FieldErrors = {};

      zodError.issues.forEach((issue) => {
        setNestedError(fieldErrors, issue.path, toFieldError(issue));
      });

      return {
        values: {},
        errors: fieldErrors,
      };
    }
  };
};
