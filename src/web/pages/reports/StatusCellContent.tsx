/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode} from 'react';
import styled from 'styled-components';

interface StatusCellContentProps {
  className?: string;
  scannerContact?: ReactNode;
  statusBar: ReactNode;
}

const StatusCell = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const StatusCellContent = ({
  className,
  scannerContact,
  statusBar,
}: StatusCellContentProps) => (
  <StatusCell className={className}>
    {statusBar}
    {scannerContact}
  </StatusCell>
);

export default StatusCellContent;
