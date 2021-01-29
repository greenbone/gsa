/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';
import DateTime from 'web/components/date/datetime';

import {isDefined} from 'gmp/utils/identity';

import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

const OwnerInfo = ({owner}) =>
  isDefined(owner) ? (
    isDefined(owner.name) ? (
      <span>{owner.name}</span>
    ) : (
      <span>{owner}</span>
    )
  ) : (
    <i>{_('(Global Object)')}</i>
  );
OwnerInfo.propTypes = {
  owner: PropTypes.object,
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

const EntityInfo = ({entity}) => {
  const {id, owner, creationTime, modificationTime} = entity;
  return (
    <InfoLayout>
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

EntityInfo.propTypes = {
  className: PropTypes.string,
  entity: PropTypes.model.isRequired,
};

export default EntityInfo;

// vim: set ts=2 sw=2 tw=80:
