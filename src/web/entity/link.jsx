/* Copyright (C) 2017-2022 Greenbone AG
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

import {isDefined} from 'gmp/utils/identity';
import {getEntityType, normalizeType} from 'gmp/utils/entitytype';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import DetailsLink from 'web/components/link/detailslink';
import Link from 'web/components/link/link';

const EntityLink = ({capabilities, entity, textOnly, ...props}) => {
  const {id, name, userCapabilities, deleted} = entity;
  const type = normalizeType(getEntityType(entity));

  if (entity.isInTrash()) {
    return (
      <span>
        {name} (<span>in </span>
        <Link textOnly={textOnly} to="trashcan" anchor={type}>
          {_('Trashcan')}
        </Link>
        )
      </span>
    );
  }

  if (isDefined(deleted) && deleted !== 0) {
    // FIXME is this still used?
    return <b>{_('Orphan')}</b>;
  }

  if (
    (userCapabilities.areDefined() && !userCapabilities.mayAccess(type)) ||
    !capabilities.mayAccess(type)
  ) {
    return <span>{name}</span>;
  }

  return (
    <DetailsLink {...props} id={id} type={type} textOnly={textOnly}>
      {name}
    </DetailsLink>
  );
};

EntityLink.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  entity: PropTypes.model.isRequired,
  textOnly: PropTypes.bool,
};

export default withCapabilities(EntityLink);

// vim: set ts=2 sw=2 tw=80:
