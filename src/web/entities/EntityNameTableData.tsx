/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import type Model from 'gmp/models/model';
import {type EntityType, getEntityType} from 'gmp/utils/entity-type';
import {isDefined} from 'gmp/utils/identity';
import Comment from 'web/components/comment/Comment';
import Layout from 'web/components/layout/Layout';
import TableData from 'web/components/table/TableData';
import {type RowPreview} from 'web/entities/EntitiesTable';
import TableEntityName from 'web/entities/TableEntityName';
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
  preview?: RowPreview;
}

const EntityNameTableData = <TEntity extends Model>({
  'data-testid': dataTestId,
  entity,
  links = true,
  displayName,
  type = getEntityType(entity),
  children,
  preview,
}: EntityNameTableDataProps<TEntity>) => {
  const [_] = useTranslation();
  const username = useUserName() as string;
  return (
    <TableData data-testid={dataTestId}>
      <Layout align="space-between">
        <div>
          {entity.isOrphan() && <b>{_('Orphan')}</b>}
          <span>
            <TableEntityName
              id={entity.id}
              links={links}
              preview={preview}
              type={type}
            >
              {entity.name}
            </TableEntityName>
            {/* disabled is currently only supported for scanners. */}
            {/* @ts-expect-error */}
            {entity?.disabled && <b> ({_('Disabled')})</b>}
            {/* @ts-expect-error */}
            {entity?.deprecated && <b> ({_('Deprecated')})</b>}
          </span>
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
