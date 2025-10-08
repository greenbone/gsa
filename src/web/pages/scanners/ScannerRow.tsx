/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Scanner, {scannerTypeName, CVE_SCANNER_TYPE} from 'gmp/models/scanner';
import {isDefined} from 'gmp/utils/identity';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import EntityNameTableData from 'web/entities/EntityNameTableData';
import EntityLink from 'web/entity/Link';
import useTranslation from 'web/hooks/useTranslation';
import ScannerActions, {
  ScannerActionsProps,
} from 'web/pages/scanners/ScannerActions';

export interface ScannerRowProps extends ScannerActionsProps {
  actionsComponent?: React.ComponentType<ScannerActionsProps>;
  onToggleDetailsClick?: (entity: Scanner, id: string) => void;
}

const ScannerRow = ({
  actionsComponent: ActionsComponent = ScannerActions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...actionProps
}: ScannerRowProps) => {
  const [_] = useTranslation();
  return (
    <>
      <TableRow>
        <EntityNameTableData<Scanner>
          displayName={_('Scanner')}
          entity={entity}
          links={links}
          type="scanner"
          onToggleDetailsClick={onToggleDetailsClick}
        />
        <TableData>
          {entity.scannerType !== CVE_SCANNER_TYPE &&
            !entity.hasUnixSocket() &&
            entity.host}
        </TableData>
        <TableData>
          {entity.scannerType !== CVE_SCANNER_TYPE &&
            !entity.hasUnixSocket() &&
            entity.port}
        </TableData>
        <TableData>{scannerTypeName(entity.scannerType)}</TableData>
        <TableData>
          {isDefined(entity.credential) && (
            <span>
              <EntityLink entity={entity.credential} />
            </span>
          )}
        </TableData>
        <ActionsComponent {...actionProps} entity={entity} />
      </TableRow>
    </>
  );
};

export default ScannerRow;
