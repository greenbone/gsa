/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
