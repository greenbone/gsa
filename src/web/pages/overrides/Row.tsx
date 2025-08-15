/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Model from 'gmp/models/model';
import {isDefined} from 'gmp/utils/identity';
import {severityValue} from 'gmp/utils/number';
import {shorten} from 'gmp/utils/string';
import SeverityBar from 'web/components/bar/SeverityBar';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import RowDetailsToggle from 'web/entities/RowDetailsToggle';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useTranslation from 'web/hooks/useTranslation';
import {
  extraRiskFactor,
  translateRiskFactor,
  LOG_VALUE,
} from 'web/utils/severity';

// should be changed to an Override model in future
interface Override extends Model {
  text: string;
  nvt?: {
    name: string;
  };
  hosts: string[];
  port: string;
  severity: number;
  newSeverity: number;
}

interface OverrideRowProps extends ActionsProps {
  actionsComponent?: React.ComponentType<ActionsProps>;
  onToggleDetailsClick: () => void;
}

interface ActionsProps {
  entity: Override;
  onOverrideDeleteClick: (entity: Override) => void | Promise<void>;
  onOverrideDownloadClick: (entity: Override) => void | Promise<void>;
  onOverrideCloneClick: (entity: Override) => void | Promise<void>;
  onOverrideEditClick: (entity: Override) => void | Promise<void>;
}

const Actions = withEntitiesActions(
  ({
    entity,
    onOverrideDeleteClick,
    onOverrideDownloadClick,
    onOverrideCloneClick,
    onOverrideEditClick,
  }: ActionsProps) => {
    const [_] = useTranslation();

    return (
      <IconDivider grow align={['center', 'center']}>
        <TrashIcon<Override>
          entity={entity}
          name="override"
          onClick={onOverrideDeleteClick}
        />
        <EditIcon
          entity={entity}
          name="override"
          onClick={onOverrideEditClick}
        />
        <CloneIcon<Override>
          entity={entity}
          name="override"
          onClick={onOverrideCloneClick}
        />
        <ExportIcon<Override>
          title={_('Export Override')}
          value={entity}
          onClick={onOverrideDownloadClick}
        />
      </IconDivider>
    );
  },
);

const Row = ({
  actionsComponent: ActionsComponent = Actions,
  entity,
  onToggleDetailsClick,
  ...props
}: OverrideRowProps) => {
  const [_] = useTranslation();

  const renderSeverity = (severity: number): string => {
    if (isDefined(severity)) {
      if (severity <= LOG_VALUE) {
        return translateRiskFactor(extraRiskFactor(severity));
      }
      return '> ' + (severityValue(severity - 0.1) as string);
    }
    return _('Any');
  };

  return (
    <TableRow>
      <TableData>
        <span>
          <RowDetailsToggle name={entity.id} onClick={onToggleDetailsClick}>
            {shorten(entity.text)}
          </RowDetailsToggle>
        </span>
      </TableData>
      <TableData>{entity.nvt ? entity.nvt.name : ''}</TableData>
      <TableData title={entity.hosts.join(', ')}>
        {shorten(entity.hosts.join(', '))}
      </TableData>
      <TableData title={entity.port}>{shorten(entity.port)}</TableData>
      <TableData>{renderSeverity(entity.severity)}</TableData>
      <TableData>
        <SeverityBar severity={entity.newSeverity} />
      </TableData>
      <TableData>{entity.isActive() ? _('yes') : _('no')}</TableData>
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

export default Row;
