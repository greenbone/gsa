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

import logger from 'gmp/log.js';
import {
  is_defined,
  is_array,
  exclude_object_props,
} from 'gmp/utils.js';

import PromiseFactory from 'gmp/promise.js';
import Filter from 'gmp/models/filter.js';

import compose from '../utils/compose.js';
import PropTypes from '../utils/proptypes.js';

import SelectionType from '../utils/selectiontype.js';

import withCache from '../utils/withCache.js';

import withDownload from '../components/form/withDownload.js';

import Wrapper from '../components/layout/wrapper.js';

import withDialogNotification from '../components/notification/withDialogNotifiaction.js'; // eslint-disable-line max-len

const log = logger.getLogger('web.entities.container');

const exclude_props = [
  // these props are consumed here and must not be passed to the children
  'children',
  'component',
  'gmpname',
  'filtersFilter',
  'onDownload',
];

class EntitiesContainer extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      loading: false,
      selection_type: SelectionType.SELECTION_PAGE_CONTENTS,
    };

    const {gmpname} = this.props;
    const {gmp} = this.context;

    let entity_command_name;
    let entities_command_name;

    if (is_array(gmpname)) {
      entity_command_name = gmpname[0];
      entities_command_name = gmpname[1];
    }
    else {
      entity_command_name = gmpname;
      entities_command_name = gmpname + 's';
    }

    this.name = entity_command_name;

    this.entity_command = gmp[entity_command_name];
    this.entities_command = gmp[entities_command_name];

    this.load = this.load.bind(this);
    this.reload = this.reload.bind(this);
    this.handleCloneEntity = this.handleCloneEntity.bind(this);
    this.handleDeleteBulk = this.handleDeleteBulk.bind(this);
    this.handleDeleteEntity = this.handleDeleteEntity.bind(this);
    this.handleDeselected = this.handleDeselected.bind(this);
    this.handleDownloadBulk = this.handleDownloadBulk.bind(this);
    this.handleDownloadEntity = this.handleDownloadEntity.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleFirst = this.handleFirst.bind(this);
    this.handleLast = this.handleLast.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handlePrevious = this.handlePrevious.bind(this);
    this.handleSaveEntity = this.handleSaveEntity.bind(this);
    this.handleSelected = this.handleSelected.bind(this);
    this.handleSelectionTypeChange = this.handleSelectionTypeChange.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
    this.handleTimer = this.handleTimer.bind(this);
    this.handleFilterCreated = this.handleFilterCreated.bind(this);
    this.handleFilterChanged = this.handleFilterChanged.bind(this);
  }

  componentDidMount() {
    const {filter} = this.props.location.query;
    this.updateFilter(filter, true); // use data from cache and reload afterwards
    this.loadFilters();
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  componentWillReceiveProps(next) {
    if (is_defined(next.location) && is_defined(next.location.query) &&
      is_defined(next.location.query.filter) &&
      next.location.query.filter !== this.props.location.query.filter) {
      const {filter} = next.location.query;
      this.updateFilter(filter);
    }
  }

  updateFilter(filterstring, reload = false) {
    const filter = is_defined(filterstring) ? Filter.fromString(filterstring) :
      undefined;

    this.load(filter, {reload});
  }


  load(filter, options = {}) {
    const {entities_command} = this;
    let {force = false, refresh, reload = false} = options;
    const {cache, extraLoadParams = {}} = this.props;

    this.setState({loading: true});

    this.clearTimer(); // remove possible running timer

    entities_command.get({filter, ...extraLoadParams}, {cache, force})
      .then(entities => {
        const meta = entities.getMeta();
        const loaded_filter = entities.getFilter();

        this.setState({
          entities,
          filter,
          loaded_filter,
          loading: false,
        });

        if (meta.fromcache && (meta.dirty || reload)) {
          log.debug('Forcing reload of entities', meta.dirty, reload);
          refresh = 1;
        }

        this.startTimer(refresh);
      }, error => {
        this.setState({loading: false, entities: undefined});
        this.handleError(error);
        return PromiseFactory.reject(error);
      });
  }

  loadFilters() {
    const {gmp} = this.context;
    const {cache, filtersFilter} = this.props;

    if (!filtersFilter) {
      return;
    }

    gmp.filters.getAll({filter: filtersFilter}, {cache})
      .then(filters => {
        // display cached filters
        this.setState({filters});
        // reload all filters from backend
        return gmp.filters.getAll({filter: filtersFilter},
          {cache, force: true});
      }).then(filters => {
        this.setState({filters});
      }, this.handleError);
  }

  reload({invalidate = false} = {}) {
    if (invalidate) {
      const {cache} = this.props;
      log.debug('Marking cache as dirty', cache);
      cache.invalidate();
    }
    // reload data from backend
    this.load(this.state.filter, {force: true});
  }

  startTimer(refresh) {
    const {gmp} = this.context;
    refresh = is_defined(refresh) ? refresh : gmp.autorefresh;
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
    const {entities_command} = this;
    const {selected, selection_type, loaded_filter} = this.state;
    let promise;

    if (selection_type === SelectionType.SELECTION_USER) {
      promise = entities_command.export(selected);
    }
    else if (selection_type === SelectionType.SELECTION_PAGE_CONTENTS) {
      promise = entities_command.exportByFilter(loaded_filter);
    }
    else {
      promise = entities_command.exportByFilter(loaded_filter.all());
    }

    promise.then(response => {
      const {data} = response;
      const {onDownload} = this.props;
      onDownload({filename, data});
    }, this.handleError);
  }

  handleDeleteBulk() {
    const {entities_command} = this;
    const {selected, selection_type, loaded_filter} = this.state;
    let promise;

    if (selection_type === SelectionType.SELECTION_USER) {
      promise = entities_command.delete(selected);
    }
    else if (selection_type === SelectionType.SELECTION_PAGE_CONTENTS) {
      promise = entities_command.deleteByFilter(loaded_filter);
    }
    else {
      promise = entities_command.deleteByFilter(loaded_filter.all());
    }

    promise.then(deleted => {
      this.reload({invalidate: true});
      log.debug('successfully deleted entities', deleted);
    }, this.handleError);
  }

  handleSelected(entity) {
    const {selected} = this.state;

    selected.add(entity);

    this.setState({selected});
  }

  handleDeselected(entity) {
    const {selected} = this.state;

    selected.delete(entity);

    this.setState({selected});
  }

  handleDeleteEntity(entity) {
    const {entity_command} = this;

    entity_command.delete(entity).then(() => {
      this.reload({invalidate: true});
      log.debug('successfully deleted entity', entity);
    }, this.handleError);
  }

  handleCloneEntity(entity) {
    const {entity_command} = this;

    entity_command.clone(entity).then(() => {
      this.reload({invalidate: true});
      log.debug('successfully cloned entity', entity);
    }, this.handleError);
  }

  handleDownloadEntity(entity) {
    const {entities_command} = this;
    const {onDownload} = this.props;

    const {name} = this;

    const filename = name + '-' + entity.id + '.xml';

    entities_command.export([entity]).then(response => {
      onDownload({filename, data: response.data});
    }, this.handleError);
  }

  handleSaveEntity(data) {
    const {entity_command} = this;
    let promise;

    if (is_defined(data.id)) {
      promise = entity_command.save(data);
    }
    else {
      promise = entity_command.create(data);
    }

    return promise.then(() => this.reload({invalidate: true}));
  }

  handleSortChange(field) {
    const {loaded_filter} = this.state;

    let sort = 'sort';
    const sort_field = loaded_filter.getSortBy();

    const filter = loaded_filter.first();

    if (sort_field && sort_field === field) {
      sort = filter.getSortOrder() === 'sort' ? 'sort-reverse' : 'sort';
    }

    filter.set(sort, field);

    this.load(filter);
  }

  handleError(error) {
    const {showError} = this.props;
    log.error(error);
    showError(error);
  }

  handleFirst() {
    const {loaded_filter: filter} = this.state;

    this.load(filter.first());
  }

  handleNext() {
    const {loaded_filter: filter} = this.state;

    this.load(filter.next());
  }

  handlePrevious() {
    const {loaded_filter: filter} = this.state;

    this.load(filter.previous());
  }

  handleLast() {
    const {loaded_filter: filter, entities} = this.state;
    const counts = entities.getCounts();

    const last = Math.floor((counts.filtered - 1) / counts.rows) *
      counts.rows + 1;

    this.load(filter.first(last));
  }

  handleFilterCreated(filter) {
    this.loadFilters();
    this.load(filter);
  }

  handleFilterChanged(filter) {
    this.load(filter);
  }

  render() {
    const {
      entities,
      filters,
      loaded_filter,
      loading,
      selected,
      selection_type,
    } = this.state;
    const {
      onDownload,
      showErrorMessage,
      showSuccessMessage,
    } = this.props;
    const {entity_command, entities_command} = this;
    const Component = this.props.component;
    const other = exclude_object_props(this.props, exclude_props);
    return (
      <Wrapper>
        <Component
          createFilterType={this.name}
          {...other}
          loading={loading}
          entitiesCommand={entities_command}
          entityCommand={entity_command}
          entities={entities}
          entitiesSelected={selected}
          filter={loaded_filter}
          filters={filters}
          selectionType={selection_type}
          onChanged={this.reload}
          onDownloaded={onDownload}
          onError={this.handleError}
          onFilterChanged={this.handleFilterChanged}
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
          onFilterCreated={this.handleFilterCreated}
          onFirstClick={this.handleFirst}
          onLastClick={this.handleLast}
          onNextClick={this.handleNext}
          onPreviousClick={this.handlePrevious}
          showError={showErrorMessage}
          showSuccess={showSuccessMessage}
        />
      </Wrapper>
    );
  }

}

EntitiesContainer.propTypes = {
  cache: PropTypes.cache.isRequired,
  component: PropTypes.component.isRequired,
  entities: PropTypes.collection,
  extraLoadParams: PropTypes.object,
  filter: PropTypes.filter,
  filtersFilter: PropTypes.filter,
  gmpname: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]).isRequired,
  showError: PropTypes.func.isRequired,
  showErrorMessage: PropTypes.func.isRequired,
  showSuccessMessage: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
};

EntitiesContainer.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

EntitiesContainer = compose(
  withCache(),
  withDialogNotification,
  withDownload,
)(EntitiesContainer);

export default EntitiesContainer;

// vim: set ts=2 sw=2 tw=80:
