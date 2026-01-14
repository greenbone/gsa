/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {showSuccessNotification} from '@greenbone/ui-lib';
import {connect} from 'react-redux';
import {USERS_FILTER_FILTER} from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import ConfirmationDialog from 'web/components/dialog/ConfirmationDialog';
import {DELETE_ACTION} from 'web/components/dialog/DialogTwoButtonFooter';
import {NewIcon, UserIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useCapabilities from 'web/hooks/useCapabilities';
import useGmp from 'web/hooks/useGmp';
import usePagination from 'web/hooks/usePagination';
import useTranslation from 'web/hooks/useTranslation';
import ConfirmDeleteDialog from 'web/pages/users/ConfirmDeleteDialog';
import UsersTable from 'web/pages/users/Table';
import UserComponent from 'web/pages/users/UserComponent';
import UserFilterDialog from 'web/pages/users/UserFilterDialog';
import {
  selector as entitiesSelector,
  loadAllEntities,
  loadEntities,
} from 'web/store/entities/users';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import SelectionType from 'web/utils/SelectionType';

export const UsersListPageToolBarIcons = ({onUserCreateClick}) => {
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

UsersListPageToolBarIcons.propTypes = {
  onUserCreateClick: PropTypes.func.isRequired,
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
}) => {
  const [_] = useTranslation();
  const gmp = useGmp();

  const [confirmDeleteDialogVisible, setConfirmDeleteDialogVisible] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [deleteUsers, setDeleteUsers] = useState([]);
  const [title, setTitle] = useState();
  const [deleteDialogError, setDeleteDialogError] = useState();

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

  const handleDeleteUser = ({deleteUsers, inheritorId}) => {
    let inheritor = inheritorId;
    if (inheritor === '--') {
      inheritor = undefined;
    }

    if (deleteUsers.length === 1) {
      const {id} = deleteUsers[0];
      return gmp.user.delete({id, inheritorId: inheritor}).then(onChanged);
    }
    return gmp.users
      .delete(deleteUsers, {inheritor_id: inheritor})
      .then(onChanged);
  };

  const openConfirmDeleteDialog = async user => {
    setDeleteDialogError(undefined);
    try {
      loadAll();
    } catch (error) {
      onError(error);
    }

    if (isDefined(user)) {
      setConfirmDeleteDialogVisible(true);
      setDeleteUsers([user]);
      setTitle(_(`Confirm deletion of user {{name}}`, user));
    } else {
      let deleteUsers;
      if (selectionType === SelectionType.SELECTION_USER) {
        deleteUsers = [...entitiesSelected];
      } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
        deleteUsers = entities;
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
          error.message || 'An error occurred during deletion',
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
          <EntitiesPage
            createFilterType="user"
            dialogConfig={{
              useCustomDialog: true,
              dialogProcessing: isLoading,
              customDialogElement: confirmDeleteDialogVisible && (
                <ConfirmationDialog
                  content={
                    <ConfirmDeleteDialog
                      deleteUsers={deleteUsers}
                      error={deleteDialogError}
                      inheritorUsers={inheritorUsers}
                      onErrorClose={handleErrorClose}
                    />
                  }
                  loading={isLoading}
                  rightButtonAction={DELETE_ACTION}
                  rightButtonTitle={_('Delete')}
                  title={title}
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

UsersListPage.propTypes = {
  allUsers: PropTypes.array,
  entities: PropTypes.array,
  entitiesCounts: PropTypes.object,
  entitiesError: PropTypes.object,
  entitiesSelected: PropTypes.set,
  filter: PropTypes.filter,
  isLoading: PropTypes.bool,
  loadAll: PropTypes.func.isRequired,
  selectionType: PropTypes.string.isRequired,
  onChanged: PropTypes.func.isRequired,
  onDeleteBulk: PropTypes.func,
  onDownloadBulk: PropTypes.func,
  onDownloaded: PropTypes.func.isRequired,
  onEntityDeselected: PropTypes.func,
  onEntitySelected: PropTypes.func,
  onError: PropTypes.func.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
  onFilterCreated: PropTypes.func,
  onFilterRemoved: PropTypes.func,
  onFilterReset: PropTypes.func,
  onSelectionTypeChange: PropTypes.func,
  onTagsBulk: PropTypes.func,
};

const mapStateToProps = state => {
  const selector = entitiesSelector(state);
  return {
    allUsers: selector.getAllEntities(),
  };
};

const mapDispatchToProps = (dispatch, {gmp}) => ({
  loadAll: () => dispatch(loadAllEntities(gmp)()),
});

export default compose(
  withEntitiesContainer('user', {
    entitiesSelector,
    loadEntities,
  }),
  connect(mapStateToProps, mapDispatchToProps),
)(UsersListPage);
