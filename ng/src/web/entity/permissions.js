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

import glamorous from 'glamorous';

import _ from 'gmp/locale.js';
import {is_defined, select_save_id} from 'gmp/utils.js';

import PropTypes from '../utils/proptypes.js';

import ManualIcon from '../components/icon/manualicon.js';
import NewIcon from '../components/icon/newicon.js';
import Icon from '../components/icon/icon.js';

import IconDivider from '../components/layout/icondivider.js';
import Wrapper from '../components/layout/wrapper.js';

import Section from '../components/section/section.js';

import MultiplePermissionDialog, {
  CURRENT_RESOURCE_ONLY,
  INCLUDE_RELATED_RESOURCES,
} from '../pages/permissions/multipledialog.js';
import PermissionsTable from '../pages/permissions/table.js';
import PermissionComponent from '../pages/permissions/component.js';

const SectionElementDivider = glamorous(IconDivider)({
  marginBottom: '3px',
});

const SectionElements = ({
  entity,
  onPermissionCreateClick,
}) => {
  return (
    <SectionElementDivider>
      <NewIcon
        title={_('New Permission')}
        onClick={onPermissionCreateClick}
      />
      <ManualIcon
        page="gui_administration"
        anchor="permissions"
        title={_('Help: Permissions')}
      />
    </SectionElementDivider>
  );
};

SectionElements.propTypes = {
  entity: PropTypes.model.isRequired,
  onPermissionCreateClick: PropTypes.func.isRequired,
};

const PermissionIcon = props => {
  return (
    <Icon
      {...props}
      img="permission.svg"
      size="small"
    />
  );
};

class EntityPermissions extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {};

    this.handleMultipleSave = this.handleMultipleSave.bind(this);
    this.openMultiplePermissionDialog = this.openMultiplePermissionDialog
      .bind(this);
    this.openPermissionDialog = this.openPermissionDialog.bind(this);
  }

  openPermissionDialog(permission) {
    const {onPermissionEditClick} = this.props;

    if (is_defined(onPermissionEditClick)) {
      onPermissionEditClick(permission, true);
    }
  }

  openMultiplePermissionDialog(permission) {
    const {relatedResourcesLoaders = [], entity} = this.props;
    const {gmp} = this.context;

    this.dialog.show({
      entity_type: entity.entity_type,
      entity_name: entity.name,
      id: entity.id,
      include_related: relatedResourcesLoaders.length === 0 ?
        CURRENT_RESOURCE_ONLY : INCLUDE_RELATED_RESOURCES,
    });

    Promise
      .all(relatedResourcesLoaders.map(func => func({entity, gmp})))
      .then(loaded => {
        const related = loaded.reduce((sum, cur) => sum.concat(cur), []);

        this.dialog.setValues({
          related,
        });
      });

    gmp.groups.getAll().then(response => {
      const {data: groups} = response;
      this.dialog.setValues({
        groups,
        group_id: select_save_id(groups),
      });
    });
    gmp.roles.getAll().then(response => {
      const {data: roles} = response;
      this.dialog.setValues({
        roles,
        role_id: select_save_id(roles),
      });
    });
    gmp.users.getAll().then(response => {
      const {data: users} = response;
      this.dialog.setValues({
        users,
        user_id: select_save_id(users),
      });
    });
  }

  handleMultipleSave(data) {
    const {onChanged} = this.props;
    const {gmp} = this.context;
    return gmp.permissions.create(data).then(onChanged);
  }

  render() {
    const {
      entity,
      foldable = true,
      permissions,
      ...props
    } = this.props;

    const extra = (
      <SectionElements
        entity={entity}
        onPermissionCreateClick={this.openMultiplePermissionDialog}
      />
    );
    const has_permissions = is_defined(permissions);
    const count = has_permissions ? permissions.length : 0;

    return (
      <Wrapper>
        <Section
          foldable={foldable}
          extra={extra}
          img={<PermissionIcon/>}
          title={_('Permissions ({{count}})', {count})}
        >
          {count > 0 &&
            <PermissionsTable
              {...props}
              entities={permissions}
              pagination={false}
              footer={false}
              footnote={false}
              onPermissionEditClick={this.openPermissionDialog}
            />
          }
          <MultiplePermissionDialog
            ref={ref => this.dialog = ref}
            onSave={this.handleMultipleSave}
          />
        </Section>
      </Wrapper>
    );
  }
}

EntityPermissions.propTypes = {
  entity: PropTypes.model.isRequired,
  foldable: PropTypes.bool,
  permissions: PropTypes.array,
  relatedResourcesLoaders: PropTypes.arrayOf(PropTypes.func),
  onChanged: PropTypes.func.isRequired,
  onPermissionCloneClick: PropTypes.func.isRequired,
  onPermissionDeleteClick: PropTypes.func.isRequired,
  onPermissionDownloadClick: PropTypes.func.isRequired,
  onPermissionEditClick: PropTypes.func.isRequired,
};

EntityPermissions.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

const Permissions = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => (
  <PermissionComponent
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onCloned={onChanged}
    onCloneError={onError}
    onCreated={onChanged}
    onDeleted={onChanged}
    onDeleteError={onError}
    onSaved={onChanged}
  >
    {({
      clone,
      create,
      delete: delete_func,
      download,
      edit,
    }) => (
      <EntityPermissions
        {...props}
        onChanged={onChanged}
        onPermissionCreateClick={create}
        onPermissionCloneClick={clone}
        onPermissionDeleteClick={delete_func}
        onPermissionDownloadClick={download}
        onPermissionEditClick={edit}
      />
    )}
  </PermissionComponent>
);

Permissions.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default Permissions;

// vim: set ts=2 sw=2 tw=80:
