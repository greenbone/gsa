/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {getEntityType, typeName, EntityType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import {CloneIcon} from 'web/components/icon';
import {ExtendedDynamicIconProps} from 'web/components/icon/createIconComponents';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

interface EntityClone extends EntityType {
  userCapabilities: {
    mayAccess: (name: string) => boolean;
  };
}

interface EntityCloneIconProps<TEntity extends EntityClone>
  extends Omit<
    ExtendedDynamicIconProps<TEntity>,
    'onClick' | 'value' | 'active'
  > {
  displayName?: string;
  entity: TEntity;
  mayClone?: boolean;
  name?: string;
  title?: string;
  onClick?: (value: TEntity) => void | Promise<void>;
}

const EntityCloneIcon = <TEntity extends EntityClone>({
  displayName,
  entity,
  mayClone = true,
  name,
  title,
  onClick,
  ...props
}: EntityCloneIconProps<TEntity>) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  if (!isDefined(name)) {
    name = getEntityType(entity);
  }

  if (!isDefined(displayName)) {
    displayName = typeName(name);
  }

  const active =
    mayClone &&
    capabilities?.mayClone(name) &&
    entity.userCapabilities.mayAccess(name);
  if (!isDefined(title)) {
    if (!isDefined(displayName)) {
      // should not happen
      displayName = '';
    }
    if (active) {
      title = _('Clone {{entity}}', {entity: displayName});
    } else if (!mayClone) {
      title = _('{{entity}} may not be cloned', {entity: displayName});
    } else {
      title = _('Permission to clone {{entity}} denied', {entity: displayName});
    }
  }
  return (
    <CloneIcon<TEntity>
      {...props}
      active={active}
      title={title}
      value={entity}
      onClick={active ? onClick : undefined}
    />
  );
};

export default EntityCloneIcon;
