/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import DeleteIcon from 'web/components/icon/deleteicon';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';
import Table from 'web/components/table/stripedtable';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';

const PortRangesTable = ({actions = true, portRanges, onDeleteClick}) => {
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

PortRangesTable.propTypes = {
  actions: PropTypes.bool,
  portRanges: PropTypes.array,
  onDeleteClick: PropTypes.func,
};

export default PortRangesTable;

// vim: set ts=2 sw=2 tw=80:
