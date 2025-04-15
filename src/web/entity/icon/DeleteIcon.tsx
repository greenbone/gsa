/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {EntityType, getEntityType, typeName} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import useTranslation from 'src/web/hooks/useTranslation';
import {ExtendedDynamicIconProps} from 'web/components/icon/createIconComponents';
import DeleteIcon from 'web/components/icon/DeleteIcon';
import useCapabilities from 'web/hooks/useCapabilities';

interface EntityDelete extends EntityType {
  userCapabilities: {
    mayDelete: (name?: string) => boolean;
  };
  isWritable: () => boolean;
  isInUse: () => boolean;
}

interface EntityDeleteIconProps<TEntity extends EntityDelete>
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

const EntityDeleteIcon = <TEntity extends EntityDelete>({
  displayName,
  entity,
  name,
  title,
  onClick,
  ...props
}: EntityDeleteIconProps<TEntity>) => {
  const [_] = useTranslation();
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
      title = _('Delete {{entity}}', {entity: displayName});
    } else if (!entity.isWritable()) {
      title = _('{{entity}} is not writable', {entity: displayName});
    } else if (entity.isInUse()) {
      title = _('{{entity}} is still in use', {entity: displayName});
    } else if (!mayDelete) {
      title = _('Permission to delete {{entity}} denied', {
        entity: displayName,
      });
    } else {
      title = _('Cannot delete {{entity}}', {entity: displayName});
    }
  }
  return (
    <DeleteIcon
      {...props}
      active={active}
      title={title}
      value={entity}
      /* @ts-expect-error */
      onClick={active ? onClick : undefined}
    />
  );
};

export default EntityDeleteIcon;
