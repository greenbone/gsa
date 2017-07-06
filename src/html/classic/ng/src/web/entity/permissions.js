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
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../utils/proptypes.js';

import HelpIcon from '../components/icon/helpicon.js';
import NewIcon from '../components/icon/newicon.js';
import Icon from '../components/icon/icon.js';

import IconDivider from '../components/layout/icondivider.js';

import Section from '../components/section/section.js';

import PermissionsTable from '../pages/permissions/table.js';
import withPermissionsComponent from '../pages/permissions/withPermissionsComponent.js'; // eslint-disable-line max-len

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
      <HelpIcon
        page="resource_permissions"
        title={_('Help: Resource Permissions')}
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
    <Icon {...props} img="permission.svg" size="small" />
  );
};

const EntityPermissions = ({
  entity,
  foldable = true,
  permissions,
  onPermissionCreateClick,
  ...props,
}) => {
  const extra = (
    <SectionElements
      entity={entity}
      onPermissionCreateClick={onPermissionCreateClick}
    />
  );
  const has_permissions = is_defined(permissions);
  const count = has_permissions ? permissions.length : 0;
  return (
    <Section
      foldable={foldable}
      extra={extra}
      img={<PermissionIcon/>}
      title={_('Permissions ({{count}})', {count})}
    >
      {permissions.length > 0 &&
        <PermissionsTable
          {...props}
          entities={permissions}
          pagination={false}
          footer={false}
          footnote={false}
        />
      }
    </Section>
  );
};

EntityPermissions.propTypes = {
  entity: PropTypes.model.isRequired,
  permissions: PropTypes.arrayLike,
  foldable: PropTypes.bool,
  onPermissionCreateClick: PropTypes.func.isRequired,
};

export default withPermissionsComponent({
  onCloned: 'onChanged',
  onDeleted: 'onChanged',
  onSaved: 'onChanged',
})(EntityPermissions);

// vim: set ts=2 sw=2 tw=80:
