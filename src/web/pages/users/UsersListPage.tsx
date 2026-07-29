/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type ComponentType,
  type ReactElement,
  useCallback,
  useState,
} from 'react';
import {showSuccessNotification} from '@greenbone/ui-lib';
import {useQueryClient} from '@tanstack/react-query';
import type CollectionCounts from 'gmp/collection/collection-counts';
import type Rejection from 'gmp/http/rejection';
import {
  type FilterType,
  RESET_FILTER,
  USERS_FILTER_FILTER,
} from 'gmp/models/filter';
import type User from 'gmp/models/user';
import {isDefined} from 'gmp/utils/identity';
import ConfirmationDialog from 'web/components/dialog/ConfirmationDialog';
import {DELETE_ACTION} from 'web/components/dialog/DialogTwoButtonFooter';
import Download from 'web/components/form/Download';
import useDownload from 'web/components/form/useDownload';
import {UserIcon} from 'web/components/icon';
import PageTitle from 'web/components/layout/PageTitle';
import DialogNotification from 'web/components/notification/DialogNotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';
import BulkTags from 'web/entities/BulkTags';
import EntitiesPage from 'web/entities/EntitiesPage';
import {
  type UserBulkInput,
  useBulkDeleteUsers,
  useBulkExportUsers,
  useGetUsers,
} from 'web/hooks/use-query/users';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import useGmp from 'web/hooks/useGmp';
import usePageFilter from 'web/hooks/usePageFilter';
import usePagination from 'web/hooks/usePagination';
import useTranslation from 'web/hooks/useTranslation';
import UserComponent from 'web/pages/users/UserComponent';
import UserFilterDialog from 'web/pages/users/UserFilterDialog';
import UsersConfirmDeleteDialog from 'web/pages/users/UsersConfirmDeleteDialog';
import UsersListPageToolBarIcons from 'web/pages/users/UsersListPageToolBarIcons';
import UsersTable from 'web/pages/users/UsersTable';
import SelectionType, {type SelectionTypeType} from 'web/utils/selection-type';
import {type SortDirectionType} from 'web/utils/sort-direction';

interface ConfirmDeleteDialogProps {
  deleteUsers: User[];
  error?: string;
  inheritorUsers: User[];
  onErrorClose: () => void;
}

interface UsersTableElementProps {
  dialogConfig: {
    useCustomDialog: boolean;
    customDialogElement?: ReactElement | null;
    dialogProcessing?: boolean;
  };
  entities?: User[];
  entitiesCounts?: CollectionCounts;
  filter?: FilterType;
  isUpdating?: boolean;
  selectionType: SelectionTypeType;
  sortBy?: string;
  sortDir?: SortDirectionType;
  onDeleteBulk: () => void | Promise<void>;
  onDownloadBulk: () => Promise<void>;
  onEntityDeselected: (entity: User) => void;
  onEntitySelected: (entity: User) => void;
  onFirstClick: () => void;
  onLastClick: () => void;
  onNextClick: () => void;
  onPreviousClick: () => void;
  onSelectionTypeChange: (selectionType: SelectionTypeType) => void;
  onSortChange: (sortBy: string) => void;
  onTagsBulk: () => void;
  onUserCloneClick: (user: User) => void | Promise<void>;
  onUserDeleteClick: (user?: User) => void | Promise<void>;
  onUserDownloadClick: (user: User) => void | Promise<void>;
  onUserEditClick: (user: User) => void | Promise<void>;
}

const TypedConfirmDeleteDialog =
  UsersConfirmDeleteDialog as unknown as ComponentType<ConfirmDeleteDialogProps>;
const TypedUsersTable =
  UsersTable as unknown as ComponentType<UsersTableElementProps>;

const UsersListPage = () => {
  const [_] = useTranslation();
  const gmp = useGmp();
  const queryClient = useQueryClient();
  const {dialogState, closeDialog, showError} = useDialogNotification();
  const [downloadRef, handleDownload] = useDownload();
  const {title: dialogTitle, message: dialogMessage} = dialogState;

  const [filter, , {changeFilter, removeFilter, resetFilter}] = usePageFilter(
    'user',
    'user',
    {
      fallbackFilter: RESET_FILTER,
    },
  );

  const {
    data,
    isLoading: isLoadingEntities,
    isFetching: isUpdating,
  } = useGetUsers({filter});
  const entities = data?.entities;
  const entitiesCounts = data?.entitiesCounts;
  const entitiesError = undefined;

  const {data: allUsersData} = useGetUsers({filter: undefined});
  const allUsers = allUsersData?.entities ?? [];

  const [selected, setSelected] = useState<Set<User>>(new Set());
  const [selectionType, setSelectionType] = useState<SelectionTypeType>(
    SelectionType.SELECTION_PAGE_CONTENTS,
  );

  const handleFilterChanged = useCallback(
    (newFilter: FilterType) => {
      changeFilter(newFilter);
    },
    [changeFilter],
  );

  const handleFilterRemoved = useCallback(() => {
    removeFilter();
  }, [removeFilter]);

  const handleFilterReset = useCallback(() => {
    resetFilter();
  }, [resetFilter]);

  const [sortBy, sortDir, handleSortChange] = useFilterSortBy(
    filter,
    changeFilter,
  );

  const [getFirst, getLast, getNext, getPrevious] = usePagination(
    filter,
    entitiesCounts ?? ({} as CollectionCounts),
    handleFilterChanged,
  );

  const onChanged = useCallback(() => {
    void queryClient.invalidateQueries({queryKey: ['get_users']});
  }, [queryClient]);

  const handleError = useCallback(
    (error: Error | Rejection) => {
      showError(error);
    },
    [showError],
  );
  const bulkDeleteUsersMutation = useBulkDeleteUsers({
    onSuccess: () => onChanged(),
    onError: handleError,
  });
  const bulkExportUsersMutation = useBulkExportUsers({
    onError: handleError,
  });

  const handleEntitySelected = useCallback((entity: User) => {
    setSelected(prev => new Set(prev).add(entity));
  }, []);

  const handleEntityDeselected = useCallback((entity: User) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.delete(entity);
      return next;
    });
  }, []);

  const handleSelectionTypeChange = useCallback((type: SelectionTypeType) => {
    setSelectionType(type);
    if (type !== SelectionType.SELECTION_USER) {
      setSelected(new Set());
    }
  }, []);

  const [confirmDeleteDialogVisible, setConfirmDeleteDialogVisible] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteUsers, setDeleteUsers] = useState<User[]>([]);
  const [title, setTitle] = useState<string>();
  const [deleteDialogError, setDeleteDialogError] = useState<string>();
  const [isTagsDialogVisible, setIsTagsDialogVisible] = useState(false);

  const openTagsDialog = useCallback(() => {
    setIsTagsDialogVisible(true);
  }, []);

  const closeTagsDialog = useCallback(() => {
    setIsTagsDialogVisible(false);
  }, []);

  const handleDeleteUser = ({
    deleteUsers: usersToDelete,
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
    return bulkDeleteUsersMutation.mutateAsync({
      users: usersToDelete,
      options: deleteOptions,
    });
  };

  const openConfirmDeleteDialog = async (user?: User) => {
    setDeleteDialogError(undefined);

    if (isDefined(user)) {
      setConfirmDeleteDialogVisible(true);
      setDeleteUsers([user]);
      setTitle(
        _(`Confirm deletion of user {{- name}}`, {name: user.name ?? ''}),
      );
    } else {
      let usersToDelete: User[] = [];
      if (selectionType === SelectionType.SELECTION_USER) {
        usersToDelete = [...selected];
      } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
        usersToDelete = entities ?? [];
      } else {
        const resp = await gmp.users.getAll({filter});
        usersToDelete = resp.data;
      }
      setConfirmDeleteDialogVisible(true);
      setDeleteUsers(usersToDelete);
      setTitle(_(`Confirm deletion of users`));
    }
  };

  const deleteUserIds = new Set(deleteUsers.map(lUser => lUser.id));
  const inheritorUsers = allUsers.filter(user => !deleteUserIds.has(user.id));

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

  const closeConfirmDeleteDialog = () => {
    setConfirmDeleteDialogVisible(false);
  };

  const handleCloseConfirmDeleteDialog = () => {
    closeConfirmDeleteDialog();
    setDeleteUsers([]);
    setDeleteDialogError(undefined);
  };

  const handleErrorClose = () => {
    setDeleteDialogError(undefined);
  };

  const handleDownloadBulk = useCallback(async () => {
    let input: UserBulkInput;

    if (selectionType === SelectionType.SELECTION_USER) {
      input = [...selected];
    } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      input = filter;
    } else {
      input = filter.all();
    }

    showSuccessNotification('', _('Bulk download started.'));

    try {
      const response = await bulkExportUsersMutation.mutateAsync(input);
      handleDownload({filename: 'users.xml', data: response.data});
      showSuccessNotification('', _('Bulk download completed.'));
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [
    selectionType,
    selected,
    filter,
    bulkExportUsersMutation,
    handleDownload,
    handleError,
    _,
  ]);

  return (
    <UserComponent
      onCloneError={handleError}
      onCloned={onChanged}
      onCreated={onChanged}
      onDeleteError={handleError}
      onDeleted={onChanged}
      onDownloadError={handleError}
      onDownloaded={handleDownload}
      onSaved={onChanged}
    >
      {({clone, create, download, edit}) => (
        <>
          <DialogNotification
            message={dialogMessage}
            title={dialogTitle}
            onCloseClick={closeDialog}
          />
          <Download ref={downloadRef} />
          <PageTitle title={_('Users')} />
          <EntitiesPage<User>
            createFilterType="user"
            entities={entities}
            entitiesCounts={entitiesCounts}
            entitiesError={entitiesError}
            filter={filter}
            filterEditDialog={UserFilterDialog}
            filtersFilter={USERS_FILTER_FILTER}
            isLoading={isLoadingEntities}
            sectionIcon={<UserIcon size="large" />}
            table={
              <TypedUsersTable
                dialogConfig={{
                  useCustomDialog: true,
                  dialogProcessing: isLoading,
                  customDialogElement: confirmDeleteDialogVisible ? (
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
                  ) : null,
                }}
                entities={entities}
                entitiesCounts={entitiesCounts}
                filter={filter}
                isUpdating={isUpdating}
                selectionType={selectionType}
                sortBy={sortBy}
                sortDir={sortDir}
                onDeleteBulk={openConfirmDeleteDialog}
                onDownloadBulk={handleDownloadBulk}
                onEntityDeselected={handleEntityDeselected}
                onEntitySelected={handleEntitySelected}
                onFirstClick={getFirst}
                onLastClick={getLast}
                onNextClick={getNext}
                onPreviousClick={getPrevious}
                onSelectionTypeChange={handleSelectionTypeChange}
                onSortChange={handleSortChange}
                onTagsBulk={openTagsDialog}
                onUserCloneClick={clone}
                onUserDeleteClick={openConfirmDeleteDialog}
                onUserDownloadClick={download}
                onUserEditClick={edit}
              />
            }
            title={_('Users')}
            toolBarIcons={
              <UsersListPageToolBarIcons onUserCreateClick={create} />
            }
            onError={handleError}
            onFilterChanged={handleFilterChanged}
            onFilterCreated={handleFilterChanged}
            onFilterRemoved={handleFilterRemoved}
            onFilterReset={handleFilterReset}
          />
          {isTagsDialogVisible && (
            <BulkTags
              entities={entities ?? []}
              entitiesCounts={entitiesCounts ?? ({} as CollectionCounts)}
              filter={filter}
              selectedEntities={[...selected]}
              selectionType={selectionType}
              onClose={closeTagsDialog}
            />
          )}
        </>
      )}
    </UserComponent>
  );
};

export default UsersListPage;
