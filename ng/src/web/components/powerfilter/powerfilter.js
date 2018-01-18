/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import glamorous from 'glamorous';

import _ from 'gmp/locale.js';
import {KeyCode, is_defined, is_string} from 'gmp/utils.js';
import logger from 'gmp/log.js';

import PropTypes from '../../utils/proptypes.js';
import {render_select_items} from '../../utils/render.js';

import Select from '../form/select.js';
import TextField from '../form/textfield.js';

import DeleteIcon from '../icon/deleteicon.js';
import EditIcon from '../icon/editicon.js';
import Icon from '../icon/icon.js';
import ManualIcon from '../icon/manualicon.js';
import NewIcon from '../icon/newicon.js';

import Divider from '../layout/divider.js';
import IconDivider from '../layout/icondivider.js';
import Layout from '../layout/layout.js';

import Filter from 'gmp/models/filter.js';

const log = logger.getLogger('web.powerfilter');

const DEFAULT_FILTER_ID = '0';

const FilterSelect = glamorous(Select)({
  width: '150px',
});

const Label = glamorous.label({
  marginRight: '5px',
});

const LeftDivider = glamorous(Divider)({
  marginRight: '5px',
});

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

    if (!is_defined(this.state.filter)) {
      // filter hasn't been loaded yet
      return;
    }

    if (onUpdate) {
      onUpdate(filter);
    }

    let userfilter;

    if (is_defined(filter) && is_defined(filter.toFilterCriteriaString)) {
      userfilter = filter.toFilterCriteriaString();
    }
    else if (is_string(filter)) {
      userfilter = filter;
    }
    else {
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

    const filter = filters.find(f => f.id === value);

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

  createFilter(filter) {
    const {filtername = ''} = this.state;
    const {createFilterType, onError, onFilterCreated} = this.props;
    const {gmp} = this.context;

    gmp.filter.create({
      term: filter.toFilterString(),
      type: createFilterType,
      name: filtername,
    }).then(response => {
      const {data: f} = response;
      this.updateFilter(f);
      this.setState({filtername: ''});

      if (onFilterCreated) {
        onFilterCreated(f);
      }
    }, err => {
      if (is_defined(onError)) {
        onError(err);
      }
      else {
        log.error(err);
      }
    });
  }

  componentWillReceiveProps(props) {
    const {filter, filters} = props;
    const {filter: state_filter} = this.state;

    this.setState({
      filters,
    });

    if (!is_defined(filter)) {
      this.setState({
        filter,
        userfilter: '',
      });
    }
    else if (
      !is_defined(state_filter) ||
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
    const {capabilities} = this.context;
    const {userfilter = '', filter, filtername = ''} = this.state;
    const {filters, onEditClick, onResetClick} = this.props;
    const namedfilterid = is_defined(filter) && is_defined(filter.id) ?
      filter.id : DEFAULT_FILTER_ID;

    const filter_items = render_select_items(filters, DEFAULT_FILTER_ID);

    const can_create = capabilities.mayCreate('filter') &&
      filtername.trim().length > 0;

    return (
      <Layout
        flex="column"
        align={['start', 'stetch']}
        className="powerfilter"
      >
        <Layout flex align={['space-between', 'center']}>
          <LeftDivider align={['start', 'center']}>
            <Layout flex align={['start', 'center']}>
              <Label>
                <b>{_('Filter')}</b>
              </Label>
              <TextField
                name="userfilter"
                size="53"
                maxLength="1000"
                value={userfilter}
                onKeyDown={this.handleUserFilterKeyPress}
                onChange={this.handleValueChange}/>
            </Layout>
            <IconDivider flex align={['start', 'center']}>
              <Icon
                img="refresh.svg"
                title={_('Update Filter')}
                onClick={this.handleUpdateFilter}/>

              {onResetClick &&
                <DeleteIcon
                  img="delete.svg"
                  title={_('Reset Filter')}
                  active={is_defined(filter)}
                  onClick={is_defined(filter) ? onResetClick : undefined}
                />
              }

              <ManualIcon
                title={_('Help: Powerfilter')}
                page="gui_introduction"
                anchor="powerfilter"
              />

              {onEditClick &&
                <EditIcon
                  title={_('Edit Filter')}
                  active={is_defined(filter)}
                  onClick={is_defined(filter) ? onEditClick : undefined}/>
              }
            </IconDivider>
          </LeftDivider>
          <Divider align={['end', 'center']}>
            {capabilities.mayCreate('filter') &&
              <TextField
                name="filtername"
                size="10"
                maxLength="80"
                value={filtername}
                onChange={this.handleValueChange}/>
            }
            {can_create ?
              <NewIcon
                title={_('Create new filter from current term')}
                onClick={this.handleCreateFilter}/> :
              <Icon
                img="new_inactive.svg"
                title={_('Please insert a filter name')}/>
            }
            {capabilities.mayAccess('filters') &&
              <FilterSelect
                items={filter_items}
                value={namedfilterid}
                menuPosition="right"
                onChange={this.handleNamedFilterChange}
              />
            }
          </Divider>
        </Layout>
      </Layout>
    );
  }
}

PowerFilter.propTypes = {
  createFilterType: PropTypes.string,
  filter: PropTypes.filter,
  filters: PropTypes.array,
  onEditClick: PropTypes.func,
  onError: PropTypes.func,
  onFilterCreated: PropTypes.func,
  onResetClick: PropTypes.func,
  onUpdate: PropTypes.func,
};

PowerFilter.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
  capabilities: PropTypes.capabilities.isRequired,
};

export default PowerFilter;

// vim: set ts=2 sw=2 tw=80:
