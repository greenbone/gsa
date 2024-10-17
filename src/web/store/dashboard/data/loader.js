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

export const loadFunc = (func, id) => {
  return props => async (dispatch, getState) => {
    const {dataId = id, filter} = props;
    const state = getDashboardData(getState());

    if (state.getIsLoading(dataId, filter)) {
      return;
    }

    dispatch(requestDashboardData(dataId, filter));

    try {
      const data = await func(props);
      dispatch(receivedDashboardData(dataId, data, filter));
    } catch (error) {
      dispatch(receivedDashboardError(dataId, error, filter));
    }
  };
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

  const [dataLocal, setDataLocal] = useState(initialData);
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
      subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
    };
  }, [initialData, subscriptions, subscribe, load]);

  useEffect(() => {
    if (isDefined(props.data)) {
      setDataLocal(props.data);
    }
  }, [props.data]);

  useEffect(() => {
    if (filter !== undefined && filter !== prevFilterRef.current) {
      load();
    }
    prevFilterRef.current = filter;
  }, [filter, load]);

  return isDefined(children) && children({data: dataLocal, isLoading});
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
    try {
      return dispatch(load(props));
    } catch (error) {
      /* empty */
    }
  },
});

export default compose(
  withGmp,
  withSubscription,
  connect(mapStateToProps, mapDispatchToProps),
)(Loader);
