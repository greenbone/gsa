/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {getEntityType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import Comment from 'web/components/comment/Comment';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import TableData from 'web/components/table/Data';
import RowDetailsToggle from 'web/entities/RowDetailsToggle';
import ObserverIcon from 'web/entity/icon/ObserverIcon';
import useTranslation from 'web/hooks/useTranslation';
import useUserName from 'web/hooks/useUserName';
import PropTypes from 'web/utils/PropTypes';

const EntityNameTableData = ({
  entity,
  links = true,
  displayName,
  type = getEntityType(entity),
  children,
  onToggleDetailsClick,
}) => {
  const [_] = useTranslation();
  const [username] = useUserName();
  return (
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
};

EntityNameTableData.propTypes = {
  children: PropTypes.node,
  displayName: PropTypes.string.isRequired,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  type: PropTypes.string,
  onToggleDetailsClick: PropTypes.func,
};

export default EntityNameTableData;
