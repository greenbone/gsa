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
import {hyperionEntityTypes} from 'gmp/utils/entitytype';

import {isDefined, hasValue} from 'gmp/utils/identity';

import ViewOtherIcon from 'web/components/icon/viewothericon';

import PropTypes from 'web/utils/proptypes';

const ObserverIcon = ({entity, userName, displayName = _('Entity')}) => {
  let owner;
  if (hyperionEntityTypes.includes(entity.entityType)) {
    owner = hasValue(entity.owner) ? entity.owner : undefined;
  } else {
    owner = isDefined(entity.owner) ? entity.owner.name : undefined;
  }

  if (owner === userName) {
    return null;
  }

  let title;
  if (isDefined(owner)) {
    title = _('{{type}} owned by {{owner}}', {type: displayName, owner});
  } else {
    title = _('Global {{type}}', {type: displayName});
  }
  return <ViewOtherIcon alt={title} title={title} />;
};

ObserverIcon.propTypes = {
  displayName: PropTypes.string,
  entity: PropTypes.model.isRequired,
  userName: PropTypes.string.isRequired,
};

export default ObserverIcon;

// vim: set ts=2 sw=2 tw=80:
