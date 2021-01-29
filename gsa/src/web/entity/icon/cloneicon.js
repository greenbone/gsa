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

import CloneIcon from 'web/components/icon/cloneicon';

import PropTypes from 'web/utils/proptypes';
import useCapabilities from 'web/utils/useCapabilities';

const EntityCloneIcon = ({
  displayName,
  entity,
  mayClone = true,
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

  const active =
    mayClone &&
    capabilities.mayClone(name) &&
    entity.userCapabilities.mayAccess(name);
  if (!isDefined(title)) {
    if (active) {
      title = _('Clone {{entity}}', {entity: displayName});
      // eslint-disable-next-line no-negated-condition
    } else if (!mayClone) {
      title = _('{{entity}} may not be cloned', {entity: displayName});
    } else {
      title = _('Permission to clone {{entity}} denied', {entity: displayName});
    }
  }
  return (
    <CloneIcon
      {...props}
      title={title}
      value={entity}
      active={active}
      onClick={active ? onClick : undefined}
    />
  );
};

EntityCloneIcon.propTypes = {
  displayName: PropTypes.string,
  entity: PropTypes.model.isRequired,
  mayClone: PropTypes.bool,
  name: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
};

export default EntityCloneIcon;

// vim: set ts=2 sw=2 tw=80:
