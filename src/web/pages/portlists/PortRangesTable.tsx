/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {ProtocolType} from 'gmp/models/portlist';
import {isDefined} from 'gmp/utils/identity';
import DeleteIcon from 'web/components/icon/DeleteIcon';
import TableBody from 'web/components/table/Body';
import TableData from 'web/components/table/Data';
import Table from 'web/components/table/StripedTable';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';

export interface PortRange {
  start: number;
  end: number;
  protocolType: ProtocolType;
}

interface PortRangesTableProps<TPortRange extends PortRange> {
  actions?: boolean;
  portRanges?: TPortRange[];
  onDeleteClick?: (value: TPortRange) => void | Promise<void>;
}

const PortRangesTable = <TPortRange extends PortRange>({
  actions = true,
  portRanges,
  onDeleteClick,
}: PortRangesTableProps<TPortRange>) => {
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
          <TableRow key={`${range.start}-${range.protocolType}`}>
            <TableData>{range.start}</TableData>
            <TableData>{range.end}</TableData>
            <TableData>{range.protocolType}</TableData>
            {actions && (
              <TableData align={['center', 'center']}>
                <DeleteIcon<TPortRange>
                  title={_('Delete Port Range')}
                  value={range}
                  onClick={onDeleteClick as () => void}
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
