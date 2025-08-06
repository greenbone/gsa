/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';

interface QodProps {
  value: number | string;
}

const Span = styled.span`
  white-space: nowrap;
`;

const Qod = ({value}: QodProps) => <Span data-testid="qod">{value} %</Span>;

export default Qod;
