/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type PortList from 'gmp/models/portlist';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import EntityNameTableData from 'web/entities/EntityNameTableData';
import useTranslation from 'web/hooks/useTranslation';
import PortListActions, {
  type PortListActionsProps,
} from 'web/pages/portlists/PortListActions';

export interface PortListTableRowProps extends PortListActionsProps {
  actionsComponent?: React.ComponentType<PortListActionsProps>;
  links?: boolean;
  onToggleDetailsClick?: (entity: PortList) => void;
}

const PortListTableRow = ({
  actionsComponent: ActionsComponent = PortListActions,
  entity,
  links = true,
  onToggleDetailsClick,
  onPortListCloneClick,
  onPortListDeleteClick,
  onPortListDownloadClick,
  onPortListEditClick,
  onEntityDeselected,
  onEntitySelected,
  selectionType,
  'data-testid': dataTestId,
}: PortListTableRowProps) => {
  const [_] = useTranslation();
  return (
    <TableRow data-testid={dataTestId}>
      <EntityNameTableData
        displayName={_('Port List')}
        entity={entity}
        links={links}
        type="portlist"
        onToggleDetailsClick={onToggleDetailsClick}
      />
      <TableData align="start">{entity.portCount.all}</TableData>
      <TableData align="start">{entity.portCount.tcp}</TableData>
      <TableData align="start">{entity.portCount.udp}</TableData>
      <ActionsComponent
        entity={entity}
        selectionType={selectionType}
        onEntityDeselected={onEntityDeselected}
        onEntitySelected={onEntitySelected}
        onPortListCloneClick={onPortListCloneClick}
        onPortListDeleteClick={onPortListDeleteClick}
        onPortListDownloadClick={onPortListDownloadClick}
        onPortListEditClick={onPortListEditClick}
      />
    </TableRow>
  );
};

export default PortListTableRow;
