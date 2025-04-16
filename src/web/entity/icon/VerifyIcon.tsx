/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  apiType,
  EntityType,
  getEntityType,
  typeName,
} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import {VerifyIcon} from 'web/components/icon';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

interface EntityVerify extends EntityType {
  userCapabilities: {
    mayOp: (name?: string) => boolean;
  };
}

interface EntityVerifyIconProps<TEntity extends EntityVerify>
  extends Omit<
    React.ComponentProps<typeof VerifyIcon>,
    'onClick' | 'value' | 'active'
  > {
  displayName?: string;
  entity: TEntity;
  mayVerify?: boolean;
  name?: string;
  title?: string;
  onClick?: (value: TEntity) => void | Promise<void>;
}

const EntityVerifyIcon = <TEntity extends EntityVerify>({
  displayName,
  entity,
  mayVerify = true,
  name,
  title,
  onClick,
  ...props
}: EntityVerifyIconProps<TEntity>) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  if (!isDefined(name)) {
    name = apiType(getEntityType(entity));
  }

  if (!isDefined(displayName)) {
    displayName = typeName(name);
  }
  const active =
    mayVerify &&
    capabilities?.mayOp('verify_' + name) &&
    entity.userCapabilities.mayOp('verify_' + name);
  if (!isDefined(title)) {
    if (active) {
      title = _('Verify {{entity}}', {entity: displayName});
    } else if (!mayVerify) {
      title = _('{{entity}} may not be verified', {entity: displayName});
    } else {
      title = _('Permission to verify {{entity}} denied', {
        entity: displayName,
      });
    }
  }
  return (
    <VerifyIcon
      {...props}
      active={active}
      title={title}
      value={entity}
      /* @ts-expect-error */
      onClick={active ? onClick : undefined}
    />
  );
};

export default EntityVerifyIcon;
