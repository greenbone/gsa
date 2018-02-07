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
import 'core-js/fn/array/includes';

import React from 'react';

import _ from 'gmp/locale.js';
import {is_defined} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';
import compose from '../../utils/compose.js';
import withCapabilities from '../../utils/withCapabilities.js';
import withGmp from '../../utils/withGmp.js';

import SelectionType from '../../utils/selectiontype.js';

import EntitiesPage from '../../entities/page.js';
import withEntitiesContainer from '../../entities/withEntitiesContainer.js';

import ManualIcon from '../../components/icon/manualicon.js';
import NewIcon from '../../components/icon/newicon.js';

import IconDivider from '../../components/layout/icondivider.js';
import Wrapper from '../../components/layout/wrapper.js';

import {createFilterDialog} from '../../components/powerfilter/dialog.js';

import {USERS_FILTER_FILTER} from 'gmp/models/filter.js';
import Promise from 'gmp/promise.js';

import ConfirmDeleteDialog from './confirmdeletedialog.js';
import UserComponent from './component.js';
import UsersTable, {SORT_FIELDS} from './table.js';

const ToolBarIcons = withCapabilities(({
  capabilities,
  onUserCreateClick,
}) => {
  return (
    <IconDivider>
      <ManualIcon
        page="gui_administration"
        anchor="user-management"
        title={_('Help: Users')}
      />
      {capabilities.mayCreate('user') &&
        <NewIcon
          title={_('New User')}
          onClick={onUserCreateClick}
        />
      }
    </IconDivider>
  );
});

ToolBarIcons.propTypes = {
  onUserCreateClick: PropTypes.func.isRequired,
};

const UsersFilterDialog = createFilterDialog({
  sortFields: SORT_FIELDS,
});

class UsersPage extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleDeleteUser = this.handleDeleteUser.bind(this);

    this.openConfirmDeleteDialog = this.openConfirmDeleteDialog.bind(this);
  }

  handleDeleteUser({deleteUsers, id, inheritor_id}) {
    const {gmp, onChanged} = this.props;

    if (inheritor_id === '--') {
      inheritor_id = undefined;
    }

    if (is_defined(id)) {
      return gmp.user.delete({id, inheritor_id}).then(() => onChanged());
    }

    return gmp.users.delete(deleteUsers, {inheritor_id})
      .then(() => onChanged());
  }

  openConfirmDeleteDialog(user) {
    const {gmp} = this.props;

    gmp.users.getAll().then(response => {
      let {data: users} = response;

      if (is_defined(user)) {
        users = users.filter(luser => luser.id !== user.id);

        this.confirm_delete_dialog.show({
          id: user.id,
          username: user.name,
          users,
        }, {
          title: _('Confirm deletion of user {{name}}', user),
        });

      }
      else {
        const {selectionType} = this.props;
        let promise;

        if (selectionType === SelectionType.SELECTION_USER) {
          const {entitiesSelected} = this.props;
          promise = Promise.resolve([...entitiesSelected]);
        }
        else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
          const {entities} = this.props;
          promise = Promise.resolve(entities);
        }
        else {
          const {filter} = this.props;
          promise = gmp.users.get({filter: filter.all()})
            .then(resp => resp.data);
        }

        promise.then(deleteUsers => {
          const ids = deleteUsers.map(luser => luser.id);

          users = users.filter(luser => !ids.includes(luser.id));

          this.confirm_delete_dialog.show({
            users,
            deleteUsers,
          }, {
            title: _('Confirm deletion of users'),
          });
        });
      }
    });
  }

  render() {
    const {
      onChanged,
      onDownloaded,
      onError,
      ...props
    } = this.props;
    return (
      <Wrapper>
        <UserComponent
          onCreated={onChanged}
          onSaved={onChanged}
          onCloned={onChanged}
          onCloneError={onError}
          onDeleted={onChanged}
          onDeleteError={onError}
          onDownloaded={onDownloaded}
          onDownloadError={onError}
        >{({
          clone,
          create,
          download,
          edit,
          save,
        }) => (
          <EntitiesPage
            {...props}
            filterEditDialog={UsersFilterDialog}
            sectionIcon="user.svg"
            table={UsersTable}
            title={_('Users')}
            toolBarIcons={ToolBarIcons}
            onChanged={onChanged}
            onDeleteBulk={this.openConfirmDeleteDialog}
            onDownloaded={onDownloaded}
            onError={onError}
            onUserCloneClick={clone}
            onUserCreateClick={create}
            onUserDeleteClick={this.openConfirmDeleteDialog}
            onUserDownloadClick={download}
            onUserEditClick={edit}
            onUserSaveClick={save}
          />
        )}
        </UserComponent>
        <ConfirmDeleteDialog
          ref={ref => this.confirm_delete_dialog = ref}
          onSave={this.handleDeleteUser}
        />
      </Wrapper>
    );
  }
}

UsersPage.propTypes = {
  entities: PropTypes.collection,
  entitiesSelected: PropTypes.set,
  filter: PropTypes.filter,
  gmp: PropTypes.gmp.isRequired,
  selectionType: PropTypes.string.isRequired,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default compose(
  withGmp,
  withEntitiesContainer('user', {
    filtersFilter: USERS_FILTER_FILTER,
  }),
)(UsersPage);

// vim: set ts=2 sw=2 tw=80:
