/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {getEntityType, typeName, EntityType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import {CloneIcon} from 'web/components/icon/icons';
import useCapabilities from 'web/hooks/useCapabilities';
interface EntityClone extends EntityType {
  userCapabilities: {
    mayAccess: (name?: string) => boolean;
  };
}

interface EntityCloneIconProps {
  displayName?: string;
  entity: EntityClone;
  mayClone?: boolean;
  name?: string;
  title?: string;
  onClick?: () => void;
}

const EntityCloneIcon = ({
  displayName,
  entity,
  mayClone = true,
  name,
  title,
  onClick,
  ...props
}: EntityCloneIconProps) => {
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
    <CloneIcon
      {...props}
      active={active}
      title={title}
      value={entity}
      onClick={active ? onClick : undefined}
    />
  );
};

export default EntityCloneIcon;
