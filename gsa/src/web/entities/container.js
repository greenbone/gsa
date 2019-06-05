/* Copyright (C) 2017-2019 Greenbone Networks GmbH
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
import 'core-js/fn/set';

import React from 'react';

import _ from 'gmp/locale';

import logger from 'gmp/log';

import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {excludeObjectProps} from 'gmp/utils/object';
import {
  getEntityType,
  apiType,
  typeName,
  pluralizeType,
} from 'gmp/utils/entitytype';
import {debounce} from 'gmp/utils/event';

import Filter, {RESET_FILTER} from 'gmp/models/filter';

import {YES_VALUE} from 'gmp/parser';

import {LOAD_TIME_FACTOR} from 'web/utils/constants';
import PropTypes from 'web/utils/proptypes';
import SelectionType from 'web/utils/selectiontype';

import SortBy from 'web/components/sortby/sortby';

import TagDialog from 'web/pages/tags/dialog';

import TagsDialog from './tagsdialog';

const log = logger.getLogger('web.entities.container');

const exclude_props = [
  // these props are consumed here and must not be passed to the children
  'children',
  'component',
  'gmpname',
  'onDownload',
];

class EntitiesContainer extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      selectionType: SelectionType.SELECTION_PAGE_CONTENTS,
      tags: [],
      tagDialogVisible: false,
      tagsDialogVisible: false,
    };

    const {gmpname, gmp, notify} = this.props;

    const entitiesCommandName = pluralizeType(gmpname);

    this.entitiesCommand = gmp[entitiesCommandName];

    this.notifyTimer = notify(`${entitiesCommandName}.timer`);
    this.notifyChanged = notify(`${entitiesCommandName}.changed`);

    this.handleChanged = this.handleChanged.bind(this);
    this.handleCreateTag = this.handleCreateTag.bind(this);
    this.handleDeselected = this.handleDeselected.bind(this);
    this.handleDeleteBulk = this.handleDeleteBulk.bind(this);
    this.handleDownloadBulk = this.handleDownloadBulk.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleFirst = this.handleFirst.bind(this);
    this.handleLast = this.handleLast.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handlePrevious = this.handlePrevious.bind(this);
    this.handleSelected = this.handleSelected.bind(this);
    this.handleSelectionTypeChange = this.handleSelectionTypeChange.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
    this.handleTimer = this.handleTimer.bind(this);
    this.handleFilterCreated = this.handleFilterCreated.bind(this);
    this.handleFilterChanged = this.handleFilterChanged.bind(this);
    this.handleFilterRemoved = this.handleFilterRemoved.bind(this);
    this.handleFilterReset = this.handleFilterReset.bind(this);
    this.handleAddMultiTag = this.handleAddMultiTag.bind(this);
    this.handleTagChange = this.handleTagChange.bind(this);
    this.openTagDialog = this.openTagDialog.bind(this);
    this.handleCloseTagDialog = this.handleCloseTagDialog.bind(this);
    this.openTagsDialog = this.openTagsDialog.bind(this);
    this.handleCloseTagsDialog = this.handleCloseTagsDialog.bind(this);
    this.handleInteraction = this.handleInteraction.bind(this);

    this.handleInteraction = debounce(this.handleInteraction.bind(this), 500);
  }

  static getDerivedStateFromProps(props, state) {
    if (isDefined(props.entities)) {
      // update only if new entities are available to avoid having no entities
      // when the filter changes
      return {
        entities: props.entities,
        entitiesCounts: props.entitiesCounts,
        loadedFilter: props.loadedFilter,
        isUpdating: false,
      };
    }
    // entities are not in store and are currently loaded
    // use filter as loadedFilter to show current user filter and not the last
    // loaded filter
    return {
      isUpdating: true,
      loadedFilter: props.filter,
    };
  }

  componentDidMount() {
    this.isRunning = true;
    const {filter} = this.props.location.query;

    if (isDefined(filter)) {
      // use filter from url
      this.load(Filter.fromString(filter));
    } else {
      // use last filter
      this.load(this.props.filter);
    }
  }

  componentDidUpdate() {
    const {entities = [], loadedFilter: filter} = this.state;

    if (
      entities.length === 0 &&
      isDefined(filter) &&
      filter.get('first') !== 1
    ) {
      // goto first page if first exceeds the last page
      this.load(filter.first());
    }
  }

  componentWillUnmount() {
    this.isRunning = false;
    this.clearTimer(); // remove possible running timer
  }

  handleInteraction() {
    this.props.onInteraction();
  }

  load(filter) {
    const {updateFilter, loadEntities} = this.props;

    log.debug('Loading', {filter});

    this.clearTimer();

    this.startMeasurement();

    updateFilter(filter);

    loadEntities(filter).then(() => this.startTimer());
  }

  reload() {
    // reload data from backend
    this.load(this.props.filter);
  }

  startMeasurement() {
    this.startTimeStamp = performance.now();
  }

  endMeasurement() {
    if (!isDefined(this.startTimeStamp)) {
      return 0;
    }

    const duration = performance.now() - this.startTimeStamp;
    this.startTimeStamp = undefined;
    return duration;
  }

  getReloadInterval() {
    const {defaultReloadInterval, reloadInterval} = this.props;

    return isDefined(reloadInterval)
      ? reloadInterval(this.props)
      : defaultReloadInterval;
  }

  startTimer() {
    if (!this.isRunning || isDefined(this.timer)) {
      log.debug('Not starting timer', {
        isRunning: this.isRunning,
        timer: this.timer,
      });
      return;
    }

    const loadTime = this.endMeasurement();

    log.debug('Loading time was', loadTime, 'milliseconds');

    let interval = this.getReloadInterval();

    if (loadTime > interval) {
      // ensure timer is longer then the loading procedure
      interval = loadTime * LOAD_TIME_FACTOR;
    }

    if (interval > 0) {
      this.timer = global.setTimeout(this.handleTimer, interval);
      log.debug(
        'Started reload timer with id',
        this.timer,
        'and interval of',
        interval,
        'milliseconds for',
        this.props.gmpname,
      );
    }
  }

  resetTimer() {
    this.timer = undefined;
  }

  clearTimer() {
    if (isDefined(this.timer)) {
      log.debug(
        'Clearing reload timer with id',
        this.timer,
        'for',
        this.props.gmpname,
      );

      global.clearTimeout(this.timer);

      this.resetTimer();
    }
  }

  handleTimer() {
    log.debug('Timer', this.timer, 'finished. Reloading data.');

    this.resetTimer();

    this.notifyTimer();
    this.reload();
  }

  handleChanged() {
    this.notifyChanged();
    this.reload();
  }

  handleSelectionTypeChange(selectionType) {
    let selected;

    if (selectionType === SelectionType.SELECTION_USER) {
      selected = new Set();
    } else {
      selected = undefined;
    }

    this.setState({selectionType, selected});
    this.handleInteraction();
  }

  handleDownloadBulk(filename = 'export.xml') {
    const {entitiesCommand} = this;
    const {loadedFilter, selected, selectionType} = this.state;
    const {onDownload} = this.props;

    let promise;

    if (selectionType === SelectionType.SELECTION_USER) {
      promise = entitiesCommand.export(selected);
    } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      promise = entitiesCommand.exportByFilter(loadedFilter);
    } else {
      promise = entitiesCommand.exportByFilter(loadedFilter.all());
    }

    this.handleInteraction();

    promise.then(response => {
      const {data} = response;
      onDownload({filename, data});
    }, this.handleError);
  }

  handleDeleteBulk() {
    const {entitiesCommand} = this;
    const {loadedFilter, selected, selectionType} = this.state;
    let promise;

    if (selectionType === SelectionType.SELECTION_USER) {
      promise = entitiesCommand.delete(selected);
    } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      promise = entitiesCommand.deleteByFilter(loadedFilter);
    } else {
      promise = entitiesCommand.deleteByFilter(loadedFilter.all());
    }

    this.handleInteraction();

    promise.then(deleted => {
      log.debug('successfully deleted entities', deleted);
      this.handleChanged();
    }, this.handleError);
  }

  handleSelected(entity) {
    const {selected} = this.state;

    selected.add(entity);

    this.setState({selected});

    this.handleInteraction();
  }

  handleDeselected(entity) {
    const {selected} = this.state;

    selected.delete(entity);

    this.setState({selected});

    this.handleInteraction();
  }

  handleSortChange(field) {
    const {loadedFilter} = this.state;

    let sort = 'sort';
    const sortField = loadedFilter.getSortBy();

    const filter = loadedFilter.first();

    if (sortField && sortField === field) {
      sort = filter.getSortOrder() === 'sort' ? 'sort-reverse' : 'sort';
    }

    filter.set(sort, field);

    this.changeFilter(filter);
  }

  handleError(error) {
    const {showError} = this.props;
    log.error(error);
    showError(error);
  }

  changeFilter(filter) {
    this.load(filter);
    this.handleInteraction();
  }

  handleFirst() {
    const {loadedFilter: filter} = this.state;

    this.changeFilter(filter.first());
  }

  handleNext() {
    const {loadedFilter: filter} = this.state;

    this.changeFilter(filter.next());
  }

  handlePrevious() {
    const {loadedFilter: filter} = this.state;

    this.changeFilter(filter.previous());
  }

  handleLast() {
    const {loadedFilter: filter, entitiesCounts: counts} = this.state;

    const last =
      Math.floor((counts.filtered - 1) / counts.rows) * counts.rows + 1;

    this.changeFilter(filter.first(last));
  }

  handleFilterCreated(filter) {
    this.changeFilter(filter);
  }

  handleFilterChanged(filter) {
    this.changeFilter(filter);
  }

  handleFilterRemoved() {
    this.changeFilter(RESET_FILTER);
  }

  handleFilterReset() {
    const {history, location} = this.props;
    const query = {...location.query};

    // remove filter param from url
    delete query.filter;

    history.push({pathname: location.pathname, query});

    this.changeFilter();
  }

  openTagDialog() {
    this.setState({tagDialogVisible: true});
    this.handleInteraction();
  }

  closeTagDialog() {
    this.setState({tagDialogVisible: false});
  }

  handleCloseTagDialog() {
    this.closeTagDialog();
    this.handleInteraction();
  }

  handleCreateTag(data) {
    const {gmp} = this.props;
    const {tags} = this.state;

    this.handleInteraction();

    return gmp.tag
      .create(data)
      .then(response => gmp.tag.get(response.data))
      .then(response => {
        this.closeTagDialog();
        this.setState({
          tag: response.data,
          tags: [...tags, response.data],
        });
      });
  }

  handleTagChange(id) {
    const {gmp} = this.props;

    this.handleInteraction();

    gmp.tag.get({id}).then(response => {
      this.setState({
        tag: response.data,
      });
    });
  }

  handleAddMultiTag({comment, id, name, value = ''}) {
    const {gmp} = this.props;
    const {loadedFilter, selectionType, selected, entities = []} = this.state;

    const entitiesType = getEntityType(entities[0]);

    let resource_ids;
    let filter;
    if (selectionType === SelectionType.SELECTION_USER) {
      resource_ids = map(selected, res => res.id);
      filter = undefined;
    } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      filter = loadedFilter;
    } else {
      filter = loadedFilter.all();
    }

    this.handleInteraction();

    return gmp.tag
      .save({
        active: YES_VALUE,
        comment,
        filter,
        id,
        name,
        resource_ids,
        resource_type: entitiesType,
        resources_action: 'add',
        value,
      })
      .then(() => this.closeTagsDialog());
  }

  openTagsDialog() {
    this.getTagsByType();
    this.setState({
      tagsDialogVisible: true,
      multiTagEntitiesCount: this.getMultiTagEntitiesCount(),
    });
    this.handleInteraction();
  }

  closeTagsDialog() {
    this.setState({tagsDialogVisible: false});
  }

  handleCloseTagsDialog() {
    this.closeTagsDialog();
    this.handleInteraction();
  }

  getTagsByType() {
    const {gmp} = this.props;
    const {entities} = this.state;

    if (entities.length > 0) {
      const filter = 'resource_type=' + apiType(getEntityType(entities[0]));
      gmp.tags.getAll({filter}).then(response => {
        const {data: tags} = response;
        this.setState({tags});
      });
    }
  }

  getMultiTagEntitiesCount() {
    const {selectionType, selected, entities, entitiesCounts} = this.state;

    if (selectionType === SelectionType.SELECTION_USER) {
      return selected.size;
    }

    if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      return entities.length;
    }

    return entitiesCounts.filtered;
  }

  render() {
    const {
      entities,
      entitiesCounts,
      isUpdating,
      loadedFilter,
      multiTagEntitiesCount,
      selected,
      selectionType,
      tag = {},
      tags,
      tagDialogVisible,
      tagsDialogVisible,
    } = this.state;
    const {
      children,
      isLoading,
      filter,
      onDownload,
      showErrorMessage,
      showSuccessMessage,
      ...props
    } = this.props;

    let entitiesType;
    let resourceTypes;
    if (isDefined(entities) && entities.length > 0) {
      entitiesType = getEntityType(entities[0]);
      resourceTypes = [[entitiesType, typeName(entitiesType)]];
    }

    let title;
    if (selectionType === SelectionType.SELECTION_USER) {
      title = _('Add Tag to Selection');
    } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      title = _('Add Tag to Page Contents');
    } else {
      title = _('Add Tag to All Filtered');
    }

    const other = excludeObjectProps(props, exclude_props);

    const reverseField = isDefined(loadedFilter)
      ? loadedFilter.get('sort-reverse')
      : undefined;
    const reverse = isDefined(reverseField);
    const sortBy =
      reverse || !isDefined(loadedFilter)
        ? reverseField
        : loadedFilter.get('sort');
    const sortDir = reverse ? SortBy.DESC : SortBy.ASC;
    return (
      <React.Fragment>
        {children({
          ...other,
          createFilterType: apiType(this.props.gmpname),
          entities,
          entitiesCounts,
          entitiesSelected: selected,
          filter: loadedFilter,
          isLoading,
          isUpdating,
          selectionType: selectionType,
          sortBy,
          sortDir,
          onChanged: this.handleChanged,
          onDeleteBulk: this.handleDeleteBulk,
          onDownloadBulk: this.handleDownloadBulk,
          onDownloaded: onDownload,
          onEntitySelected: this.handleSelected,
          onEntityDeselected: this.handleDeselected,
          onError: this.handleError,
          onFilterChanged: this.handleFilterChanged,
          onFilterCreated: this.handleFilterCreated,
          onFilterRemoved: this.handleFilterRemoved,
          onFilterReset: this.handleFilterReset,
          onFirstClick: this.handleFirst,
          onInteraction: this.handleInteraction,
          onLastClick: this.handleLast,
          onNextClick: this.handleNext,
          onPreviousClick: this.handlePrevious,
          onSortChange: this.handleSortChange,
          onSelectionTypeChange: this.handleSelectionTypeChange,
          onTagsBulk: this.openTagsDialog,
          showError: showErrorMessage,
          showSuccess: showSuccessMessage,
        })}
        {tagsDialogVisible && (
          <TagsDialog
            comment={tag.comment}
            entitiesCount={multiTagEntitiesCount}
            filter={loadedFilter}
            name={tag.name}
            tagId={tag.id}
            tags={tags}
            title={title}
            value={tag.value}
            onClose={this.handleCloseTagsDialog}
            onSave={this.handleAddMultiTag}
            onNewTagClick={this.openTagDialog}
            onTagChanged={this.handleTagChange}
          />
        )}
        {tagDialogVisible && (
          <TagDialog
            fixed={true}
            resources={selected}
            resource_type={entitiesType}
            resource_types={resourceTypes}
            onClose={this.handleCloseTagDialog}
            onSave={this.handleCreateTag}
          />
        )}
      </React.Fragment>
    );
  }
}

EntitiesContainer.propTypes = {
  children: PropTypes.func.isRequired,
  defaultReloadInterval: PropTypes.number.isRequired,
  entities: PropTypes.array,
  entitiesCounts: PropTypes.counts,
  entitiesError: PropTypes.error,
  extraLoadParams: PropTypes.object,
  filter: PropTypes.filter,
  gmp: PropTypes.gmp.isRequired,
  gmpname: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  loadEntities: PropTypes.func.isRequired,
  loadedFilter: PropTypes.filter,
  notify: PropTypes.func.isRequired,
  reloadInterval: PropTypes.func,
  showError: PropTypes.func.isRequired,
  showErrorMessage: PropTypes.func.isRequired,
  showSuccessMessage: PropTypes.func.isRequired,
  updateFilter: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default EntitiesContainer;

// vim: set ts=2 sw=2 tw=80:
