/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Model from 'gmp/models/model';
import {EntityType, getEntityType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import Comment from 'web/components/comment/Comment';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import TableData from 'web/components/table/TableData';
import RowDetailsToggle from 'web/entities/RowDetailsToggle';
import ObserverIcon from 'web/entity/icon/ObserverIcon';
import useTranslation from 'web/hooks/useTranslation';
import useUserName from 'web/hooks/useUserName';

interface EntityNameTableDataProps<TEntity extends Model> {
  'data-testid'?: string;
  entity: TEntity;
  links?: boolean;
  displayName: string;
  type?: EntityType;
  children?: React.ReactNode;
  onToggleDetailsClick?: (entity: TEntity, id: string) => void;
}

const EntityNameTableData = <TEntity extends Model>({
  'data-testid': dataTestId,
  entity,
  links = true,
  displayName,
  type = getEntityType(entity),
  children,
  onToggleDetailsClick,
}: EntityNameTableDataProps<TEntity>) => {
  const [_] = useTranslation();
  const [username] = useUserName();
  return (
    <TableData data-testid={dataTestId}>
      <Layout align="space-between">
        <div>
          {entity.isOrphan() && <b>{_('Orphan')}</b>}
          {isDefined(onToggleDetailsClick) ? (
            <span>
              <RowDetailsToggle<TEntity>
                name={entity.id}
                value={entity}
                onClick={
                  onToggleDetailsClick as (
                    entity: TEntity,
                    name?: string,
                  ) => void
                }
              >
                {entity.name}
              </RowDetailsToggle>
              {/* @ts-expect-error */}
              {entity?.deprecated && <b> ({_('Deprecated')})</b>}
            </span>
          ) : (
            <span>
              <DetailsLink
                id={entity.id as string}
                textOnly={!links}
                type={type}
              >
                {entity.name}
              </DetailsLink>
              {/* @ts-expect-error */}
              {entity?.deprecated && <b> ({_('Deprecated')})</b>}
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

export default EntityNameTableData;
