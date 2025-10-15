/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Rejection from 'gmp/http/rejection';
import {type default as Response, type Meta} from 'gmp/http/response';

type MethodUpperCase = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type Method = MethodUpperCase | Lowercase<MethodUpperCase>;

export interface TransformOptions {
  method?: Method;
  url?: string;
  formdata?: FormData;
  force?: boolean;
}

/**
 * Represents a transformation function that processes a successful response.
 *
 * @template TDataIn - The type of the input data in the response. Defaults to `unknown`.
 * @template TMetaIn - The type of the input metadata in the response. Must extend `Meta`. Defaults to `Meta`.
 * @template TDataOut - The type of the output data in the transformed response. Defaults to `TDataIn`.
 * @template TMetaOut - The type of the output metadata in the transformed response. Must extend `Meta`. Defaults to `TMetaIn`.
 *
 * @param response - The original response object containing input data and metadata.
 * @param options - Optional transformation options that may influence the transformation process.
 * @returns A new response object containing transformed data and metadata.
 */
export type TransformSuccess<
  TDataIn = unknown,
  TMetaIn extends Meta = Meta,
  TDataOut = TDataIn,
  TMetaOut extends Meta = TMetaIn,
> = (
  response: Response<TDataIn, TMetaIn>,
  options?: TransformOptions,
) => Response<TDataOut, TMetaOut>;

/**
 * A type representing a function that processes a `Rejection` object and optionally
 * takes additional transformation options. The function returns a transformed `Rejection`.
 *
 * @param rejection - The `Rejection` object to be transformed.
 * @param options - Optional transformation options to customize the behavior of the transformation.
 * @returns The transformed `Rejection` object.
 */
export type TransformRejection = (
  rejection: Rejection,
  options?: TransformOptions,
) => Rejection;

/**
 * Represents a transformation process that handles success and rejection scenarios.
 *
 * @template TSuccessDataIn - The type of the input data for a successful transformation. Defaults to `unknown`.
 * @template TSuccessMetaIn - The type of the input metadata for a successful transformation. Must extend `Meta`. Defaults to `Meta`.
 * @template TSuccessDataOut - The type of the output data for a successful transformation. Defaults to the same type as `TSuccessDataIn`.
 * @template TSuccessMetaOut - The type of the output metadata for a successful transformation. Must extend `Meta`. Defaults to the same type as `TSuccessMetaIn`.
 *
 * @property success - Defines the transformation logic for successful scenarios, including input and output data and metadata.
 * @property rejection - Defines the transformation logic for rejection scenarios.
 */
export interface Transform<
  TSuccessDataIn = unknown,
  TSuccessMetaIn extends Meta = Meta,
  TSuccessDataOut = TSuccessDataIn,
  TSuccessMetaOut extends Meta = TSuccessMetaIn,
> {
  success: TransformSuccess<
    TSuccessDataIn,
    TSuccessMetaIn,
    TSuccessDataOut,
    TSuccessMetaOut
  >;
  rejection: TransformRejection;
}
