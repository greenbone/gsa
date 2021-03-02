/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import {apiType, getEntityType, typeName} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import VerifyIcon from 'web/components/icon/verifyicon';
import withCapabilities from 'web/utils/withCapabilities';

const EntityVerifyIcon = ({
  capabilities,
  displayName,
  entity,
  mayVerify = true,
  name,
  title,
  onClick,
  ...props
}) => {
  if (!isDefined(name)) {
    name = apiType(getEntityType(entity));
  }

  if (!isDefined(displayName)) {
    displayName = typeName(name);
  }
  const active =
    mayVerify &&
    capabilities.mayOp('verify_' + name) &&
    entity.userCapabilities.mayOp('verify_' + name);
  if (!isDefined(title)) {
    if (active) {
      title = _('Verify {{entity}}', {entity: displayName});
      // eslint-disable-next-line no-negated-condition
    } else if (!mayVerify) {
      title = _('{{entity}} may not be verified', {entity: displayName});
    } else {
      title = _('Permission to verify {{entity}} denied', {
        entity: displayName,
      });
    }
  }
  return (
    <VerifyIcon
      {...props}
      title={title}
      value={entity}
      active={active}
      onClick={active ? onClick : undefined}
    />
  );
};

EntityVerifyIcon.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  displayName: PropTypes.string,
  entity: PropTypes.model.isRequired,
  mayVerify: PropTypes.bool,
  name: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
};

export default withCapabilities(EntityVerifyIcon);

// vim: set ts=2 sw=2 tw=80:
