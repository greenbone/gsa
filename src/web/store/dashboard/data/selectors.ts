/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type FilterType} from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import {filterIdentifier} from 'web/store/utils';

interface DashboardDataEntry<TData = unknown> {
  data?: TData;
  error?: Error;
  isLoading: boolean;
}

type DashboardDataState<TData = unknown> = Record<
  string,
  Record<string, DashboardDataEntry<TData>>
>;

interface RootState<TData = unknown> {
  dashboardData?: DashboardDataState<TData>;
}

class DashboardData<TData = unknown> {
  private state?: DashboardDataState<TData>;

  constructor(rootState?: DashboardDataState<TData>) {
    this.state = rootState;
  }

  private _getById(
    id: string,
    filter?: FilterType,
  ): DashboardDataEntry<TData> | undefined {
    if (isDefined(this.state)) {
      const state = this.state[id];
      if (!isDefined(state)) {
        return undefined;
      }
      const filterString = filterIdentifier(filter);
      return state[filterString];
    }
    return undefined;
  }

  getIsLoading(id: string, filter?: FilterType) {
    const state = this._getById(id, filter);
    return isDefined(state) ? state.isLoading : false;
  }

  getError(id: string, filter?: FilterType) {
    const state = this._getById(id, filter);
    return isDefined(state) ? state.error : undefined;
  }

  getData(id: string, filter?: FilterType) {
    const state = this._getById(id, filter);
    return isDefined(state) ? state.data : undefined;
  }
}

const getDashboardData = <TData = unknown>(
  rootState?: unknown,
): DashboardData<TData> => {
  const dashboardData = isDefined(rootState)
    ? (rootState as RootState<TData>).dashboardData
    : undefined;

  return new DashboardData<TData>(dashboardData);
};

export default getDashboardData;
