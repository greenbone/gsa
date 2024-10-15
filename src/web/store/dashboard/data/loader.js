/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useEffect, useRef} from 'react';

import {connect} from 'react-redux';

import {isDefined, hasValue} from 'gmp/utils/identity';

import compose from '../../../utils/compose';
import withGmp from '../../../utils/withGmp';
import withSubscription from '../../../utils/withSubscription';
import PropTypes from '../../../utils/proptypes';

import {
  receivedDashboardData,
  receivedDashboardError,
  requestDashboardData,
} from './actions';

import getDashboardData from './selectors';

export const loaderPropTypes = {
  children: PropTypes.func,
  filter: PropTypes.filter,
};

export const loadFunc =
  (func, id) =>
  ({dataId = id, ...props}) =>
  (dispatch, getState) => {
    const rootState = getState();
    const state = getDashboardData(rootState);

    const {filter} = props;

    if (state.getIsLoading(dataId, filter)) {
      // we are already loading data
      return Promise.resolve();
    }

    dispatch(requestDashboardData(dataId, filter));

    const promise = func(props);
    return promise.then(
      data => dispatch(receivedDashboardData(dataId, data, filter)),
      error => dispatch(receivedDashboardError(dataId, error, filter)),
    );
  };

export const Loader = props => {
  const {
    subscribe,
    subscriptions = [],
    data: initialData,
    load,
    filter,
    children,
    isLoading,
  } = props;
  const [data, setData] = useState(initialData);
  const subscriptionsRef = useRef([]);
  const prevFilterRef = useRef();

  useEffect(() => {
    if (!hasValue(initialData)) {
      load();
    }

    subscriptionsRef.current = subscriptions.map(subscription =>
      subscribe(subscription, load),
    );
    return () => {
      subscriptionsRef.current.forEach(unsub => unsub());
    };
  }, [initialData, subscriptions, subscribe, load]);

  useEffect(() => {
    if (isDefined(props.data)) {
      setData(props.data);
    }
  }, [props.data]);

  useEffect(() => {
    if (filter !== undefined && filter !== prevFilterRef.current) {
      load();
    }
    prevFilterRef.current = filter;
  }, [filter, load]);

  return isDefined(children) && children({data, isLoading});
};

Loader.propTypes = {
  children: PropTypes.func,
  data: PropTypes.any,
  dataId: PropTypes.string.isRequired,
  filter: PropTypes.filter,
  isLoading: PropTypes.bool.isRequired,
  load: PropTypes.func.isRequired,
  subscribe: PropTypes.func.isRequired,
  subscriptions: PropTypes.arrayOf(PropTypes.string),
};

const mapStateToProps = (rootState, {dataId, filter}) => {
  const state = getDashboardData(rootState);
  return {
    data: state.getData(dataId, filter),
    isLoading: state.getIsLoading(dataId, filter),
  };
};

const mapDispatchToProps = (dispatch, {load, ...props}) => ({
  load: () => {
    return dispatch(load(props));
  },
});

export default compose(
  withGmp,
  withSubscription,
  connect(mapStateToProps, mapDispatchToProps),
)(Loader);

// vim: set ts=2 sw=2 tw=80:
