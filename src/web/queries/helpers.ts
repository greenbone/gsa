/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export type RefetchIntervalFn<TData> = (
  data: TData | undefined,
) => number | false;

export const transformRefetchInterval =
  <TData>(refetchInterval: RefetchIntervalFn<TData>) =>
  (query: {state: {data: TData | undefined}}) =>
    refetchInterval(query.state.data);
