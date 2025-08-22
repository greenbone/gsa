/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {z} from 'zod';
import logger from 'gmp/log';

interface ValidateAndCreateOptions<T, U> {
  schema: z.ZodSchema<T>;
  parsedElement: T;
  originalElement: unknown;
  modelName: string;
  ModelClass: new (properties: T) => U;
}

/**
 * Validates parsed data against a Zod schema and creates a model instance.
 *
 * @param options - Configuration object containing schema, data, and model information
 * @returns New instance of the model class
 * @throws Error if validation fails
 */
export function validateAndCreate<T, U>({
  schema,
  parsedElement,
  originalElement,
  modelName,
  ModelClass,
}: ValidateAndCreateOptions<T, U>): U {
  const validationResult = schema.safeParse(parsedElement);

  if (!validationResult.success) {
    logger
      .getLogger(`gmp.models.${modelName}`)
      .error(
        `Invalid ${modelName}Element data`,
        validationResult.error,
        originalElement,
      );
    throw new Error(`Invalid ${modelName}Element data`);
  }

  return new ModelClass(parsedElement);
}
