/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Col from 'web/components/table/Col';
import InfoTable from 'web/components/table/InfoTable';

interface DetailsTableProps {
  children?: React.ReactNode;
  size?: string;
}

const DetailsTable = ({children, size = 'full'}: DetailsTableProps) => (
  <InfoTable size={size}>
    <colgroup>
      <Col width="10%" />
      <Col width="90%" />
    </colgroup>
    {children}
  </InfoTable>
);

export default DetailsTable;
