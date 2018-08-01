/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import logger from 'gmp/log';

import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {excludeObjectProps} from 'gmp/utils/object';
import {
  getEntityType,
  typeName,
  pluralizeType,
} from 'gmp/utils/entitytype';

import Filter from 'gmp/models/filter';

import {YES_VALUE} from 'gmp/parser';

import PropTypes from '../utils/proptypes.js';

import SelectionType from '../utils/selectiontype.js';

import SortBy from '../components/sortby/sortby.js';

import TagDialog from '../pages/tags/dialog.js';

import TagsDialog from './tagsdialog.js';

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
    this.handleFilterReset = this.handleFilterReset.bind(this);
    this.handleAddMultiTag = this.handleAddMultiTag.bind(this);
    this.handleTagChange = this.handleTagChange.bind(this);
    this.openTagDialog = this.openTagDialog.bind(this);
    this.closeTagDialog = this.closeTagDialog.bind(this);
    this.openTagsDialog = this.openTagsDialog.bind(this);
    this.closeTagsDialog = this.closeTagsDialog.bind(this);
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
    return {
      isUpdating: true,
    };
  };

  componentDidMount() {
    const {filter} = this.props.location.query;

    if (isDefined(filter)) {
      // use filter from url
      this.updateFilter(filter);
    }
    else {
      // use last filter
      this.load({filter: this.props.filter});
    }
  }

  componentWillUnmount() {
    this.clearTimer(); // remove possible running timer
  }

  updateFilter(filterstring) {
    const filter = isDefined(filterstring) ? Filter.fromString(filterstring) :
      undefined;

    this.load({filter});
  }

  load(options = {}) {
    const {filter} = options;
    const {
      updateFilter,
      loadEntities,
    } = this.props;

    log.debug('Loading', options);

    this.clearTimer();

    updateFilter(filter);
    loadEntities(filter).then(() => this.startTimer(false));
  }

  reload() {
    // reload data from backend
    this.load({filter: this.state.loadedFilter});
  }

  getRefreshInterval() {
    const {gmp} = this.props;
    return gmp.autorefresh * 1000;
  }

  startTimer(immediate = false) {
    const refresh = immediate ? 0 : this.getRefreshInterval();
    if (refresh >= 0) {
      this.timer = window.setTimeout(this.handleTimer, refresh);
      log.debug('Started reload timer with id', this.timer, 'and interval of',
        refresh, 'milliseconds');
    }
  }

  clearTimer() {
    if (isDefined(this.timer)) {
      log.debug('Clearing reload timer with id', this.timer);
      window.clearTimeout(this.timer);
    }
  }

  handleTimer() {
    log.debug('Timer', this.timer, 'finished. Reloading data.');

    this.timer = undefined;
    this.reload();
    this.notifyTimer();
  }

  handleChanged() {
    this.reload();
    this.notifyChanged();
  }

  handleSelectionTypeChange(selectionType) {
    let selected;

    if (selectionType === SelectionType.SELECTION_USER) {
      selected = new Set();
    }
    else {
      selected = undefined;
    }

    this.setState({selectionType, selected});
  }

  handleDownloadBulk(filename = 'export.xml') {
    const {entitiesCommand} = this;
    const {
      selected,
      selectionType,
    } = this.state;
    const {
      loadedFilter,
      onDownload,
    } = this.props;

    let promise;

    if (selectionType === SelectionType.SELECTION_USER) {
      promise = entitiesCommand.export(selected);
    }
    else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      promise = entitiesCommand.exportByFilter(loadedFilter);
    }
    else {
      promise = entitiesCommand.exportByFilter(loadedFilter.all());
    }

    promise.then(response => {
      const {data} = response;
      onDownload({filename, data});
    }, this.handleError);
  }

  handleDeleteBulk() {
    const {entitiesCommand} = this;
    const {
      selected,
      selectionType,
    } = this.state;
    const {
      loadedFilter,
    } = this.props;
    let promise;

    if (selectionType === SelectionType.SELECTION_USER) {
      promise = entitiesCommand.delete(selected);
    }
    else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      promise = entitiesCommand.deleteByFilter(loadedFilter);
    }
    else {
      promise = entitiesCommand.deleteByFilter(loadedFilter.all());
    }

    promise.then(deleted => {
      this.reload();
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

  handleSortChange(field) {
    const {loadedFilter} = this.props;

    let sort = 'sort';
    const sortField = loadedFilter.getSortBy();

    const filter = loadedFilter.first();

    if (sortField && sortField === field) {
      sort = filter.getSortOrder() === 'sort' ? 'sort-reverse' : 'sort';
    }

    filter.set(sort, field);

    this.load({filter});
  }

  handleError(error) {
    const {showError} = this.props;
    log.error(error);
    showError(error);
  }

  handleFirst() {
    const {loadedFilter: filter} = this.props;

    this.load({filter: filter.first()});
  }

  handleNext() {
    const {loadedFilter: filter} = this.props;

    this.load({filter: filter.next()});
  }

  handlePrevious() {
    const {loadedFilter: filter} = this.props;

    this.load({filter: filter.previous()});
  }

  handleLast() {
    const {loadedFilter: filter, entitiesCounts: counts} = this.state;

    const last = Math.floor((counts.filtered - 1) / counts.rows) *
      counts.rows + 1;

    this.load({filter: filter.first(last)});
  }

  handleFilterCreated(filter) {
    this.load({filter});
  }

  handleFilterChanged(filter) {
    this.load({filter});
  }

  handleFilterReset() {
    const {router, location} = this.props;
    const query = {...location.query};

    // remove filter param from url
    delete query.filter;

    router.push({pathname: location.pathname, query});

    this.load();
  }

  openTagDialog() {
    this.setState({tagDialogVisible: true});
  }

  closeTagDialog() {
    this.setState({tagDialogVisible: false});
  }

  handleCreateTag(data) {
    const {gmp} = this.props;
    const {tags} = this.state;

    return gmp.tag.create(data)
      .then(response => gmp.tag.get(response.data))
      .then(response => {
        this.setState({
          tag: response.data,
          tags: [
            ...tags,
            response.data,
          ],
        });
      });
  }

  handleTagChange(id) {
    const {gmp} = this.props;

    gmp.tag.get({id}).then(response => {
      this.setState({
        tag: response.data,
      });
    });
  }

  handleAddMultiTag({
    comment,
    id,
    name,
    value = '',
  }) {
    const {
      gmp,
      loadedFilter,
    } = this.props;
    const {
      selectionType,
      selected,
      entities = [],
    } = this.state;

    const entitiesType = getEntityType(entities[0]);

    let resource_ids;
    let filter;
    if (selectionType === SelectionType.SELECTION_USER) {
      resource_ids = map(selected, res => res.id);
      filter = undefined;
    }
    if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      filter = loadedFilter;
    }
    else {
      filter = loadedFilter.all();
    }

    return gmp.tag.save({
      active: YES_VALUE,
      comment,
      filter,
      id,
      name,
      resource_ids,
      resource_type: entitiesType,
      resources_action: 'add',
      value,
    });
  }

  openTagsDialog() {
    this.getTagsByType();
    this.setState({
      tagsDialogVisible: true,
      multiTagEntitiesCount: this.getMultiTagEntitiesCount(),
    });
  }

  closeTagsDialog() {
    this.setState({tagsDialogVisible: false});
  }

  getTagsByType() {
    const {gmp} = this.props;
    const {entities} = this.state;

    if (entities.length > 0) {
      const filter = 'resource_type=' + getEntityType(entities[0]);

      gmp.tags.getAll({filter}).then(response => {
        const {data: tags} = response;
        this.setState({tags});
      });
    }
  }

  getMultiTagEntitiesCount() {
    const {
      selectionType,
      selected,
      entities,
      entitiesCounts,
    } = this.state;

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
      title = 'Add Tag to Selection';
    }
    else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      title = 'Add Tag to Page Contents';
    }
    else {
      title = 'Add Tag to All Filtered';
    }

    const other = excludeObjectProps(props, exclude_props);

    const reverseField = isDefined(loadedFilter) ?
      loadedFilter.get('sort-reverse') : undefined;
    const reverse = isDefined(reverseField);
    const sortBy = reverse || !isDefined(loadedFilter) ? reverseField :
      loadedFilter.get('sort');
    const sortDir = reverse ? SortBy.DESC : SortBy.ASC;
    return (
      <React.Fragment>
        {children({
          ...other,
          createFilterType: this.name,
          entities,
          entitiesCounts,
          entitiesSelected: selected,
          filter: loadedFilter,
          isLoading,
          isUpdating,
          loading: isLoading, // TODO convert list pages to use isLoading and remove me
          selectionType: selectionType,
          sortBy,
          sortDir,
          updating: isUpdating, // TODO remove after list pages are converted to use isUpdating
          onChanged: this.handleChanged,
          onDownloaded: onDownload,
          onError: this.handleError,
          onFilterChanged: this.handleFilterChanged,
          onFilterReset: this.handleFilterReset,
          onSortChange: this.handleSortChange,
          onSelectionTypeChange: this.handleSelectionTypeChange,
          onDownloadBulk: this.handleDownloadBulk,
          onDeleteBulk: this.handleDeleteBulk,
          onTagsBulk: this.openTagsDialog,
          onEntitySelected: this.handleSelected,
          onEntityDeselected: this.handleDeselected,
          onFilterCreated: this.handleFilterCreated,
          onFirstClick: this.handleFirst,
          onLastClick: this.handleLast,
          onNextClick: this.handleNext,
          onPreviousClick: this.handlePrevious,
          showError: showErrorMessage,
          showSuccess: showSuccessMessage,
        })}
        {tagsDialogVisible &&
          <TagsDialog
            comment={tag.comment}
            entitiesCount={multiTagEntitiesCount}
            filter={loadedFilter}
            name={tag.name}
            tagId={tag.id}
            tags={tags}
            title={title}
            value={tag.value}
            onClose={this.closeTagsDialog}
            onSave={this.handleAddMultiTag}
            onNewTagClick={this.openTagDialog}
            onTagChanged={this.handleTagChange}
          />
        }
        {tagDialogVisible &&
          <TagDialog
            fixed={true}
            resources={selected}
            resource_type={entitiesType}
            resource_types={resourceTypes}
            onClose={this.closeTagDialog}
            onSave={this.handleCreateTag}
          />
        }
      </React.Fragment>
    );
  }
}

EntitiesContainer.propTypes = {
  children: PropTypes.func.isRequired,
  entities: PropTypes.array,
  entitiesCounts: PropTypes.counts,
  extraLoadParams: PropTypes.object,
  filter: PropTypes.filter,
  gmp: PropTypes.gmp.isRequired,
  gmpname: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  loadEntities: PropTypes.func.isRequired,
  loadedFilter: PropTypes.filter,
  notify: PropTypes.func.isRequired,
  router: PropTypes.object.isRequired,
  showError: PropTypes.func.isRequired,
  showErrorMessage: PropTypes.func.isRequired,
  showSuccessMessage: PropTypes.func.isRequired,
  updateFilter: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
};

export default EntitiesContainer;

// vim: set ts=2 sw=2 tw=80:
