/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {EntityType, getEntityType, typeName} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import {NewIcon} from 'web/components/icon';
import {ExtendedDynamicIconProps} from 'web/components/icon/createIconComponents';
import useCapabilities from 'web/hooks/useCapabilities';

interface EntityCreateIconProps<TEntity extends EntityType>
  extends Omit<
    ExtendedDynamicIconProps<TEntity>,
    'onClick' | 'value' | 'active' | 'display'
  > {
  display?: boolean;
  displayName?: string;
  entity: TEntity;
  mayCreate?: boolean;
  name?: string;
  title?: string;
  onClick?: (value: TEntity) => void | Promise<void>;
}

const EntityCreateIcon = <TEntity extends EntityType>({
  display = false,
  displayName,
  entity,
  mayCreate = true,
  name,
  title,
  onClick,
  ...props
}: EntityCreateIconProps<TEntity>) => {
  const capabilities = useCapabilities();
  if (!isDefined(name)) {
    name = getEntityType(entity);
  }

  const active = mayCreate && capabilities?.mayCreate(name);
  if (!display && !active) {
    return null;
  }

  if (!isDefined(displayName)) {
    displayName = typeName(name);
  }

  if (!isDefined(title)) {
    if (active) {
      title = _('Create new {{entity}}', {entity: displayName});
    } else if (!mayCreate) {
      title = _('{{entity}} may not be created', {entity: displayName});
    } else {
      title = _('Permission to create {{entity}} denied', {
        entity: displayName,
      });
    }
  }
  return (
    <NewIcon
      {...props}
      active={active}
      title={title}
      /* @ts-expect-error */
      onClick={active ? onClick : undefined}
    />
  );
};

export default EntityCreateIcon;
