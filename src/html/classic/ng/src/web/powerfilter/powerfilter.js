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

import _ from '../../locale.js';
import {KeyCode, autobind, is_defined} from '../../utils.js';
import logger from '../../log.js';

import Layout from '../components/layout/layout.js';

import FootNote from '../footnote.js';
import PropTypes from '../proptypes.js';
import {render_options} from '../render.js';

import IconDivider from '../components/layout/icondivider.js';

import DeleteIcon from '../icons/deleteicon.js';
import EditIcon from '../icons/editicon.js';
import Icon from '../icons/icon.js';
import HelpIcon from '../icons/helpicon.js';
import NewIcon from '../icons/newicon.js';

import FormGroup from '../form/formgroup.js';
import Select2 from '../form/select2.js';
import TextField from '../form/textfield.js';

import Filter from '../../gmp/models/filter.js';

import './css/powerfilter.css';

const log = logger.getLogger('web.powerfilter');

const DEFAULT_FILTER_ID = '0';

export class PowerFilter extends React.Component {

  constructor(...args) {
    super(...args);

    let {filter} = this.props;

    this.state = {
      filter: filter,
      userfilter: filter ? filter.toFilterCriteriaString() : '',
      filtername: '',
    };

    autobind(this, 'on');
  }

  updateFilter(filter) {
    let {onUpdate} = this.props;

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
    let {filters} = this.props;

    let filter = filters.find(f => f.id === value);

    this.updateFilter(filter);
  }

  onCreateFilter() {
    let {filter, userfilter = '', filtername = ''} = this.state;

    let {onCreateClick} = this.props;

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
    let {filtername = ''} = this.state;
    let {onFilterCreated} = this.props;

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
    let {filter, filters} = props;

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
    let {capabilities} = this.context;
    let {userfilter = '', filter, filtername = ''} = this.state;
    let {filters, onEditClick, onResetClick} = this.props;
    let namedfilterid = filter && filter.id ? filter.id : DEFAULT_FILTER_ID;

    let filterstring = filter ? filter.toFilterExtraString() : '';

    let filter_opts = render_options(filters, DEFAULT_FILTER_ID);

    let can_create = capabilities.mayOp('create_filter') &&
      filtername.trim().length > 0;

    return (
      <Layout flex align={['end', 'center']}
        className="powerfilter">
        <Layout flex="column" align={['center', 'start']}>
          <Layout flex align={['end', 'center']}>
            <FormGroup flex align={['start', 'center']}>
              <label className="control-label">
                <b>{_('Filter')}</b>
              </label>
              <TextField
                name="userfilter"
                size="53"
                maxLength="1000"
                value={userfilter}
                onKeyDown={this.onUserFilterKeyPress}
                onChange={this.onValueChange}/>
            </FormGroup>
            <FormGroup flex>
              <IconDivider flex align={['start', 'center']}>
                <Icon img="refresh.svg" title={_('Update Filter')}
                  onClick={this.onUpdateFilter}/>

                {onResetClick &&
                  <DeleteIcon
                    img="delete.svg"
                    title={_('Reset Filter')}
                    active={is_defined(filter)}
                    onClick={is_defined(filter) ?
                        this.onResetClick : undefined}/>
                }

                <HelpIcon page="powerfilter" />

                {onEditClick &&
                  <EditIcon
                    title={_('Edit Filter')}
                    active={is_defined(filter)}
                    onClick={is_defined(filter) ? onEditClick : undefined}/>
                }
              </IconDivider>
            </FormGroup>
            <FormGroup flex align={['start', 'center']}>
              {capabilities.mayOp('create_filter') &&
                <TextField
                  name="filtername"
                  size="10"
                  maxLength="80"
                  value={filtername}
                  onChange={this.onValueChange}/>
              }
            </FormGroup>
            <FormGroup flex align={['start', 'center']}>
              {can_create ?
                <NewIcon
                  title={_('Create new filter from current term')}
                  onClick={this.onCreateFilter}/> :
                <Icon img="new_inactive.svg"
                  title={_('Please insert a filter name')}/>
                }
            </FormGroup>
            <FormGroup flex align={['start', 'center']}>
              {capabilities.mayOp('get_filters') &&
                <Select2 value={namedfilterid}
                  onChange={this.onNamedFilterChange}>
                  {filter_opts}
                </Select2>
              }
            </FormGroup>
          </Layout>
          <FootNote>
            {filterstring}
          </FootNote>
        </Layout>
      </Layout>
    );
  }
}

PowerFilter.propTypes = {
  filter: PropTypes.filter,
  filters: PropTypes.arrayLike,
  onResetClick: PropTypes.func,
  onEditClick: PropTypes.func,
  onCreateClick: PropTypes.func,
  onUpdate: PropTypes.func,
  onFilterCreated: PropTypes.func,
};

PowerFilter.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
  capabilities: PropTypes.capabilities.isRequired,
};

export default PowerFilter;

// vim: set ts=2 sw=2 tw=80:
