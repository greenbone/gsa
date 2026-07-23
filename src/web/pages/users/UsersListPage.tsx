/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ComponentType, type ReactNode, useState} from 'react';
import {showSuccessNotification} from '@greenbone/ui-lib';
import {connect} from 'react-redux';
import type CollectionCounts from 'gmp/collection/collection-counts';
import type Gmp from 'gmp/gmp';
import type Rejection from 'gmp/http/rejection';
import {USERS_FILTER_FILTER, type default as Filter} from 'gmp/models/filter';
import type User from 'gmp/models/user';
import {isDefined} from 'gmp/utils/identity';
import ConfirmationDialog from 'web/components/dialog/ConfirmationDialog';
import {DELETE_ACTION} from 'web/components/dialog/DialogTwoButtonFooter';
import {NewIcon, UserIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer, {
  type WithEntitiesContainerComponentProps,
} from 'web/entities/withEntitiesContainer';
import {type OnDownloadedFunc} from 'web/entity/hooks/useEntityDownload';
import useCapabilities from 'web/hooks/useCapabilities';
import useGmp from 'web/hooks/useGmp';
import usePagination from 'web/hooks/usePagination';
import useTranslation from 'web/hooks/useTranslation';
import ConfirmDeleteDialog from 'web/pages/users/ConfirmDeleteDialog';
import {type UserDialogSaveData} from 'web/pages/users/Dialog';
import UsersTable from 'web/pages/users/Table';
import UserComponent from 'web/pages/users/UserComponent';
import UserFilterDialog from 'web/pages/users/UserFilterDialog';
import {
  selector as entitiesSelector,
  loadAllEntities,
  loadEntities,
} from 'web/store/entities/users';
import compose from 'web/utils/compose';
import type SelectionTypeType from 'web/utils/selection-type';

interface UsersListPageToolBarIconsProps {
  onUserCreateClick: () => void | Promise<void>;
}

export interface UsersListPageProps extends WithEntitiesContainerComponentProps<User> {
  allUsers: User[];
  entitiesCounts: CollectionCounts;
  filter: Filter;
  loadAll: () => void;
}

interface UsersEntitiesPageProps {
  dialogConfig: {
    useCustomDialog: boolean;
    dialogProcessing: boolean;
    customDialogElement: ReactNode;
  };
  entitiesSelected?: Set<User>;
  selectionType: SelectionTypeType;
  onChanged: () => void;
  onDeleteBulk: () => void | Promise<void>;
  onDownloadBulk: () => Promise<void>;
  onDownloaded: OnDownloadedFunc;
  onEntityDeselected: (entity: User) => void;
  onEntitySelected: (entity: User) => void;
  onError: (error: Error | Rejection) => void;
  onFilterChanged: (newFilter: Filter) => void;
  onFilterCreated: (newFilter: Filter) => void;
  onFilterRemoved: () => void;
  onFilterReset: () => void;
  onFirstClick: () => void;
  onLastClick: () => void;
  onNextClick: () => void;
  onPreviousClick: () => void;
  onSelectionTypeChange: (selectionType: SelectionTypeType) => void;
  onTagsBulk: () => void;
  onUserCloneClick: (user: User) => void | Promise<void>;
  onUserCreateClick: () => void | Promise<void>;
  onUserDeleteClick: (user?: User) => void | Promise<void>;
  onUserDownloadClick: (user: User) => void | Promise<void>;
  onUserEditClick: (user: User) => void | Promise<void>;
  onUserSaveClick?: (data: UserDialogSaveData) => void | Promise<unknown>;
}

interface ConfirmDeleteDialogProps {
  deleteUsers: User[];
  error?: string;
  inheritorUsers: User[];
  onErrorClose: () => void;
}

const TypedConfirmDeleteDialog =
  ConfirmDeleteDialog as unknown as ComponentType<ConfirmDeleteDialogProps>;

export const UsersListPageToolBarIcons = ({
  onUserCreateClick,
}: UsersListPageToolBarIconsProps) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        anchor="managing-users"
        page="web-interface-access"
        title={_('Help: Users')}
      />
      {capabilities.mayCreate('user') && (
        <NewIcon title={_('New User')} onClick={onUserCreateClick} />
      )}
    </IconDivider>
  );
};

const UsersListPage = ({
  allUsers = [],
  entities,
  entitiesCounts,
  entitiesError,
  entitiesSelected,
  filter,
  isLoading: isLoadingEntities,
  loadAll,
  selectionType,
  onChanged,
  onDeleteBulk,
  onDownloadBulk,
  onDownloaded,
  onEntityDeselected,
  onEntitySelected,
  onError,
  onFilterChanged,
  onFilterCreated,
  onFilterRemoved,
  onFilterReset,
  onSelectionTypeChange,
  onTagsBulk,
}: UsersListPageProps) => {
  const [_] = useTranslation();
  const gmp = useGmp();

  const [confirmDeleteDialogVisible, setConfirmDeleteDialogVisible] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [deleteUsers, setDeleteUsers] = useState<User[]>([]);
  const [title, setTitle] = useState<string>();
  const [deleteDialogError, setDeleteDialogError] = useState<string>();

  const [getFirst, getLast, getNext, getPrevious] = usePagination(
    filter,
    entitiesCounts,
    onFilterChanged,
  );

  const closeConfirmDeleteDialog = () => {
    setConfirmDeleteDialogVisible(false);
  };

  const handleCloseConfirmDeleteDialog = () => {
    closeConfirmDeleteDialog();
    setDeleteUsers([]);
    setDeleteDialogError(undefined);
  };

  const handleDeleteUser = ({
    deleteUsers,
    inheritorId,
  }: {
    deleteUsers: User[];
    inheritorId?: string;
  }) => {
    let inheritor = inheritorId;
    if (inheritor === '--') {
      inheritor = undefined;
    }
    const deleteOptions = isDefined(inheritor) ? {inheritor_id: inheritor} : {};
    return gmp.users.delete(deleteUsers, deleteOptions).then(onChanged);
  };

  const openConfirmDeleteDialog = async (user?: User) => {
    setDeleteDialogError(undefined);
    try {
      loadAll();
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }

    if (isDefined(user)) {
      setConfirmDeleteDialogVisible(true);
      setDeleteUsers([user]);
      setTitle(
        _(`Confirm deletion of user {{- name}}`, {name: user.name ?? ''}),
      );
    } else {
      let deleteUsers: User[] = [];
      if (selectionType === SelectionType.SELECTION_USER) {
        deleteUsers = isDefined(entitiesSelected) ? [...entitiesSelected] : [];
      } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
        deleteUsers = entities ?? [];
      } else {
        const resp = await gmp.users.getAll({filter});
        deleteUsers = resp.data;
      }
      setConfirmDeleteDialogVisible(true);
      setDeleteUsers(deleteUsers);
      setTitle(_(`Confirm deletion of users`));
    }
  };

  const deleteUserIds = deleteUsers.map(lUser => lUser.id);
  const inheritorUsers = allUsers.filter(
    user => !deleteUserIds.includes(user.id),
  );

  const handleSaveClick = async () => {
    const data = {deleteUsers, inheritorId: '--'};
    setDeleteDialogError(undefined);
    setIsLoading(true);
    const promise = handleDeleteUser(data);
    if (isDefined(promise)) {
      try {
        const response = await promise;
        showSuccessNotification(
          '',
          _('{{count}} user(s) deleted successfully', {
            count: deleteUsers.length,
          }),
        );
        closeConfirmDeleteDialog();
        setIsLoading(false);
        return response;
      } catch (error) {
        setIsLoading(false);
        setDeleteDialogError(
          error instanceof Error
            ? error.message || 'An error occurred during deletion'
            : 'An error occurred during deletion',
        );
      }
    } else {
      setIsLoading(false);
      closeConfirmDeleteDialog();
    }
  };

  const handleErrorClose = () => {
    setDeleteDialogError(undefined);
  };

  return (
    <UserComponent
      onCloneError={onError}
      onCloned={onChanged}
      onCreated={onChanged}
      onDeleteError={onError}
      onDeleted={onChanged}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onSaved={onChanged}
    >
      {({clone, create, download, edit, save}) => (
        <>
          <PageTitle title={_('Users')} />
          <EntitiesPage<User, UsersEntitiesPageProps>
            createFilterType="user"
            dialogConfig={{
              useCustomDialog: true,
              dialogProcessing: isLoading,
              customDialogElement: confirmDeleteDialogVisible && (
                <ConfirmationDialog
                  content={
                    <TypedConfirmDeleteDialog
                      deleteUsers={deleteUsers}
                      error={deleteDialogError}
                      inheritorUsers={inheritorUsers}
                      onErrorClose={handleErrorClose}
                    />
                  }
                  loading={isLoading}
                  rightButtonAction={DELETE_ACTION}
                  rightButtonTitle={_('Delete')}
                  title={title ?? ''}
                  onClose={handleCloseConfirmDeleteDialog}
                  onResumeClick={handleSaveClick}
                />
              ),
            }}
            entities={entities}
            entitiesCounts={entitiesCounts}
            entitiesError={entitiesError}
            entitiesSelected={entitiesSelected}
            filter={filter}
            filterEditDialog={UserFilterDialog}
            filtersFilter={USERS_FILTER_FILTER}
            isLoading={isLoadingEntities}
            sectionIcon={<UserIcon size="large" />}
            selectionType={selectionType}
            table={UsersTable}
            title={_('Users')}
            toolBarIcons={UsersListPageToolBarIcons}
            onChanged={onChanged}
            onDeleteBulk={openConfirmDeleteDialog}
            onDownloadBulk={onDownloadBulk}
            onDownloaded={onDownloaded}
            onEntityDeselected={onEntityDeselected}
            onEntitySelected={onEntitySelected}
            onError={onError}
            onFilterChanged={onFilterChanged}
            onFilterCreated={onFilterCreated}
            onFilterRemoved={onFilterRemoved}
            onFilterReset={onFilterReset}
            onFirstClick={getFirst}
            onLastClick={getLast}
            onNextClick={getNext}
            onPreviousClick={getPrevious}
            onSelectionTypeChange={onSelectionTypeChange}
            onTagsBulk={onTagsBulk}
            onUserCloneClick={clone}
            onUserCreateClick={create}
            onUserDeleteClick={openConfirmDeleteDialog}
            onUserDownloadClick={download}
            onUserEditClick={edit}
            onUserSaveClick={save}
          />
        </>
      )}
    </UserComponent>
  );
};

const mapStateToProps = (state: unknown): {allUsers: User[]} => {
  const selector = entitiesSelector(state);
  return {
    allUsers: selector.getAllEntities(),
  };
};

const mapDispatchToProps = (dispatch, {gmp}: {gmp: Gmp}) => ({
  loadAll: () => dispatch(loadAllEntities(gmp)()),
});

export default compose(
  withEntitiesContainer<User>('user', {
    entitiesSelector,
    loadEntities,
  }),
  connect(mapStateToProps, mapDispatchToProps),
)(UsersListPage);
