/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Model from 'gmp/models/model';
import {
  type EntityType,
  getEntityType,
  normalizeType,
} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import DetailsLink from 'web/components/link/DetailsLink';
import Link, {type LinkProps} from 'web/components/link/Link';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

interface EntityLinkProps extends LinkProps {
  entity: Model;
  textOnly?: boolean;
}

const EntityLink = ({entity, textOnly, ...props}: EntityLinkProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const {id, name, userCapabilities} = entity;
  const type = normalizeType(getEntityType(entity)) as EntityType;

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

  // @ts-expect-error
  if (isDefined(entity.deleted) && entity.deleted !== 0) {
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
    <DetailsLink {...props} id={id as string} textOnly={textOnly} type={type}>
      {name}
    </DetailsLink>
  );
};

export default EntityLink;
