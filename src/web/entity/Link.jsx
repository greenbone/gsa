/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {getEntityType, normalizeType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import useTranslation from 'src/web/hooks/useTranslation';
import DetailsLink from 'web/components/link/DetailsLink';
import Link from 'web/components/link/Link';
import PropTypes from 'web/utils/PropTypes';
import withCapabilities from 'web/utils/withCapabilities';

const EntityLink = ({capabilities, entity, textOnly, ...props}) => {
  const [_] = useTranslation();
  const {id, name, userCapabilities, deleted} = entity;
  const type = normalizeType(getEntityType(entity));

  if (entity.isInTrash()) {
    return (
      <span>
        {name} (<span>in </span>
        <Link anchor={type} textOnly={textOnly} to="trashcan">
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
    <DetailsLink {...props} id={id} textOnly={textOnly} type={type}>
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
