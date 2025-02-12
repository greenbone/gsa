/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {getEntityType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
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
  <TableData>
    <Layout align={'space-between'} columns={2}>
      <div>
        {entity.isOrphan() && <b>{_('Orphan')}</b>}
        {isDefined(onToggleDetailsClick) ? (
          <span>
            <RowDetailsToggle name={entity.id} onClick={onToggleDetailsClick}>
              {entity.name}
            </RowDetailsToggle>
            {entity.deprecated && <b> ({_('Deprecated')})</b>}
          </span>
        ) : (
          <span>
            <DetailsLink id={entity.id} textOnly={!links} type={type}>
              {entity.name}
            </DetailsLink>
            {entity.deprecated && <b> ({_('Deprecated')})</b>}
          </span>
        )}
        {isDefined(entity.comment) && <Comment>({entity.comment})</Comment>}
        {children}
      </div>
      <Layout>
        <ObserverIcon
          displayName={displayName}
          entity={entity}
          userName={username}
        />
      </Layout>
    </Layout>
  </TableData>
);

EntityNameTableData.propTypes = {
  children: PropTypes.node,
  displayName: PropTypes.string.isRequired,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  type: PropTypes.string,
  username: PropTypes.string.isRequired,
  onToggleDetailsClick: PropTypes.func,
};

export default withUsername(EntityNameTableData);
