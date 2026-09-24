/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {renderHook} from 'web/testing';
import useDataTransform, {
  type TransformFunc,
} from 'web/components/dashboard/display/useDataTransform';

interface TransformProps {
  multiplier: number;
}

interface TransformedData {
  values: number[];
}

const transformData = (
  data: number[] | undefined,
  props?: TransformProps,
): TransformedData => ({
  values: (data ?? []).map(value => value * (props?.multiplier ?? 1)),
});

describe('useDataTransform tests', () => {
  test('should transform data with the provided props', () => {
    const transform =
      testing.fn<TransformFunc<number[], TransformedData, TransformProps>>(
        transformData,
      );

    const {result} = renderHook(() =>
      useDataTransform([1, 2], transform, {multiplier: 2}),
    );

    expect(result.current).toEqual({values: [2, 4]});
    expect(transform).toHaveBeenCalledWith([1, 2], {multiplier: 2});
  });

  test('should memoize transformed data during rerenders', () => {
    const transform =
      testing.fn<TransformFunc<number[], TransformedData, TransformProps>>(
        transformData,
      );
    const data = [1, 2];
    const props = {multiplier: 2};

    const {result, rerender} = renderHook(
      ({data, props}: {data: number[]; props: TransformProps}) =>
        useDataTransform(data, transform, props),
      {initialProps: {data, props}},
    );
    const transformedData = result.current;

    rerender({data, props});

    expect(result.current).toBe(transformedData);
    expect(transform).toHaveBeenCalledTimes(1);
  });

  test('should update transformed data when data or props change', () => {
    const transform =
      testing.fn<TransformFunc<number[], TransformedData, TransformProps>>(
        transformData,
      );
    const data = [1, 2];
    const props = {multiplier: 2};

    const {result, rerender} = renderHook(
      ({data, props}: {data: number[]; props: TransformProps}) =>
        useDataTransform(data, transform, props),
      {initialProps: {data, props}},
    );

    rerender({data: [3, 4], props});
    expect(result.current).toEqual({values: [6, 8]});

    rerender({data: [3, 4], props: {multiplier: 3}});
    expect(result.current).toEqual({values: [9, 12]});
    expect(transform).toHaveBeenCalledTimes(3);
  });
});
