/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {showSuccessNotification} from '@greenbone/ui-lib';
import {connect} from 'react-redux';
import {Location} from 'react-router';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import EntitiesCommand from 'gmp/commands/entities';
import Gmp from 'gmp/gmp';
import Rejection from 'gmp/http/rejection';
import Response from 'gmp/http/response';
import {XmlMeta, XmlResponseData} from 'gmp/http/transform/fastxml';
import {TranslateOptions} from 'gmp/locale/lang';
import logger from 'gmp/log';
import Filter, {RESET_FILTER} from 'gmp/models/filter';
import Model from 'gmp/models/model';
import Tag from 'gmp/models/tag';
import {YES_VALUE} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {
  getEntityType,
  apiType,
  typeName,
  pluralizeType,
  EntityType,
} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import {
  OnFilterChangedFunc,
  OnFilterCreatedFunc,
} from 'web/components/powerfilter/useFilterDialogSave';
import TagsDialog, {TagsDialogData} from 'web/entities/TagsDialog';
import actionFunction from 'web/entity/hooks/actionFunction';
import {OnDownloadedFunc} from 'web/entity/hooks/useEntityDownload';
import TagDialog from 'web/pages/tags/Dialog';
import {createDeleteEntity} from 'web/store/entities/utils/actions';
import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {getUsername} from 'web/store/usersettings/selectors';
import compose from 'web/utils/Compose';
import {generateFilename} from 'web/utils/Render';
import SelectionType, {SelectionTypeType} from 'web/utils/SelectionType';
import SortDirection, {SortDirectionType} from 'web/utils/SortDirection';
import {withRouter} from 'web/utils/withRouter';
import withTranslation from 'web/utils/withTranslation';

type NavigateFunction = (args: {pathname: string; search?: string}) => void;

export interface EntitiesContainerRenderProps<TModel extends Model = Model> {
  createFilterType: EntityType;
  entities?: TModel[];
  entitiesCounts?: CollectionCounts;
  entitiesError?: Error | Rejection;
  entitiesSelected?: Set<TModel>;
  filter?: Filter;
  isLoading: boolean;
  isUpdating: boolean;
  selectionType: SelectionTypeType;
  sortBy: string | undefined;
  sortDir: SortDirectionType;
  onChanged: () => void;
  onDelete: (entity: TModel) => Promise<void>;
  onDeleteBulk: () => Promise<void>;
  onAuthorizeBulk: () => Promise<void> | void;
  onRevokeBulk: () => Promise<void> | void;
  onDownloadBulk: () => Promise<void>;
  onDownloaded: OnDownloadedFunc;
  onEntitySelected: (entity: TModel) => void;
  onEntityDeselected: (entity: TModel) => void;
  onError: (error: Error | Rejection) => void;
  onFilterChanged: OnFilterChangedFunc;
  onFilterCreated: OnFilterCreatedFunc;
  onFilterRemoved: () => void;
  onFilterReset: () => void;
  onFirstClick: () => void;
  onLastClick: () => void;
  onNextClick: () => void;
  onPreviousClick: () => void;
  onSortChange: (field: string) => void;
  onSelectionTypeChange: (selectionType: SelectionTypeType) => void;
  onTagsBulk: () => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
}

interface EntitiesContainerState<TModel extends Model = Model> {
  entities?: TModel[];
  entitiesCounts?: CollectionCounts;
  entitiesError?: Error | Rejection;
  isUpdating: boolean;
  loadedFilter?: Filter;
  multiTagEntitiesCount?: number;
  selected?: Set<TModel>;
  selectionType: SelectionTypeType;
  tagDialogVisible: boolean;
  tag?: Tag;
  tags: Tag[];
  tagsDialogVisible: boolean;
}

interface EntitiesContainerProps<TModel extends Model = Model> {
  children: (props: EntitiesContainerRenderProps<TModel>) => React.ReactNode;
  entities?: TModel[];
  entitiesCounts?: CollectionCounts;
  entitiesError?: Error | Rejection;
  filter: Filter;
  gmp: Gmp;
  gmpName: EntityType;
  isLoading?: boolean;
  loadedFilter?: Filter;
  notify: (message: string) => () => void;
  reload: (filter?: Filter) => void;
  showError: (error: Error | Rejection) => void;
  showErrorMessage: (message: string) => void;
  showSuccessMessage: (message: string) => void;
  updateFilter: (filter?: Filter) => void;
  onDownload: (data: {filename: string; data: string}) => void;
}

