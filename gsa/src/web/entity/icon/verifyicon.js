/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';
import {apiType, getEntityType, typeName} from 'gmp/utils/entitytype';

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
