/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {EntityType, getEntityType, typeName} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import {EditIcon} from 'web/components/icon';
import {ExtendedDynamicIconProps} from 'web/components/icon/createIconComponents';
import useCapabilities from 'web/hooks/useCapabilities';

interface EntityEdit extends EntityType {
  userCapabilities: {
    mayEdit: (name?: string) => boolean;
  };
  isWritable: () => boolean;
}

interface EntityEditIconProps<TEntity extends EntityEdit>
  extends Omit<
    ExtendedDynamicIconProps<TEntity>,
    'onClick' | 'value' | 'active'
  > {
  disabled?: boolean;
  displayName?: string;
  entity: TEntity;
  name?: string;
  title?: string;
  onClick?: (value: TEntity) => void | Promise<void>;
}

const EntityEditIcon = <TEntity extends EntityEdit>({
  disabled,
  displayName,
  entity,
  name,
  title,
  onClick,
  ...props
}: EntityEditIconProps<TEntity>) => {
  const capabilities = useCapabilities();
  if (!isDefined(name)) {
    name = getEntityType(entity);
  }

  if (!isDefined(displayName)) {
    displayName = typeName(name);
  }

  const mayEdit =
    capabilities?.mayEdit(name) && entity.userCapabilities.mayEdit(name);

  const active = mayEdit && entity.isWritable() && !disabled;

  if (!isDefined(title)) {
    if (active) {
      title = _('Edit {{entity}}', {entity: displayName});
    } else if (!entity.isWritable()) {
      title = _('{{entity}} is not writable', {entity: displayName});
    } else if (!mayEdit) {
      title = _('Permission to edit {{entity}} denied', {entity: displayName});
    } else {
      title = _('Cannot modify {{entity}}', {entity: displayName});
    }
  }
  return (
    <EditIcon
      {...props}
      active={active}
      title={title}
      value={entity}
      /* @ts-expect-error */
      onClick={active ? onClick : undefined}
    />
  );
};

export default EntityEditIcon;
