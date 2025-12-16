/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import {type Date} from 'gmp/models/date';
import {isDefined} from 'gmp/utils/identity';
import DateTime from 'web/components/date/DateTime';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/Theme';

interface Owner {
  name?: string;
}

interface OwnerInfoProps {
  owner?: Owner;
}

interface Entity {
  id?: string;
  owner?: Owner;
  creationTime?: Date;
  modificationTime?: Date;
}

interface EntityInfoProps {
  entity: Entity;
}

const OwnerInfo = ({owner}: OwnerInfoProps) => {
  const [_] = useTranslation();
  return isDefined(owner) ? (
    <span>{owner.name}</span>
  ) : (
    <i>{_('(Global Object)')}</i>
  );
};

export const EntityInfoTable = styled.table`
  border-spacing: 0px;
  color: ${Theme.mediumGray};
  font-size: 10px;
  tr {
    display: inline-table;
    margin-right: 20px;
  }
  td:nth-child(2) {
    user-select: all;
  }
`;

const EntityInfo = ({entity}: EntityInfoProps) => {
  const [_] = useTranslation();
  const {id, owner, creationTime, modificationTime} = entity;
  return (
    <EntityInfoTable data-testid="entity-info">
      <tbody>
        <tr>
          <td>{_('ID:')}</td>
          <td>{id}</td>
        </tr>
        <tr>
          <td>{_('Created:')}</td>
          <td>
            <DateTime date={creationTime} />
          </td>
        </tr>
        <tr>
          <td>{_('Modified:')}</td>
          <td>
            <DateTime date={modificationTime} />
          </td>
        </tr>
        <tr>
          <td>{_('Owner:')}</td>
          <td>
            <OwnerInfo owner={owner} />
          </td>
        </tr>
      </tbody>
    </EntityInfoTable>
  );
};

export default EntityInfo;
