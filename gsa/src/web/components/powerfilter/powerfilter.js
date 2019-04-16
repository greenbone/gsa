/* Copyright (C) 2016-2019 Greenbone Networks GmbH
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

import styled from 'styled-components';

import _ from 'gmp/locale';

import Filter, {RESET_FILTER} from 'gmp/models/filter';

import {KeyCode} from 'gmp/utils/event';
import {isDefined, isString} from 'gmp/utils/identity';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';
import withCapabilities from 'web/utils/withCapabilities';
import withGmp from 'web/utils/withGmp';

import Select from 'web/components/form/select';
import TextField from 'web/components/form/textfield';

import DeleteIcon from 'web/components/icon/deleteicon';
import EditIcon from 'web/components/icon/editicon';
import ManualIcon from 'web/components/icon/manualicon';
import RefreshIcon from '../icon/refreshicon';
import ResetIcon from '../icon/reseticon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';

const DEFAULT_FILTER_ID = '0';

const Label = styled.label`
  margin-right: 5px;
`;

const LeftDivider = styled(Divider)`
  margin-right: 5px;
`;

const getUserFilterString = filter => {
  if (isDefined(filter) && isDefined(filter.toFilterCriteriaString)) {
    return filter.toFilterCriteriaString();
  }
  if (isString(filter)) {
    return filter;
  }
  return '';
};

class PowerFilter extends React.Component {
  constructor(...args) {
    super(...args);

    const {filter} = this.props;

    this.state = {
      filtername: '',
      userFilterString: getUserFilterString(filter),
    };

    this.handleNamedFilterChange = this.handleNamedFilterChange.bind(this);
    this.handleUpdateFilter = this.handleUpdateFilter.bind(this);
    this.handleUserFilterKeyPress = this.handleUserFilterKeyPress.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleRemoveClick = this.handleRemoveClick.bind(this);
    this.handleResetClick = this.handleResetClick.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    const {filter} = props;
    const {prevFilter} = state;
    if (filter !== prevFilter) {
      if (
        !isDefined(filter) ||
        (isDefined(filter) && !isDefined(prevFilter)) ||
        (isDefined(filter) && filter.id !== prevFilter.id) ||
        (isDefined(filter) && !filter.equals(prevFilter))
      ) {
        return {
          userFilterString: getUserFilterString(props.filter),
          prevFilter: props.filter,
        };
      }
    }
    return null;
  }

  updateFilter(filter) {
    const {onUpdate} = this.props;

    if (onUpdate) {
      onUpdate(filter);
    }
  }

  updateFromUserFilter() {
    const {filter} = this.props;
    const {userFilterString} = this.state;

    this.updateFilter(Filter.fromString(userFilterString, filter));
  }

  resetUserFilterString() {
    const {filter} = this.props;

    this.setState({
      userFilterString: getUserFilterString(filter),
    });
  }

  handleValueChange(value, name) {
    this.setState({[name]: value});
  }

  handleUpdateFilter() {
    this.updateFromUserFilter();
  }

  handleUserFilterKeyPress(event) {
    if (event.keyCode === KeyCode.ENTER) {
      this.updateFromUserFilter();
    }
  }

  handleNamedFilterChange(value) {
    const {filters} = this.props;

    let filter = filters.find(f => f.id === value);
    if (!isDefined(filter)) {
      filter = RESET_FILTER;
    }
    this.updateFilter(filter);
  }

  handleRemoveClick() {
    const {onRemoveClick} = this.props;

    if (isDefined(onRemoveClick)) {
      onRemoveClick();
    }

    this.resetUserFilterString();
  }

  handleResetClick() {
    const {onResetClick} = this.props;

    if (isDefined(onResetClick)) {
      onResetClick();
    }

    this.resetUserFilterString();
  }

  render() {
    const {userFilterString = ''} = this.state;
    const {
      capabilities,
      filter,
      filters,
      onEditClick,
      onRemoveClick,
      onResetClick,
    } = this.props;
    return (
      <Layout flex="column" align={['start', 'stetch']} className="powerfilter">
        <Layout align={['space-between', 'center']}>
          <LeftDivider align={['start', 'center']}>
            <Layout align={['start', 'center']}>
              <Label>
                <b>{_('Filter')}</b>
              </Label>
              <TextField
                name="userFilterString"
                size="53"
                maxLength="1000"
                value={userFilterString}
                onKeyDown={this.handleUserFilterKeyPress}
                onChange={this.handleValueChange}
              />
            </Layout>
            <IconDivider align={['start', 'center']}>
              <RefreshIcon
                title={_('Update Filter')}
                onClick={this.handleUpdateFilter}
              />

              {onRemoveClick && (
                <DeleteIcon
                  title={_('Remove Filter')}
                  active={isDefined(filter)}
                  onClick={
                    isDefined(filter) ? this.handleRemoveClick : undefined
                  }
                />
              )}
              {onResetClick && (
                <ResetIcon
                  title={_('Reset to Default Filter')}
                  active={isDefined(filter)}
                  onClick={
                    isDefined(filter) ? this.handleResetClick : undefined
                  }
                />
              )}

              <ManualIcon
                title={_('Help: Powerfilter')}
                page="gui_introduction"
                anchor="powerfilter"
              />

              {onEditClick && (
                <EditIcon
                  title={_('Edit Filter')}
                  active={isDefined(filter)}
                  onClick={isDefined(filter) ? onEditClick : undefined}
                />
              )}
            </IconDivider>
          </LeftDivider>
          {capabilities.mayAccess('filters') && (
            <Select
              items={renderSelectItems(filters, DEFAULT_FILTER_ID)}
              menuPosition="right"
              toolTipTitle={_('Loaded filter')}
              value={
                isDefined(filter) && isDefined(filter.id)
                  ? filter.id
                  : DEFAULT_FILTER_ID
              }
              width="150px"
              onChange={this.handleNamedFilterChange}
            />
          )}
        </Layout>
      </Layout>
    );
  }
}

PowerFilter.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  createFilterType: PropTypes.string,
  filter: PropTypes.filter,
  filters: PropTypes.array,
  gmp: PropTypes.gmp.isRequired,
  onEditClick: PropTypes.func,
  onError: PropTypes.func,
  onFilterCreated: PropTypes.func,
  onRemoveClick: PropTypes.func,
  onResetClick: PropTypes.func,
  onUpdate: PropTypes.func,
};

export default compose(
  withCapabilities,
  withGmp,
)(PowerFilter);

// vim: set ts=2 sw=2 tw=80:
