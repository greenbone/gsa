/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {type Action, type ThunkDispatch} from '@reduxjs/toolkit';
import {connect} from 'react-redux';
import type Gmp from 'gmp/gmp';
import {type FilterType} from 'gmp/models/filter';
import {isDefined, hasValue} from 'gmp/utils/identity';
import {
  receivedDashboardData,
  receivedDashboardError,
  requestDashboardData,
} from 'web/store/dashboard/data/actions';
import getDashboardData from 'web/store/dashboard/data/selectors';
import compose from 'web/utils/compose';
import withGmp from 'web/utils/withGmp';
import withSubscription from 'web/utils/withSubscription';

export interface LoaderRenderProps<TData> {
  data?: TData;
  isLoading: boolean;
}

interface LoaderState<TData> {
  data?: TData;
}

interface LoaderProps<TData> {
  dataId: string;
  filter?: FilterType;
  subscriptions?: string[];
  children?: (props: LoaderRenderProps<TData>) => React.ReactNode;
}

interface LoaderPropsWithLoadFunc<
  TLoadFuncProps extends LoadFuncProps,
  TData,
> extends LoaderProps<TData> {
  load: (
    props: TLoadFuncProps & {dataId?: string},
  ) => (dispatch: LoaderDispatch, getState: GetStateFunc) => Promise<void>;
}

interface LoaderPropsWithLoad<TData> extends LoaderProps<TData> {
  data: TData;
  isLoading: boolean;
  load: () => void;
  subscribe: (subscription: string, callback: () => void) => () => void;
}

export interface LoadFuncProps {
  filter?: FilterType;
  gmp: Gmp;
}

type GetStateFunc = () => unknown;

type LoaderDispatch = ThunkDispatch<
  Record<string, unknown>,
  unknown,
  Action<string>
>;

export const createLoadFunc =
  <TProps extends LoadFuncProps, TData>(
    func: (props: TProps) => Promise<TData>,
    id: string,
  ) =>
  ({dataId = id, ...props}: TProps & {dataId?: string}) =>
  (dispatch: LoaderDispatch, getState: GetStateFunc) => {
    const rootState = getState();
    const state = getDashboardData(rootState);

    const {filter} = props;

    if (state.getIsLoading(dataId, filter)) {
      // we are already loading data
      return Promise.resolve();
    }

    dispatch(requestDashboardData(dataId, filter));

    const promise = func(props as TProps);
    return promise.then(
      data => {
        dispatch(receivedDashboardData(dataId, data, filter));
      },
      error => {
        dispatch(receivedDashboardError(dataId, error, filter));
      },
    );
  };

export class Loader<TData> extends React.Component<
  LoaderPropsWithLoad<TData>,
  LoaderState<TData>
> {
  subscriptions: (() => void)[];

  constructor(props: LoaderPropsWithLoad<TData>) {
    super(props);

    this.subscriptions = [];

    this.state = {};

    this.load = this.load.bind(this);
  }

  static getDerivedStateFromProps(props: LoaderPropsWithLoad<unknown>) {
    const {data} = props;
    if (isDefined(data)) {
      // Only update data if data is set and keep latest set data in state.

      // This avoids reloading data for the initial load.
      // At the initial load the filter is undefined.
      // After the initial load the default filter is set automatically.
      // When the default filter is set a re-load is started and the data from
      // the store is undefined again but actually the same data is loaded twice.
      // Therefore skip passing undefined data to the children.

      // If no data is loaded from the backend data is defined and an empty
      // array (or object).

      return {
        data,
      };
    }
    return null;
  }

  componentDidMount() {
    const {subscribe, subscriptions = [], data} = this.props;

    if (!hasValue(data)) {
      // only call load if we don't have data yet
      this.load();
    }

    for (const subscription of subscriptions) {
      this.subscriptions.push(subscribe(subscription, this.load));
    }
  }

  componentWillUnmount() {
    for (const unsubscribe of this.subscriptions) {
      unsubscribe();
    }
  }

  load() {
    this.props.load();
  }

  componentDidUpdate(prevProps: LoaderPropsWithLoad<TData>) {
    if (this.props.filter !== prevProps.filter) {
      this.load();
    }
  }

  render() {
    const {children, isLoading} = this.props;
    const {data} = this.state;
    return isDefined(children) ? children({data, isLoading}) : null;
  }
}

const mapStateToProps = (
  rootState: unknown,
  {dataId, filter}: {dataId: string; filter: FilterType},
) => {
  const state = getDashboardData(rootState);
  return {
    data: state.getData(dataId, filter),
    isLoading: state.getIsLoading(dataId, filter),
  };
};

const mapDispatchToProps = (dispatch, {load, ...props}) => ({
  load: () => dispatch(load(props)),
});

export default compose(
  withGmp,
  withSubscription,
  // @ts-expect-error
  connect(mapStateToProps, mapDispatchToProps),
)(Loader) as <TLoadFuncProps extends LoadFuncProps, TData>(
  props: LoaderPropsWithLoadFunc<TLoadFuncProps, TData>,
) => React.ReactNode;
