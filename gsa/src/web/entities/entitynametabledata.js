/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import {is_defined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import withUserName from 'web/utils/withUserName';

import Comment from 'web/components/comment/comment';

import Layout from 'web/components/layout/layout';

import DetailsLink from 'web/components/link/detailslink';

import TableData from 'web/components/table/data';

import ObserverIcon from 'web/entity/icon/observericon';

import {RowDetailsToggle} from './row';

const EntityNameTableData = ({
  entity,
  links = true,
  displayName,
  userName,
  type = entity.entity_type,
  children,
  onToggleDetailsClick,
}) => (
  <TableData flex="column">
    <Layout flex align="space-between">
      <Layout flex="column">
        {entity.isOrphan() &&
          <b>{_('Orphan')}</b>
        }
        {is_defined(onToggleDetailsClick) ?
          <RowDetailsToggle
            name={entity.id}
            onClick={onToggleDetailsClick}>
            {entity.name}
          </RowDetailsToggle> :
          <DetailsLink
            type={type}
            id={entity.id}
            textOnly={!links}>
            {entity.name}
          </DetailsLink>
        }
      </Layout>
      <ObserverIcon
        displayName={displayName}
        entity={entity}
        userName={userName}
      />
    </Layout>
    {is_defined(entity.comment) &&
      <Comment>({entity.comment})</Comment>
    }
    {children}
  </TableData>
);

EntityNameTableData.propTypes = {
  displayName: PropTypes.string.isRequired,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  type: PropTypes.string,
  userName: PropTypes.string.isRequired,
  onToggleDetailsClick: PropTypes.func,
};

export default withUserName(EntityNameTableData);

// vim: set ts=2 sw=2 tw=80:
