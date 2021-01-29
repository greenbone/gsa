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

import _ from 'gmp/locale';

import {hasValue, isDefined} from 'gmp/utils/identity';
import {getEntityType} from 'gmp/utils/entitytype';

import Comment from 'web/components/comment/comment';

import Layout from 'web/components/layout/layout';

import DetailsLink from 'web/components/link/detailslink';

import TableData from 'web/components/table/data';

import ObserverIcon from 'web/entity/icon/observericon';

import PropTypes from 'web/utils/proptypes';
import withUsername from 'web/utils/withUserName';

import {RowDetailsToggle} from './row';

const EntityNameTableData = ({
  entity,
  links = true,
  displayName,
  username,
  type = getEntityType(entity),
  children,
  onToggleDetailsClick,
}) => (
  <TableData flex="column">
    <Layout align="space-between">
      <Layout flex="column">
        {entity.isOrphan() && <b>{_('Orphan')}</b>}
        {isDefined(onToggleDetailsClick) ? (
          <span>
            <RowDetailsToggle name={entity.id} onClick={onToggleDetailsClick}>
              {entity.name}
            </RowDetailsToggle>
          </span>
        ) : (
          <span>
            <DetailsLink type={type} id={entity.id} textOnly={!links}>
              {entity.name}
            </DetailsLink>
          </span>
        )}
      </Layout>
      <ObserverIcon
        displayName={displayName}
        entity={entity}
        userName={username}
      />
    </Layout>
    {hasValue(entity.comment) && <Comment>({entity.comment})</Comment>}
    {children}
  </TableData>
);

EntityNameTableData.propTypes = {
  displayName: PropTypes.string.isRequired,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  type: PropTypes.string,
  username: PropTypes.string.isRequired,
  onToggleDetailsClick: PropTypes.func,
};

export default withUsername(EntityNameTableData);

// vim: set ts=2 sw=2 tw=80:
