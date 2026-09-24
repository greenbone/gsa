/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useMemo} from 'react';

export type TransformFunc<
  TInputData,
  TOutputData,
  TTransformProps extends object = object,
> = (data: TInputData | undefined, props?: TTransformProps) => TOutputData;

/**
 * Transforms input data into output data and memoizes the result.
 *
 * @param data Input data to be transformed into the output data
 * @param transform Static function that converts the input data to the output data.
 * The function should be pure and should not change during the component's lifecycle.
 * @param transformProps Optional properties to customize the transformation.
 * Please be aware the data is re-evaluated whenever the input data or the transformation properties change.
 * That means passing an empty object or a new object on every render will trigger a re-evaluation of the transformation.
 * Be cautious when passing new objects as transformation properties on every render, as it may lead to unnecessary re-computations.
 *
 * @returns The transformed output data
 */
const useDataTransform = <
  TInputData,
  TOutputData,
  TTransformProps extends object = object,
>(
  data: TInputData | undefined,
  transform: TransformFunc<TInputData, TOutputData, TTransformProps>,
  transformProps?: TTransformProps,
): TOutputData => {
  return useMemo(
    () => transform(data, transformProps),
    [data, transform, transformProps],
  );
};

export default useDataTransform;
