/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {USERS_FILTER_FILTER} from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import {connect} from 'react-redux';
import {NewIcon, UserIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/Page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import ConfirmDeleteDialog from 'web/pages/users/ConfirmDeleteDialog';
import UsersFilterDialog from 'web/pages/users/FilterDialog';
import UsersTable from 'web/pages/users/Table';
import UserComponent from 'web/pages/users/UserComponent';
import {
  loadEntities,
  loadAllEntities,
  selector as entitiesSelector,
} from 'web/store/entities/users';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import SelectionType from 'web/utils/SelectionType';
import withGmp from 'web/utils/withGmp';
import withTranslation from 'web/utils/withTranslation';
const ToolBarIcons = ({onUserCreateClick}) => {
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

ToolBarIcons.propTypes = {
  onUserCreateClick: PropTypes.func.isRequired,
};

class UsersPage extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {confirmDeleteDialogVisible: false};

    this.handleDeleteUser = this.handleDeleteUser.bind(this);

    this.handleCloseConfirmDeleteDialog =
      this.handleCloseConfirmDeleteDialog.bind(this);
    this.openConfirmDeleteDialog = this.openConfirmDeleteDialog.bind(this);
  }

  handleDeleteUser({deleteUsers, inheritorId}) {
    const {gmp, onChanged} = this.props;

    if (inheritorId === '--') {
      inheritorId = undefined;
    }

    this.handleInteraction();

    if (deleteUsers.length === 1) {
      const {id} = deleteUsers[0];
      return gmp.user.delete({id, inheritorId}).then(onChanged);
    }

    return gmp.users
      .delete(deleteUsers, {inheritor_id: inheritorId})
      .then(onChanged);
  }

  openConfirmDeleteDialog(user) {
    const {loadAll, gmp} = this.props;

    const {_} = this.props;
    loadAll();

    this.handleInteraction();

    if (isDefined(user)) {
      this.setState({
        confirmDeleteDialogVisible: true,
        id: user.id,
        deleteUsers: [user],
        title: _('Confirm deletion of user {{name}}', user),
      });
    } else {
      const {selectionType} = this.props;
      let promise;

      if (selectionType === SelectionType.SELECTION_USER) {
        const {entitiesSelected} = this.props;
        promise = Promise.resolve([...entitiesSelected]);
      } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
        const {entities} = this.props;
        promise = Promise.resolve(entities);
      } else {
        const {filter} = this.props;
        // TODO these users should be loaded from the store too
        promise = gmp.users.getAll({filter}).then(resp => resp.data);
      }

      promise.then(deleteUsers => {
        this.setState({
          confirmDeleteDialogVisible: true,
          deleteUsers,
          title: _('Confirm deletion of users'),
        });
      });
    }
  }

  closeConfirmDeleteDialog() {
    this.setState({confirmDeleteDialogVisible: false});
  }

  handleCloseConfirmDeleteDialog() {
    this.closeConfirmDeleteDialog();
    this.handleInteraction();
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  render() {
    const {_} = this.props;

    const {
      allUsers = [],
      onChanged,
      onDownloaded,
      onError,
      onInteraction,
      ...props
    } = this.props;

    const {confirmDeleteDialogVisible, deleteUsers = [], title} = this.state;

    const deleteUserIds = deleteUsers.map(luser => luser.id);
    const inheritorUsers = allUsers.filter(
      user => !deleteUserIds.includes(user.id),
    );

    return (
      <React.Fragment>
        <UserComponent
          onCloneError={onError}
          onCloned={onChanged}
          onCreated={onChanged}
          onDeleteError={onError}
          onDeleted={onChanged}
          onDownloadError={onError}
          onDownloaded={onDownloaded}
          onInteraction={onInteraction}
          onSaved={onChanged}
        >
          {({clone, create, download, edit, save}) => (
            <React.Fragment>
              <PageTitle title={_('Users')} />
              <EntitiesPage
                {...props}
                filterEditDialog={UsersFilterDialog}
                filtersFilter={USERS_FILTER_FILTER}
                isGenericBulkTrashcanDeleteDialog={false}
                sectionIcon={<UserIcon size="large" />}
                table={UsersTable}
                title={_('Users')}
                toolBarIcons={ToolBarIcons}
                onChanged={onChanged}
                onDeleteBulk={this.openConfirmDeleteDialog}
                onDownloaded={onDownloaded}
                onError={onError}
                onInteraction={onInteraction}
                onUserCloneClick={clone}
                onUserCreateClick={create}
                onUserDeleteClick={this.openConfirmDeleteDialog}
                onUserDownloadClick={download}
                onUserEditClick={edit}
                onUserSaveClick={save}
              />
            </React.Fragment>
          )}
        </UserComponent>
        {confirmDeleteDialogVisible && (
          <ConfirmDeleteDialog
            deleteUsers={deleteUsers}
            inheritorUsers={inheritorUsers}
            title={title}
            onClose={this.handleCloseConfirmDeleteDialog}
            onSave={d =>
              this.handleDeleteUser(d).then(() =>
                this.closeConfirmDeleteDialog(),
              )
            }
          />
        )}
      </React.Fragment>
    );
  }
}

UsersPage.propTypes = {
  allUsers: PropTypes.array,
  entities: PropTypes.array,
  entitiesSelected: PropTypes.set,
  filter: PropTypes.filter,
  gmp: PropTypes.gmp.isRequired,
  loadAll: PropTypes.func.isRequired,
  selectionType: PropTypes.string.isRequired,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
  _: PropTypes.func.isRequired,
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
  withTranslation,
  withGmp,
  withEntitiesContainer('user', {
    entitiesSelector,
    loadEntities,
  }),
  connect(mapStateToProps, mapDispatchToProps),
)(UsersPage);
