/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {showSuccessNotification} from '@greenbone/opensight-ui-components-mantinev7';
import _ from 'gmp/locale';
import logger from 'gmp/log';
import {RESET_FILTER} from 'gmp/models/filter';
import {YES_VALUE} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {
  getEntityType,
  apiType,
  typeName,
  pluralizeType,
} from 'gmp/utils/entitytype';
import {debounce} from 'gmp/utils/event';
import {isDefined} from 'gmp/utils/identity';
import {excludeObjectProps} from 'gmp/utils/object';
import React from 'react';
import {connect} from 'react-redux';
import {handleNotificationForAction} from 'web/components/notification/handleNotificationForAction';
import SortBy from 'web/components/sortby/SortBy';
import TagsDialog from 'web/entities/TagsDialog';
import TagDialog from 'web/pages/tags/Dialog';
import {createDeleteEntity} from 'web/store/entities/utils/actions';
import {renewSessionTimeout} from 'web/store/usersettings/actions';
import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {getUsername} from 'web/store/usersettings/selectors';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import {generateFilename} from 'web/utils/Render';
import SelectionType from 'web/utils/SelectionType';
import {withRouter} from 'web/utils/withRouter';

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
    this.handleDelete = this.handleDelete.bind(this);
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

    this.props.loadSettings();

    this.updateFilter(this.props.filter);
  }

  componentDidUpdate() {
    const {entities = [], loadedFilter: filter} = this.state;
    if (
      entities.length === 0 &&
      isDefined(filter) &&
      filter.has('first') &&
      filter.get('first') !== 1
    ) {
      // goto first page if first exceeds the last page
      this.updateFilter(filter.first());
    }
  }

  handleInteraction() {
    this.props.onInteraction();
  }

  updateFilter(filter) {
    const {updateFilter} = this.props;

    updateFilter(filter);

    this.props.reload(filter);
  }

  handleDelete(entity) {
    const {deleteEntity} = this.props;

    return handleNotificationForAction(
      deleteEntity(entity.id),
      this.handleChanged,
      this.handleError,
      `${entity.name} ${_('deleted successfully.')}`,
    );
  }

  handleChanged() {
    this.notifyChanged();

    this.props.reload();
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

  handleDownloadBulk() {
    const {entitiesCommand} = this;
    const {entities = [], loadedFilter, selected, selectionType} = this.state;
    const {listExportFileName, username, onDownload} = this.props;

    let promise;

    if (selectionType === SelectionType.SELECTION_USER) {
      promise = entitiesCommand.export(selected);
    } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      promise = entitiesCommand.exportByFilter(loadedFilter);
    } else {
      promise = entitiesCommand.exportByFilter(loadedFilter.all());
    }

    this.handleInteraction();
    showSuccessNotification('', _('Bulk download started.'));

    return promise
      .then(response => {
        const filename = generateFilename({
          fileNameFormat: listExportFileName,
          resourceType: pluralizeType(getEntityType(entities[0])),
          username,
        });
        const {data} = response;
        onDownload({filename, data});
        showSuccessNotification('', _('Bulk download completed.'));
      })
      .catch(error => {
        this.handleError(error);
      });
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

    return promise.then(deleted => {
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
    this.updateFilter(filter);
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

  handleFilterReset = () => {
    const {navigate, location, searchParams} = this.props;

    searchParams.delete('filter');

    navigate({
      pathname: location.pathname,
      search: searchParams.toString(),
    });

    this.changeFilter();
  };

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

    let resourceIds;
    let resourceIdsArray;
    let filter;
    if (selectionType === SelectionType.SELECTION_USER) {
      resourceIds = map(selected, res => res.id);
      resourceIdsArray = [...resourceIds];
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
        resource_ids: resourceIdsArray,
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
      isGenericBulkTrashcanDeleteDialog = true,
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
          isGenericBulkTrashcanDeleteDialog,
          selectionType: selectionType,
          sortBy,
          sortDir,
          onChanged: this.handleChanged,
          onDelete: this.handleDelete,
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
            onNewTagClick={this.openTagDialog}
            onSave={this.handleAddMultiTag}
            onTagChanged={this.handleTagChange}
          />
        )}
        {tagDialogVisible && (
          <TagDialog
            fixed={true}
            resource_type={entitiesType}
            resource_types={resourceTypes}
            resources={selected}
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
  deleteEntity: PropTypes.func,
  entities: PropTypes.array,
  entitiesCounts: PropTypes.counts,
  entitiesError: PropTypes.error,
  filter: PropTypes.filter,
  searchParams: PropTypes.object,
  location: PropTypes.object,
  gmp: PropTypes.gmp.isRequired,
  gmpname: PropTypes.string.isRequired,
  navigate: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isGenericBulkTrashcanDeleteDialog: PropTypes.bool,
  listExportFileName: PropTypes.string,
  loadSettings: PropTypes.func.isRequired,
  loadedFilter: PropTypes.filter,
  notify: PropTypes.func.isRequired,
  reload: PropTypes.func.isRequired,
  showError: PropTypes.func.isRequired,
  showErrorMessage: PropTypes.func.isRequired,
  showSuccessMessage: PropTypes.func.isRequired,
  updateFilter: PropTypes.func.isRequired,
  username: PropTypes.string,
  onDownload: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

const mapStateToProps = rootState => {
  const userDefaultsSelector = getUserSettingsDefaults(rootState);
  const username = getUsername(rootState);
  const listExportFileName =
    userDefaultsSelector.getValueByName('listexportfilename');
  return {
    listExportFileName,
    username,
  };
};

const mapDispatchToProps = (dispatch, {gmpname, gmp}) => {
  const deleteEntity = createDeleteEntity({entityType: gmpname});
  return {
    deleteEntity: id => dispatch(deleteEntity(gmp)(id)),
    loadSettings: () => dispatch(loadUserSettingDefaults(gmp)()),
    onInteraction: () => dispatch(renewSessionTimeout(gmp)()),
  };
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(EntitiesContainer);