interface EntitiesContainerPropsWithHOCs<TModel extends Model = Model>
  extends EntitiesContainerProps<TModel> {
  deleteEntity: (id: string) => Promise<void>;
  loadSettings: () => void;
  location: Location;
  listExportFileName: string;
  navigate: NavigateFunction;
  searchParams: URLSearchParams;
  username: string;
  _: (message: string, options?: TranslateOptions) => string;
}

const log = logger.getLogger('web.entities.container');

class EntitiesContainer<TModel extends Model> extends React.Component<
  EntitiesContainerPropsWithHOCs<TModel>,
  EntitiesContainerState<TModel>
> {
  isRunning: boolean = false;
  notifyTimer: () => void;
  notifyChanged: () => void;
  entitiesCommand: EntitiesCommand<TModel>;

  constructor(props: EntitiesContainerPropsWithHOCs<TModel>) {
    super(props);

    this.state = {
      isUpdating: false,
      selectionType: SelectionType.SELECTION_PAGE_CONTENTS,
      tags: [],
      tagDialogVisible: false,
      tagsDialogVisible: false,
    };

    const {gmpName, gmp, notify} = this.props;

    const entitiesCommandName = pluralizeType(gmpName);

    this.entitiesCommand = gmp[entitiesCommandName];

    if (!isDefined(this.entitiesCommand)) {
      throw new Error(
        `EntitiesContainer: gmp.${entitiesCommandName} is not defined.`,
      );
    }

    this.notifyTimer = notify(`${entitiesCommandName}.timer`);
    this.notifyChanged = notify(`${entitiesCommandName}.changed`);

    this.handleChanged = this.handleChanged.bind(this);
    this.handleCreateTag = this.handleCreateTag.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleDeselected = this.handleDeselected.bind(this);
    this.handleDeleteBulk = this.handleDeleteBulk.bind(this);
    this.handleAuthorizeBulk = this.handleAuthorizeBulk.bind(this);
    this.handleRevokeBulk = this.handleRevokeBulk.bind(this);
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
  }

  static getDerivedStateFromProps(
    props: EntitiesContainerPropsWithHOCs,
    state: EntitiesContainerState,
  ) {
    if (isDefined(props.entities)) {
      // update only if new entities are available to avoid having no entities
      // when the filter changes
      return {
        entities: props.entities,
        entitiesCounts: props.entitiesCounts,
        entitiesError: props.entitiesError,
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

  updateFilter(filter?: Filter) {
    this.props.updateFilter(filter);
    this.props.reload(filter);
  }

  handleDelete(entity: TModel) {
    const {_} = this.props;

    const {deleteEntity} = this.props;

    return actionFunction(deleteEntity(entity?.id as string), {
      onSuccess: this.handleChanged,
      onError: this.handleError,
      successMessage: _('{{name}} deleted successfully.', {
        name: entity?.name as string,
      }),
    });
  }

  handleChanged() {
    this.notifyChanged();

    this.props.reload();
  }

  handleSelectionTypeChange(selectionType: SelectionTypeType) {
    let selected: Set<TModel> | undefined;

    if (selectionType === SelectionType.SELECTION_USER) {
      selected = new Set();
    } else {
      selected = undefined;
    }

    this.setState({selectionType, selected});
  }

  async handleDownloadBulk() {
    const {_} = this.props;

    const {entitiesCommand} = this;
    const {entities = [], loadedFilter, selected, selectionType} = this.state;
    const {listExportFileName, username, onDownload} = this.props;

    let promise: Promise<Response<XmlResponseData, XmlMeta>>;

    if (selectionType === SelectionType.SELECTION_USER) {
      promise = entitiesCommand.export(Array.from(selected as Set<TModel>));
    } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      promise = entitiesCommand.exportByFilter(loadedFilter as Filter);
    } else {
      promise = entitiesCommand.exportByFilter((loadedFilter as Filter).all());
    }

    showSuccessNotification('', _('Bulk download started.'));

    try {
      const response = await promise;
      const filename = generateFilename({
        fileNameFormat: listExportFileName,
        resourceType: pluralizeType(getEntityType(entities[0])),
        username,
      });
      const {data} = response;
      // @ts-expect-error
      onDownload({filename, data});
      showSuccessNotification('', _('Bulk download completed.'));
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  async handleDeleteBulk() {
    const {entitiesCommand} = this;
    const {loadedFilter, selected, selectionType} = this.state;
    let promise: Promise<Response<TModel[], XmlMeta>>;

    if (selectionType === SelectionType.SELECTION_USER) {
      promise = entitiesCommand.delete(Array.from(selected as Set<TModel>));
    } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      promise = entitiesCommand.deleteByFilter(loadedFilter as Filter);
    } else {
      promise = entitiesCommand.deleteByFilter((loadedFilter as Filter).all());
    }

    try {
      const deleted = await promise;
      log.debug('successfully deleted entities', deleted);
      this.handleChanged();
      return await Promise.resolve();
    } catch (error) {
      this.handleError(error as Error);
      return await Promise.reject(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  async handleAuthorizeBulk() {
    const {entitiesCommand} = this;
    const {entities = [], selected, selectionType} = this.state;

    try {
      if (selectionType === SelectionType.SELECTION_USER) {
        await entitiesCommand.authorize(Array.from(selected as Set<TModel>));
      } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
        await entitiesCommand.authorize(entities);
      } else {
        await entitiesCommand.authorize(entities);
      }
      this.handleChanged();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  async handleRevokeBulk() {
    const {entitiesCommand} = this;
    const {entities = [], selected, selectionType} = this.state;

    try {
      if (selectionType === SelectionType.SELECTION_USER) {
        await entitiesCommand.revoke(Array.from(selected as Set<TModel>));
      } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
        await entitiesCommand.revoke(entities);
      } else {
        await entitiesCommand.revoke(entities);
      }
      this.handleChanged();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  handleSelected(entity: TModel) {
    const {selected} = this.state as {selected: Set<TModel>};

    selected.add(entity);

    this.setState({selected});
  }

  handleDeselected(entity: TModel) {
    const {selected} = this.state as {selected: Set<TModel>};

    selected.delete(entity);

    this.setState({selected});
  }

  handleSortChange(field: string) {
    const {loadedFilter} = this.state as {loadedFilter: Filter};

    let sort = 'sort';
    const sortField = loadedFilter.getSortBy();

    const filter = loadedFilter.first();

    if (sortField && sortField === field) {
      sort = filter.getSortOrder() === 'sort' ? 'sort-reverse' : 'sort';
    }

    filter.set(sort, field);

    this.changeFilter(filter);
  }

  handleError(error: Error) {
    const {showError} = this.props;
    log.error(error);
    showError(error);
  }

  changeFilter(filter?: Filter) {
    this.updateFilter(filter);
  }

  handleFirst() {
    const {loadedFilter: filter} = this.state as {loadedFilter: Filter};

    this.changeFilter(filter.first());
  }

  handleNext() {
    const {loadedFilter: filter} = this.state as {loadedFilter: Filter};

    this.changeFilter(filter.next());
  }

  handlePrevious() {
    const {loadedFilter: filter} = this.state as {loadedFilter: Filter};

    this.changeFilter(filter.previous());
  }

  handleLast() {
    const {loadedFilter: filter, entitiesCounts: counts} = this.state as {
      loadedFilter: Filter;
      entitiesCounts: CollectionCounts;
    };

    const last =
      Math.floor((counts.filtered - 1) / counts.rows) * counts.rows + 1;

    this.changeFilter(filter.first(last));
  }

  handleFilterCreated(filter: Filter) {
    this.changeFilter(filter);
  }

  handleFilterChanged(filter: Filter) {
    this.changeFilter(filter);
  }

  handleFilterRemoved() {
    this.changeFilter(RESET_FILTER);
  }

  handleFilterReset() {
    const {navigate, location, searchParams} = this.props;

    searchParams.delete('filter');

    navigate({
      pathname: location.pathname,
      search: searchParams.toString(),
    });

    this.changeFilter();
  }

  openTagDialog() {
    this.setState({tagDialogVisible: true});
  }

  closeTagDialog() {
    this.setState({tagDialogVisible: false});
  }

  handleCloseTagDialog() {
    this.closeTagDialog();
  }

  handleCreateTag(data) {
    const {gmp} = this.props;
    const {tags} = this.state;

    return (
      // @ts-expect-error
      gmp.tag
        .create(data)
        // @ts-expect-error
        .then(response => gmp.tag.get(response.data))
        .then(response => {
          this.closeTagDialog();
          this.setState({
            tag: response.data,
            tags: [...tags, response.data],
          });
        })
    );
  }

  handleTagChange(id: string) {
    const {gmp} = this.props;

    // @ts-expect-error
    gmp.tag.get({id}).then(response => {
      this.setState({
        tag: response.data,
      });
    });
  }

  handleAddMultiTag({comment, id, name, value = ''}: TagsDialogData) {
    const {gmp} = this.props;
    const {loadedFilter, selectionType, selected, entities = []} = this.state;

    const entitiesType = getEntityType(entities[0]);

    let resourceIds: string[] | undefined;
    let filter;
    if (selectionType === SelectionType.SELECTION_USER) {
      resourceIds = map(selected, res => res.id as string);
      filter = undefined;
    } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      filter = loadedFilter;
    } else {
      filter = (loadedFilter as Filter).all();
    }

    // @ts-expect-error
    return gmp.tag
      .save({
        active: YES_VALUE,
        comment,
        filter,
        id,
        name,
        resource_ids: resourceIds,
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
  }

  closeTagsDialog() {
    this.setState({tagsDialogVisible: false});
  }

  handleCloseTagsDialog() {
    this.closeTagsDialog();
  }

  getTagsByType() {
    const {gmp} = this.props;
    const {entities} = this.state as {entities: TModel[]};

    if (entities.length > 0) {
      const filter = 'resource_type=' + apiType(getEntityType(entities[0]));
      // @ts-expect-error
      gmp.tags.getAll({filter}).then(response => {
        const {data: tags} = response;
        this.setState({tags});
      });
    }
  }

  getMultiTagEntitiesCount() {
    const {selectionType, selected, entities, entitiesCounts} = this.state;

    if (selectionType === SelectionType.SELECTION_USER) {
      return (selected as Set<TModel>).size;
    }

    if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      return (entities as TModel[]).length;
    }

    return (entitiesCounts as CollectionCounts).filtered;
  }

  render() {
    const {_} = this.props;

    const {
      entities,
      entitiesCounts,
      entitiesError,
      isUpdating,
      loadedFilter,
      multiTagEntitiesCount,
      selected,
      selectionType,
      tag,
      tags,
      tagDialogVisible,
      tagsDialogVisible,
    } = this.state;
    const {
      children,
      isLoading = false,
      onDownload,
      showErrorMessage,
      showSuccessMessage,
    } = this.props;

    let entitiesType: EntityType | undefined;
    let resourceTypes: [string, string][] | undefined;
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

    const reverseField = isDefined(loadedFilter)
      ? (loadedFilter.get('sort-reverse') as string)
      : undefined;
    const reverse = isDefined(reverseField);
    const sortBy =
      reverse || !isDefined(loadedFilter)
        ? reverseField
        : (loadedFilter.get('sort') as string);
    const sortDir = reverse ? SortDirection.DESC : SortDirection.ASC;
    return (
      <React.Fragment>
        {children({
          createFilterType: this.props.gmpName,
          entities,
          entitiesCounts,
          entitiesError,
          entitiesSelected: selected,
          filter: loadedFilter,
          isLoading,
          isUpdating,
          selectionType: selectionType,
          sortBy,
          sortDir,
          onChanged: this.handleChanged,
          onDelete: this.handleDelete,
          onDeleteBulk: this.handleDeleteBulk,
          onAuthorizeBulk: this.handleAuthorizeBulk,
          onRevokeBulk: this.handleRevokeBulk,
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
            comment={tag?.comment}
            entitiesCount={multiTagEntitiesCount}
            name={tag?.name}
            tagId={tag?.id}
            tags={tags}
            title={title}
            value={tag?.value}
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

const mapDispatchToProps = (
  dispatch,
  {gmpName, gmp}: {gmpName: string; gmp: Gmp},
) => {
  const deleteEntity = createDeleteEntity({entityType: gmpName});
  return {
    deleteEntity: (id: string) => dispatch(deleteEntity(gmp)(id)),
    loadSettings: () => dispatch(loadUserSettingDefaults(gmp)()),
  };
};

export default compose(
  withTranslation,
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(EntitiesContainer) as <TModel extends Model>(
  props: EntitiesContainerProps<TModel>,
) => React.ReactElement<EntitiesContainerPropsWithHOCs<TModel>>;
