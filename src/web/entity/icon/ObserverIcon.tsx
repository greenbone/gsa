/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type WithEntityType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import {ViewOtherIcon} from 'web/components/icon';
import useTranslation from 'web/hooks/useTranslation';

interface ObserverEntity extends WithEntityType {
  owner?: {
    name: string;
  };
}

interface ObserverIconProps<TEntity extends ObserverEntity> {
  displayName?: string;
  userName: string;
  entity: TEntity;
  'data-testid'?: string;
}

const ObserverIcon = <TEntity extends ObserverEntity>({
  entity,
  userName,
  displayName,
  ['data-testid']: dataTestId = 'observer-icon',
}: ObserverIconProps<TEntity>) => {
  const [_] = useTranslation();
  displayName = displayName ?? _('Entity');

  const owner = isDefined(entity.owner) ? entity.owner.name : undefined;

  if (owner === userName) {
    return null;
  }

  let title: string;
  if (isDefined(owner)) {
    title = _('{{type}} owned by {{owner}}', {type: displayName, owner});
  } else {
    title = _('Global {{type}}', {type: displayName});
  }
  return <ViewOtherIcon data-testid={dataTestId} title={title} />;
};

export default ObserverIcon;
