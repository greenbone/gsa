/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {EntityType, getEntityType, typeName} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import {TrashcanIcon} from 'web/components/icon';
import {ExtendedDynamicIconProps} from 'web/components/icon/createIconComponents';
import useCapabilities from 'web/hooks/useCapabilities';

interface EntityTrash extends EntityType {
  userCapabilities: {
    mayDelete: (name?: string) => boolean;
  };
  isWritable: () => boolean;
  isInUse: () => boolean;
}

interface EntityTrashIconProps<TEntity extends EntityTrash>
  extends Omit<
    ExtendedDynamicIconProps<TEntity>,
    'onClick' | 'value' | 'active'
  > {
  displayName?: string;
  entity: TEntity;
  name?: string;
  title?: string;
  onClick?: (value: TEntity) => void | Promise<void>;
}

const EntityTrashIcon = <TEntity extends EntityTrash>({
  displayName,
  entity,
  name,
  title,
  onClick,
  ...props
}: EntityTrashIconProps<TEntity>) => {
  const capabilities = useCapabilities();
  if (!isDefined(name)) {
    name = getEntityType(entity);
  }

  if (!isDefined(displayName)) {
    displayName = typeName(name);
  }

  const mayDelete =
    capabilities?.mayDelete(name) && entity.userCapabilities.mayDelete(name);

  const active = mayDelete && entity.isWritable() && !entity.isInUse();
  if (!isDefined(title)) {
    if (active) {
      title = _('Move {{entity}} to trashcan', {entity: displayName});
    } else if (entity.isInUse()) {
      title = _('{{entity}} is still in use', {entity: displayName});
    } else if (!entity.isWritable()) {
      title = _('{{entity}} is not writable', {entity: displayName});
    } else if (!mayDelete) {
      title = _('Permission to move {{entity}} to trashcan denied', {
        entity: displayName,
      });
    } else {
      title = _('Cannot move {{entity}} to trashcan', {entity: displayName});
    }
  }
  return (
    <TrashcanIcon
      {...props}
      active={active}
      title={title}
      value={entity}
      /* @ts-expect-error */
      onClick={active ? onClick : undefined}
    />
  );
};

export default EntityTrashIcon;
