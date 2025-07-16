/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import InfoTable from 'web/components/table/InfoTable';
import TableCol from 'web/components/table/TableCol';

interface DetailsTableProps {
  children?: React.ReactNode;
  size?: string;
}

const DetailsTable = ({children, size = 'full'}: DetailsTableProps) => (
  <InfoTable size={size}>
    <colgroup>
      <TableCol width="10%" />
      <TableCol width="90%" />
    </colgroup>
    {children}
  </InfoTable>
);

export default DetailsTable;
