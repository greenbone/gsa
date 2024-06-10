/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';
import DateTime from 'web/components/date/datetime';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import Layout from 'web/components/layout/layout';

import Theme from 'web/utils/theme';

const OwnerInfo = ({owner}) =>
  isDefined(owner) ? <span>{owner.name}</span> : <i>{_('(Global Object)')}</i>;
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
