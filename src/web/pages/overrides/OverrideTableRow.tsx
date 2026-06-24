/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import {severityValue} from 'gmp/utils/number';
import {shorten} from 'gmp/utils/string';
import SeverityBar from 'web/components/bar/SeverityBar';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import RowDetailsToggle from 'web/entities/RowDetailsToggle';
import useTranslation from 'web/hooks/useTranslation';
import OverrideTableActions, {
  type OverrideTableActionsProps,
} from 'web/pages/overrides/OverrideTableActions';
import {
  extraRiskFactor,
  translateRiskFactor,
  LOG_VALUE,
} from 'web/utils/severity';

export interface OverrideTableRowProps extends OverrideTableActionsProps {
  actionsComponent?: React.ComponentType<OverrideTableActionsProps>;
  onToggleDetailsClick: () => void;
}

const OverrideTableRow = ({
  actionsComponent: ActionsComponent = OverrideTableActions,
  entity,
  onToggleDetailsClick,
  ...props
}: OverrideTableRowProps) => {
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
      <TableData title={entity.hosts?.join(', ')}>
        {shorten(entity.hosts?.join(', '))}
      </TableData>
      <TableData title={entity.port}>{shorten(entity.port)}</TableData>
      <TableData>{renderSeverity(entity.severity as number)}</TableData>
      <TableData>
        <SeverityBar severity={entity.newSeverity} />
      </TableData>
      <TableData>{entity.isActive() ? _('yes') : _('no')}</TableData>
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

export default OverrideTableRow;
