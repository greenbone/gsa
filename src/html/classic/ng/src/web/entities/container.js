/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import logger from '../../log.js';
import {is_defined, exclude, includes} from '../../utils.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';
import SelectionType from '../selectiontype.js';

import Download from '../form/download.js';

import Filter from '../../gmp/models/filter.js';

const log = logger.getLogger('web.entities.container');

const exclude_props = [
  // these props are consumed here and must not be passed to the children
  'children',
  'component',
  'gmpname',
  'filtersFilter',
];

class EntitiesContainer extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      selection_type: SelectionType.SELECTION_PAGE_CONTENTS,
    };

    this.load = this.load.bind(this);
    this.reload = this.reload.bind(this);
    this.handleSelected = this.handleSelected.bind(this);
    this.handleDeselected = this.handleDeselected.bind(this);
    this.handleTimer = this.handleTimer.bind(this);
    this.handleSelectionTypeChange = this.handleSelectionTypeChange.bind(this);
    this.handleDeleteBulk = this.handleDeleteBulk.bind(this);
    this.handleDownloadBulk = this.handleDownloadBulk.bind(this);
    this.handleDeleteEntity = this.handleDeleteEntity.bind(this);
    this.handleCloneEntity = this.handleCloneEntity.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
  }

  componentDidMount() {
    let {gmp} = this.context;
    let filter_string = this.props.location.query.filter;
    let filter;

    this.command = gmp[this.props.gmpname];
    this.refresh = gmp.globals.refresh;

    if (filter_string) {
      filter = Filter.fromString(filter_string);
    }

    this.load(filter, {refresh: 1}); // use data from cache and reload after 1 sec
    this.loadFilters();
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  load(filter, options = {}) {
    let {cache = true, force = false, refresh} = options;
    let {command} = this;

    this.clearTimer(); // remove possible running timer

    command.get({filter}, {cache, force}).then(entities => {
      let {selection_type} = this.state;

      filter = entities.getFilter();

      this.setState({entities, filter});

      if (selection_type !== SelectionType.SELECTION_USER) {
        this.setState({selected: entities});
      }

      this.startTimer(refresh);
    });
  }

  loadFilters() {
    let {gmp} = this.context;
    let {filtersFilter} = this.props;

    if (!filtersFilter) {
      return;
    }

    gmp.filters.get({filter: filtersFilter}, {cache: true})
      .then(filters => {
        // display cached filters
        this.setState({filters});
        // reload all filters from backend
        return gmp.filters.get({filter: filtersFilter},
          {cache: true, force: true});
      }).then(filters => {
        this.setState({filters});
      });
  }

  reload() {
    // reload data from backend
    this.load(this.state.filter, {cache: true, force: true});
  }

  startTimer(refresh) {
    refresh = is_defined(refresh) ? refresh : this.refresh;
    if (refresh) {
      this.timer = window.setTimeout(this.handleTimer, refresh * 1000);
      log.debug('Started reload timer with id', this.timer, 'and interval',
        refresh);
    }
  }

  clearTimer() {
    if (is_defined(this.timer)) {
      log.debug('Clearing reload timer with id', this.timer);
      window.clearTimeout(this.timer);
    }
  }

  handleTimer() {
    this.timer = undefined;
    this.reload();
  }

  handleSelectionTypeChange(selection_type) {
    let {entities} = this.state;
    let selected;

    if (selection_type === SelectionType.SELECTION_USER) {
      selected = new Set();
    }
    else {
      selected = entities;
    }

    this.setState({selection_type, selected});
  }

  handleDownloadBulk(filename = 'export.xml') {
    let {command} = this;
    let {selected, selection_type, filter} = this.state;
    let promise;

    if (selection_type === SelectionType.SELECTION_USER) {
      promise = command.export(selected);
    }
    else if (selection_type === SelectionType.SELECTION_PAGE_CONTENTS) {
      promise = command.exportByFilter(filter);
    }
    else {
      promise = command.exportByFilter(filter.all());
    }

    promise.then(xhr => {
      this.download.setFilename(filename);
      this.download.setData(xhr.responseText);
      this.download.download();
    }, err => log.error(err));
  }

  handleDeleteBulk() {
    let {command} = this;
    let {selected, selection_type} = this.state;
    let promise;

    if (selection_type === SelectionType.SELECTION_FILTER) {
      let filter = this.state.filter.all();
      promise  = command.deleteByFilter(filter);
    }
    else {
      promise = command.delete(selected);
    }

    promise.then(deleted => {
      this.reload();
      log.debug('successfully deleted entities', deleted);
    }, err => log.error(err));
  }

  handleSelected(entity) {
    let {selected} = this.state;

    selected.add(entity);

    this.setState({selected});
  }

  handleDeselected(entity) {
    let {selected} = this.state;

    selected.delete(entity);

    this.setState({selected});
  }

  handleDeleteEntity(entity) {
    let {command} = this;

    command.delete(entity).then(() => {
      this.reload();
      log.debug('successfully deleted entity', entity);
    }, err => log.error(err));
  }

  handleCloneEntity(entity) {
    let {command} = this;

    command.clone(entity).then(() => {
      this.reload();
      log.debug('successfully cloned entity', entity);
    }, err => log.error(err));
  }

  handleSortChange(field) {
    let {filter} = this.state;

    let sort = 'sort';
    let sort_field = filter.getSortBy();

    if (sort_field && sort_field === field) {
      sort = filter.getSortOrder() === 'sort' ? 'sort-reverse' : 'sort';
    }

    filter.set(sort, field);

    this.load(filter);
  }

  render() {
    let {filter, filters, entities, selection_type} = this.state;
    let {command} = this;
    let Component = this.props.component;
    let other = exclude(this.props, key => includes(exclude_props, key));
    return (
      <Layout>
        <Component {...other}
          command={command}
          entities={entities}
          filter={filter}
          filters={filters}
          selectionType={selection_type}
          onChanged={this.reload}
          onFilterChanged={this.load}
          onSortChange={this.handleSortChange}
          onSelectionTypeChange={this.handleSelectionTypeChange}
          onDownloadBulk={this.handleDownloadBulk}
          onDeleteBulk={this.handleDeleteBulk}
          onEntitySelected={this.handleSelected}
          onEntityDeselected={this.handleDeselected}
          onEntityDelete={this.handleDeleteEntity}
          onEntityClone={this.handleCloneEntity}
        />
        <Download ref={ref => this.download = ref}
          filename={this.download_name}/>
      </Layout>
    );
  }

}

EntitiesContainer.propTypes = {
  gmpname: React.PropTypes.string.isRequired,
  filter: React.PropTypes.object,
  filtersFilter: React.PropTypes.object,
  entities: React.PropTypes.object,
  component: PropTypes.component.isRequired,
};

EntitiesContainer.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
};

export const withEntitiesContainer = (component, gmpname, options = {}) => {
  const EntitiesContainerWrapper = props => {
    return (
      <EntitiesContainer {...options} {...props}
        gmpname={gmpname} component={component}/>
    );
  };
  return EntitiesContainerWrapper;
};

// vim: set ts=2 sw=2 tw=80:
