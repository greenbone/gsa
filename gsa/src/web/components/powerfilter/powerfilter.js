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

class PowerFilter extends React.Component {
  constructor(...args) {
    super(...args);

    const {filter} = this.props;

    this.state = {
      filter: filter,
      userfilter: filter ? filter.toFilterCriteriaString() : '',
      filtername: '',
    };

    this.handleCreateFilter = this.handleCreateFilter.bind(this);
    this.handleNamedFilterChange = this.handleNamedFilterChange.bind(this);
    this.handleUpdateFilter = this.handleUpdateFilter.bind(this);
    this.handleUserFilterKeyPress = this.handleUserFilterKeyPress.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
  }

  updateFilter(filter) {
    const {onUpdate} = this.props;

    if (!isDefined(this.state.filter)) {
      // filter hasn't been loaded yet
      return;
    }

    if (onUpdate) {
      onUpdate(filter);
    }

    let userfilter;

    if (isDefined(filter) && isDefined(filter.toFilterCriteriaString)) {
      userfilter = filter.toFilterCriteriaString();
    } else if (isString(filter)) {
      userfilter = filter;
    } else {
      userfilter = '';
    }

    this.setState({
      filter,
      userfilter,
    });
  }

  updateFromUserFilter() {
    let {userfilter, filter} = this.state;

    filter = Filter.fromString(userfilter, filter);

    this.updateFilter(filter);
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

  handleCreateFilter() {
    let {filter, userfilter = '', filtername = ''} = this.state;

    if (filtername.trim().length === 0) {
      return;
    }

    filter = Filter.fromString(userfilter, filter);

    this.createFilter(filter);
  }

  componentWillReceiveProps(props) {
    const {filter, filters} = props;
    const {filter: state_filter} = this.state;

    this.setState({
      filters,
    });

    if (!isDefined(filter)) {
      this.setState({
        filter,
        userfilter: '',
      });
    } else if (
      !isDefined(state_filter) ||
      filter.id !== state_filter.id ||
      !filter.equals(this.state.filter)
    ) {
      this.setState({
        filter,
        userfilter: filter.toFilterCriteriaString(),
      });
    }
  }

  render() {
    const {userfilter = '', filter} = this.state;
    const {
      capabilities,
      filters,
      onEditClick,
      onRemoveClick,
      onResetClick,
    } = this.props;
    const namedfilterid =
      isDefined(filter) && isDefined(filter.id) ? filter.id : DEFAULT_FILTER_ID;

    const filter_items = renderSelectItems(filters, DEFAULT_FILTER_ID);

    return (
      <Layout flex="column" align={['start', 'stetch']} className="powerfilter">
        <Layout align={['space-between', 'center']}>
          <LeftDivider align={['start', 'center']}>
            <Layout align={['start', 'center']}>
              <Label>
                <b>{_('Filter')}</b>
              </Label>
              <TextField
                name="userfilter"
                size="53"
                maxLength="1000"
                value={userfilter}
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
                  onClick={isDefined(filter) ? onRemoveClick : undefined}
                />
              )}
              {onResetClick && (
                <ResetIcon
                  title={_('Reset to Default Filter')}
                  active={isDefined(filter)}
                  onClick={isDefined(filter) ? onResetClick : undefined}
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
              items={filter_items}
              menuPosition="right"
              toolTipTitle={_('Loaded filter')}
              value={namedfilterid}
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
