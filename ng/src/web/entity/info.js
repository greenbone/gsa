/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import glamorous from 'glamorous';

import _, {long_date} from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../utils/proptypes.js';

import Layout from '../components/layout/layout.js';

import Theme from '../utils/theme.js';

const OwnerInfo = ({
  owner,
}) => is_defined(owner) ?
  owner.name :
  <i>{_('(Global Object)')}</i>
;

OwnerInfo.propTypes = {
  owner: PropTypes.object,
};

export const InfoLayout = glamorous(Layout)(
  'entity-info',
  {
    borderSpacing: '0px',
    color: Theme.extra.mediumGray,
    fontSize: '10px',

    '& :nth-child(even)': {
      paddingRight: '30px',
    },
    '& :nth-child(odd)': {
      paddingRight: '3px',
    },
  },
);

const EntityInfo = ({
  entity,
}) => {
  const {
    id,
    owner,
    creation_time,
    modification_time,
  } = entity;
  return (
    <InfoLayout>
      <div>{_('ID:')}</div>
      <div>{id}</div>
      <div>{_('Created:')}</div>
      <div>{long_date(creation_time)}</div>
      <div>{_('Modified:')}</div>
      <div>{long_date(modification_time)}</div>
      <div>{_('Owner:')}</div>
      <OwnerInfo owner={owner}/>
    </InfoLayout>
  );
};

EntityInfo.propTypes = {
  className: PropTypes.string,
  entity: PropTypes.model.isRequired,
};

export default EntityInfo;

// vim: set ts=2 sw=2 tw=80:
