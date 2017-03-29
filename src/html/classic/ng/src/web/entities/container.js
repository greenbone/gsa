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

import _ from '../../locale.js';
import logger from '../../log.js';
import {is_defined, is_array, exclude, includes} from '../../utils.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';
import SelectionType from '../selectiontype.js';

import Dialog from '../dialog/dialog.js';

import Download from '../form/download.js';

import PromiseFactory from '../../gmp/promise.js';
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
      loading: false,
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
    this.handleDownloadEntity = this.handleDownloadEntity.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleSaveEntity = this.handleSaveEntity.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
    this.handleShowError = this.handleShowError.bind(this);
    this.handleShowSuccess = this.handleShowSuccess.bind(this);
  }

  componentDidMount() {
    let {gmp} = this.context;
    let filter_string = this.props.location.query.filter;
    let filter;

    let {gmpname} = this.props;

    let entity_command_name;
    let entities_command_name;

    if (is_array(gmpname)) {
      entity_command_name = gmpname[0];
      entities_command_name = gmpname[1];
    }
    else {
      entity_command_name = gmpname;
      entities_command_name  = gmpname + 's';
    }

    this.entity_command = gmp[entity_command_name];
    this.entities_command = gmp[entities_command_name];

    if (filter_string) {
      filter = Filter.fromString(filter_string);
    }

    this.load(filter, {reload: true}); // use data from cache and reload afterwards
    this.loadFilters();
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  getChildContext() {
    let {gmp} = this.context;
    return {username: gmp.username};
  }

  load(filter, options = {}) {
    let {cache = true, force = false, refresh, reload = false} = options;
    let {entities_command} = this;
    let {extraLoadParams = {}} = this.props;

    this.setState({loading: true});

    this.clearTimer(); // remove possible running timer

    entities_command.get({filter, ...extraLoadParams}, {cache, force})
      .then(entities => {
        filter = entities.getFilter();
        let meta = entities.getMeta();

        this.setState({entities, filter, loading: false});

        if (meta.fromcache && reload) {
          refresh = 1;
        }

        this.startTimer(refresh);
      }, error => {
        this.setState({loading: false, entities: null});
        this.handleError(error);
        return PromiseFactory.reject(error);
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
      }, this.handleError);
  }

  reload() {
    // reload data from backend
    this.load(this.state.filter, {cache: true, force: true});
  }

  startTimer(refresh) {
    let {gmp} = this.context;
    refresh = is_defined(refresh) ? refresh : gmp.globals.autorefresh;
    if (refresh && refresh >= 0) {
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
    log.debug('Timer', this.timer, 'finished. Reloading data.');

    this.timer = undefined;
    this.reload();
  }

  handleSelectionTypeChange(selection_type) {
    let selected;

    if (selection_type === SelectionType.SELECTION_USER) {
      selected = new Set();
    }
    else {
      selected = undefined;
    }

    this.setState({selection_type, selected});
  }

  handleDownloadBulk(filename = 'export.xml') {
    let {entities_command} = this;
    let {selected, selection_type, filter} = this.state;
    let promise;

    if (selection_type === SelectionType.SELECTION_USER) {
      promise = entities_command.export(selected);
    }
    else if (selection_type === SelectionType.SELECTION_PAGE_CONTENTS) {
      promise = entities_command.exportByFilter(filter);
    }
    else {
      promise = entities_command.exportByFilter(filter.all());
    }

    promise.then(response => {
      let {data} = response;
      this.download.setFilename(filename);
      this.download.setData(data);
      this.download.download();
    }, this.handleError);
  }

  handleDeleteBulk() {
    let {entities_command} = this;
    let {selected, selection_type, filter} = this.state;
    let promise;

    if (selection_type === SelectionType.SELECTION_USER) {
      promise = entities_command.delete(selected);
    }
    else if (selection_type === SelectionType.SELECTION_PAGE_CONTENTS) {
      promise  = entities_command.deleteByFilter(filter);
    }
    else {
      promise  = entities_command.deleteByFilter(filter.all());
    }

    promise.then(deleted => {
      this.reload();
      log.debug('successfully deleted entities', deleted);
    }, this.handleError);
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
    let {entity_command} = this;

    entity_command.delete(entity).then(() => {
      this.reload();
      log.debug('successfully deleted entity', entity);
    }, this.handleError);
  }

  handleCloneEntity(entity) {
    let {entity_command} = this;

    entity_command.clone(entity).then(() => {
      this.reload();
      log.debug('successfully cloned entity', entity);
    }, this.handleError);
  }

  handleDownloadEntity(entity) {
    let {entities_command} = this;
    let {gmpname} = this.props;

    let name = is_array(gmpname) ? gmpname[0] : gmpname;

    let filename = name + '-' + entity.id + '.xml';

    entities_command.export([entity]).then(response => {
      this.download.setFilename(filename);
      this.download.setData(response.data);
      this.download.download();
    }, this.handleError);
  }

  handleSaveEntity(data) {
    let {entity_command} = this;
    let promise;

    if (is_defined(data.id)) {
      promise = entity_command.save(data);
    }
    else {
      promise = entity_command.create(data);
    }

    return promise.then(() => this.reload());
  }

  handleSortChange(field) {
    let {filter} = this.state;

    let sort = 'sort';
    let sort_field = filter.getSortBy();

    filter = filter.first();

    if (sort_field && sort_field === field) {
      sort = filter.getSortOrder() === 'sort' ? 'sort-reverse' : 'sort';
    }

    filter.set(sort, field);

    this.load(filter);
  }

  handleError(error) {
    log.error(error);
    this.handleShowError(error.message);
  }

  handleShowError(error) {
    this.notice_dialog.show({
      content: (
        <Layout flex align="center">
          {error}
        </Layout>
      ),
      title: _('Error'),
    });
  }

  handleShowSuccess(message) {
    this.notice_dialog.show({
      content: (
        <Layout flex align="center">
          {message}
        </Layout>
      ),
      title: _('Success'),
    });
  }

  render() {
    let {filter, filters, entities, selection_type, selected, loading,
      } = this.state;
    let {entity_command, entities_command} = this;
    let Component = this.props.component;
    let other = exclude(this.props, key => includes(exclude_props, key));
    return (
      <Layout>
        <Component {...other}
          loading={loading}
          entitiesCommand={entities_command}
          entityCommand={entity_command}
          entities={entities}
          entitiesSelected={selected}
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
          onEntityDownload={this.handleDownloadEntity}
          onEntityClone={this.handleCloneEntity}
          onEntitySave={this.handleSaveEntity}
          showError={this.handleShowError}
          showSuccess={this.handleShowSuccess}
        />
        <Download ref={ref => this.download = ref}
          filename={this.download_name}/>
        <Dialog
          width="400"
          ref={ref => this.notice_dialog = ref}
        />
      </Layout>
    );
  }

}

EntitiesContainer.propTypes = {
  component: PropTypes.component.isRequired,
  extraLoadParams: React.PropTypes.object,
  entities: PropTypes.collection,
  filter: PropTypes.filter,
  filtersFilter: PropTypes.filter,
  gmpname: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.arrayOf(React.PropTypes.string),
  ]).isRequired,
};

EntitiesContainer.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
};

EntitiesContainer.childContextTypes = {
  username: React.PropTypes.string,
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
