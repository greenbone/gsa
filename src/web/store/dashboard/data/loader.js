/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined, hasValue} from 'gmp/utils/identity';
import React from 'react';
import {connect} from 'react-redux';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import withGmp from 'web/utils/withGmp';
import withSubscription from 'web/utils/withSubscription';

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

class Loader extends React.Component {
  constructor(...args) {
    super(...args);

    this.subscriptions = [];

    this.state = {};

    this.load = this.load.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
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

  componentDidUpdate(prevProps) {
    if (this.props.filter !== prevProps.filter) {
      this.load();
    }
  }

  render() {
    const {children, isLoading} = this.props;
    const {data} = this.state;
    return isDefined(children) && children({data, isLoading});
  }
}

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
  load: () => dispatch(load(props)),
});

export default compose(
  withGmp,
  withSubscription,
  connect(mapStateToProps, mapDispatchToProps),
)(Loader);
