/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {EntityType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import useTranslation from 'src/web/hooks/useTranslation';
import {ViewOtherIcon} from 'web/components/icon';
import PropTypes from 'web/utils/PropTypes';

interface ObserverEntity extends EntityType {
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
  displayName = _('Entity'),
  ['data-testid']: dataTestId = 'observer-icon',
}: ObserverIconProps<TEntity>) => {
  const [_] = useTranslation();
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

ObserverIcon.propTypes = {
  displayName: PropTypes.string,
  entity: PropTypes.model.isRequired,
  userName: PropTypes.string.isRequired,
  'data-testid': PropTypes.string,
};

export default ObserverIcon;
