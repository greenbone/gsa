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
import {KeyCode, is_defined} from 'gmp/utils.js';
import logger from 'gmp/log.js';

import PropTypes from '../../utils/proptypes.js';
import {render_options} from '../../utils/render.js';

import FootNote from '../footnote/footnote.js';

import Select2 from '../form/select2.js';
import TextField from '../form/textfield.js';

import DeleteIcon from '../icon/deleteicon.js';
import EditIcon from '../icon/editicon.js';
import Icon from '../icon/icon.js';
import HelpIcon from '../icon/helpicon.js';
import NewIcon from '../icon/newicon.js';

import Divider from '../layout/divider.js';
import IconDivider from '../layout/icondivider.js';
import Layout from '../layout/layout.js';

import Filter from 'gmp/models/filter.js';

const log = logger.getLogger('web.powerfilter');

const DEFAULT_FILTER_ID = '0';

const StyledFootNote = glamorous(FootNote)({
  marginTop: '5px',
});

const FilterSelect = glamorous(Select2)({
  '& .select2-container': {
    minWidth: '100px',
  },
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

    this.onCreateFilter = this.onCreateFilter.bind(this);
    this.onNamedFilterChange = this.onNamedFilterChange.bind(this);
    this.onResetClick = this.onResetClick.bind(this);
    this.onUpdateFilter = this.onUpdateFilter.bind(this);
    this.onUserFilterKeyPress = this.onUserFilterKeyPress.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
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

    this.setState({
      filter,
      userfilter: filter ? filter.toFilterCriteriaString() : '',
    });
  }

  updateFromUserFilter() {
    let {userfilter, filter} = this.state;

    filter = Filter.fromString(userfilter, filter);

    this.updateFilter(filter);
  }

  onValueChange(value, name) {
    this.setState({[name]: value});
  }

  onUpdateFilter() {
    this.updateFromUserFilter();
  }

  onUserFilterKeyPress(event) {
    if (event.keyCode === KeyCode.ENTER) {
      this.updateFromUserFilter();
    }
  }

  onResetClick() {
    if (this.props.onResetClick) {
      this.props.onResetClick();
    }
  }

  onNamedFilterChange(value) {
    const {filters} = this.props;

    const filter = filters.find(f => f.id === value);

    this.updateFilter(filter);
  }

  onCreateFilter() {
    let {filter, userfilter = '', filtername = ''} = this.state;

    const {onCreateClick} = this.props;

    if (userfilter.trim().length === 0 || filtername.trim().length === 0) {
      return;
    }

    filter = Filter.fromString(userfilter, filter);

    if (onCreateClick) {
      onCreateClick(filter);
    }
    else {
      this.createFilter(filter);
    }
  }

  createFilter(filter) {
    const {filtername = ''} = this.state;
    const {onFilterCreated} = this.props;

    if (this.context.gmp) {
      this.context.gmp.filter.create({
        term: filter.toFilterString(),
        type: 'task',
        name: filtername,
      }).then(f => {
        this.updateFilter(f);
        this.setState({filtername: ''});

        if (onFilterCreated) {
          onFilterCreated(f);
        }
      }, err => {
        log.error(err);
      });
    }
  }

  componentWillReceiveProps(props) {
    const {filter, filters} = props;

    this.setState({
      filters,
    });

    if (is_defined(filter) && !filter.equals(this.state.filter)) {
      this.setState({
        filter,
        userfilter: filter ? filter.toFilterCriteriaString() : '',
      });
    }
  }

  render() {
    const {capabilities} = this.context;
    const {userfilter = '', filter, filtername = ''} = this.state;
    const {filters, onEditClick, onResetClick} = this.props;
    const namedfilterid = filter && filter.id ? filter.id : DEFAULT_FILTER_ID;

    const filterstring = filter ? filter.toFilterExtraString() : '';

    const filter_opts = render_options(filters, DEFAULT_FILTER_ID);

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
                onKeyDown={this.onUserFilterKeyPress}
                onChange={this.onValueChange}/>
            </Layout>
            <IconDivider flex align={['start', 'center']}>
              <Icon
                img="refresh.svg"
                title={_('Update Filter')}
                onClick={this.onUpdateFilter}/>

              {onResetClick &&
                <DeleteIcon
                  img="delete.svg"
                  title={_('Reset Filter')}
                  active={is_defined(filter)}
                  onClick={is_defined(filter) ? this.onResetClick : undefined}
                />
              }

              <HelpIcon page="powerfilter" />

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
                onChange={this.onValueChange}/>
            }
            {can_create ?
              <NewIcon
                title={_('Create new filter from current term')}
                onClick={this.onCreateFilter}/> :
              <Icon
                img="new_inactive.svg"
                title={_('Please insert a filter name')}/>
            }
            {capabilities.mayAccess('filters') &&
              <FilterSelect
                value={namedfilterid}
                onChange={this.onNamedFilterChange}>
                {filter_opts}
              </FilterSelect>
            }
          </Divider>
        </Layout>
        <StyledFootNote>
          {filterstring}
        </StyledFootNote>
      </Layout>
    );
  }
}

PowerFilter.propTypes = {
  filter: PropTypes.filter,
  filters: PropTypes.arrayLike,
  onCreateClick: PropTypes.func,
  onEditClick: PropTypes.func,
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
