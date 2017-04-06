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

import _ from '../../locale.js';

import Comment from '../comment.js';
import Layout from '../layout.js';
import LegacyLink from '../legacylink.js';
import PropTypes from '../proptypes.js';

import TableData from '../table/data.js';

import ObserverIcon from './icons/entityobservericon.js';

const EntityNameTableData = ({
    entity,
    links = true,
    type,
    displayName,
    userName,
    children,
  }) => {

  let linkprops = {
    cmd: 'get_' + type,
  };
  linkprops[type + '_id'] = entity.id;

  const linktext = (
    <Layout flex="column">
      {entity.isOrphan() &&
        <b>{_('Orphan')}</b>
      }
      {entity.name}
    </Layout>
  );
  return (
    <TableData flex="column">
      <Layout flex align="space-between">
        {links ?
          <LegacyLink
            {...linkprops}>
            {linktext}
          </LegacyLink> :
          linktext
        }
        <ObserverIcon
          displayName={displayName}
          entity={entity}
          userName={userName}
        />
      </Layout>
      {entity.comment &&
        <Comment>({entity.comment})</Comment>
      }
      {children}
    </TableData>
  );
};

EntityNameTableData.propTypes = {
  entity: PropTypes.model.isRequired,
  links: React.PropTypes.bool,
  type: React.PropTypes.string.isRequired,
  displayName: React.PropTypes.string.isRequired,
  userName: React.PropTypes.string.isRequired,
};

export default EntityNameTableData;

// vim: set ts=2 sw=2 tw=80:
