/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {Date} from 'gmp/models/date';
import {isDefined} from 'gmp/utils/identity';
import DateTime from 'web/components/date/DateTime';
import Layout from 'web/components/layout/Layout';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/Theme';

interface Owner {
  name: string;
}

interface OwnerInfoProps {
  owner: Owner;
}

const OwnerInfo: React.FC<OwnerInfoProps> = ({owner}: OwnerInfoProps) => {
  const [_] = useTranslation();
  return isDefined(owner) ? (
    <span>{owner.name}</span>
  ) : (
    <i>{_('(Global Object)')}</i>
  );
};

export const InfoLayout = styled(Layout)`
  border-spacing: 0px;
  color: ${Theme.mediumGray};
  font-size: 10px;

  & :nth-child(even) {
    margin-left: 3px;
  }
  & :nth-child(odd) {
    margin-left: 30px;
  }
`;

interface Entity {
  id: string;
  owner: Owner;
  creationTime: Date;
  modificationTime: Date;
}

interface EntityInfoProps {
  entity: Entity;
}

const EntityInfo: React.FC<EntityInfoProps> = ({entity}: EntityInfoProps) => {
  const [_] = useTranslation();
  const {id, owner, creationTime, modificationTime} = entity;
  return (
    <InfoLayout data-testid="entity-info">
      <div>{_('ID:')}</div>
      <div>{id}</div>
      <div>{_('Created:')}</div>
      <div>
        <DateTime date={creationTime} />
      </div>
      <div>{_('Modified:')}</div>
      <div>
        <DateTime date={modificationTime} />
      </div>
      <div>{_('Owner:')}</div>
      <OwnerInfo owner={owner} />
    </InfoLayout>
  );
};

export default EntityInfo;
