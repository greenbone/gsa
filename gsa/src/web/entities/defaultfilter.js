/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import {withRouter} from 'react-router-dom';

import Filter from 'gmp/models/filter';

import {isDefined} from 'gmp/utils/identity';

import {loadUserSettingsDefaultFilter} from 'web/store/usersettings/defaultfilters/actions';
import {getUserSettingsDefaultFilter} from 'web/store/usersettings/defaultfilters/selectors';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

/**
 * Component to provide an initial default filter for a child component
 *
 * If the current URL contains a filter parameter, this parameter is converted
 * into a filter model. Otherwise the default filter for the entityType is
 * loaded. Afterwards the filter is passed to the children function.
 */
class DefaultFilter extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      initial: true,
    };
  }

  componentDidMount() {
    if (isDefined(this.props.location.query.filter)) {
      this.setState({initial: false});
    } else {
      this.props
        .loadDefaultFilter()
        .then(() => this.setState({initial: false}));
    }
  }

  render() {
    const {initial} = this.state;
    const {children, defaultFilter, isLoading} = this.props;
    const {filter: filterString} = this.props.location.query;

    // prefer filter from url over default filter
    const filter = isDefined(filterString)
      ? Filter.fromString(filterString)
      : defaultFilter;

    return isDefined(filter) || (!isLoading && !initial)
      ? children({filter})
      : null;
  }
}

DefaultFilter.propTypes = {
  children: PropTypes.func.isRequired,
  defaultFilter: PropTypes.filter,
  isLoading: PropTypes.bool,
  loadDefaultFilter: PropTypes.func.isRequired,
};

const mapStateToProps = (rootState, {entityType}) => {
  const defaultFilterSelector = getUserSettingsDefaultFilter(
    rootState,
    entityType,
  );
  return {
    defaultFilter: defaultFilterSelector.getFilter(),
    isLoading: defaultFilterSelector.isLoading(),
  };
};

const mapDispatchToProps = (dispatch, {gmp, entityType}) => ({
  loadDefaultFilter: () =>
    dispatch(loadUserSettingsDefaultFilter(gmp)(entityType)),
});

export default compose(
  withRouter,
  withGmp,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(DefaultFilter);
