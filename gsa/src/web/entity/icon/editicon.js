/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import _ from 'gmp/locale';
import {getEntityType, typeName} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';

import useCapabilities from 'web/utils/useCapabilities';
import EditIcon from 'web/components/icon/editicon';

import PropTypes from 'web/utils/proptypes';

const EntityEditIcon = ({
  disabled,
  displayName,
  entity,
  name,
  title,
  onClick,
  ...props
}) => {
  const capabilities = useCapabilities();

  if (!isDefined(name)) {
    name = getEntityType(entity);
  }

  if (!isDefined(displayName)) {
    displayName = typeName(name);
  }

  const mayEdit =
    capabilities.mayEdit(name) && entity.userCapabilities.mayEdit(name);

  const active = mayEdit && entity.isWritable() && !disabled;

  if (!isDefined(title)) {
    if (active) {
      title = _('Edit {{entity}}', {entity: displayName});
    } else if (!entity.isWritable()) {
      title = _('{{entity}} is not writable', {entity: displayName});
      // eslint-disable-next-line no-negated-condition
    } else if (!mayEdit) {
      title = _('Permission to edit {{entity}} denied', {entity: displayName});
    } else {
      title = _('Cannot modify {{entity}}', {entity: displayName});
    }
  }
  return (
    <EditIcon
      {...props}
      title={title}
      value={entity}
      active={active}
      onClick={active ? onClick : undefined}
    />
  );
};

EntityEditIcon.propTypes = {
  disabled: PropTypes.bool,
  displayName: PropTypes.string,
  entity: PropTypes.model.isRequired,
  name: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
};

export default EntityEditIcon;

// vim: set ts=2 sw=2 tw=80:
