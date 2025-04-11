/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import DeleteIcon from 'web/components/icon/DeleteIcon';
import TableBody from 'web/components/table/Body';
import TableData from 'web/components/table/Data';
import TableHead from 'web/components/table/Head';
import TableHeader from 'web/components/table/Header';
import TableRow from 'web/components/table/Row';
import Table from 'web/components/table/StripedTable';
import useTranslation from 'web/hooks/useTranslation';
interface PortRange {
  start: number;
  end: number;
  protocol_type: string;
}

interface PortRangesTableProps {
  actions?: boolean;
  portRanges?: PortRange[];
  onDeleteClick?: (value: PortRange) => void;
}

const PortRangesTable: React.FC<PortRangesTableProps> = ({
  actions = true,
  portRanges,
  onDeleteClick,
}: PortRangesTableProps) => {
  const [_] = useTranslation();
  if (!isDefined(portRanges) || portRanges.length === 0) {
    return _('No Port Ranges available');
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{_('Start')}</TableHead>
          <TableHead>{_('End')}</TableHead>
          <TableHead>{_('Protocol')}</TableHead>
          {actions && <TableHead width="3em">{_('Actions')}</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {portRanges.map(range => (
          <TableRow key={range.start + range.protocol_type}>
            <TableData>{range.start}</TableData>
            <TableData>{range.end}</TableData>
            <TableData>{range.protocol_type}</TableData>
            {actions && (
              <TableData align={['center', 'center']}>
                <DeleteIcon
                  title={_('Delete Port Range')}
                  value={range}
                  onClick={onDeleteClick}
                />
              </TableData>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PortRangesTable;
