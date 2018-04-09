/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import {connect} from 'react-redux';

import {is_defined} from 'gmp/utils/identity';

import compose from '../../../utils/compose';
import withGmp from '../../../utils/withGmp';
import withSubscription from '../../../utils/withSubscription';
import PropTypes from '../../../utils/proptypes';

import {
  receivedDashboardData,
  receivedDashboardError,
  requestDashboardData,
} from './actions';

import {getDashboardDataById, getIsLoading, getData} from './selectors';

export const loadFunc = (func, id) => ({dataId = id, ...props}) =>
  (dispatch, getState) => {
  const rootState = getState();
  const state = getDashboardDataById(rootState, dataId);

  if (getIsLoading(state)) {
    // we are already loading data
    return Promise.resolve();
  }

  dispatch(requestDashboardData(dataId));

  const promise = func(props);
  return promise.then(
    data => dispatch(receivedDashboardData(dataId, data)),
    error => dispatch(receivedDashboardError(dataId, error)),
  );
};

class Loader extends React.Component {

  constructor(...args) {
    super(...args);

    this.subscriptions = [];

    this.load = this.load.bind(this);
  }

  componentDidMount() {
    const {subscribe, subscriptions = []} = this.props;

    this.load();

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
    const {
      subscribe,
      subscriptions,
      dispatch,
      load,
      ...props
    } = this.props;


    dispatch(load(props));
  }

  componentDidUpdate(prevProps) {
    if (this.props.filter !== prevProps.filter) {
      this.load();
    }
  }

  render() {
    const {children, data, isLoading} = this.props;
    return is_defined(children) && children({data, isLoading});
  }
}

Loader.propTypes = {
  children: PropTypes.func,
  data: PropTypes.any,
  dataId: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  filter: PropTypes.filter,
  gmp: PropTypes.gmp.isRequired,
  isLoading: PropTypes.bool.isRequired,
  load: PropTypes.func.isRequired,
  subscribe: PropTypes.func.isRequired,
  subscriptions: PropTypes.arrayOf(PropTypes.string),
};

const mapStateToProps = (rootState, {dataId}) => {
  const state = getDashboardDataById(rootState, dataId);
  return {
    data: getData(state),
    isLoading: getIsLoading(state),
  };
};

export default compose(
  withGmp,
  withSubscription,
  connect(mapStateToProps),
)(Loader);

// vim: set ts=2 sw=2 tw=80:
