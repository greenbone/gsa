/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type React from 'react';
import styled from 'styled-components';
import Theme from 'web/utils/theme';

interface TaskTypePillProps {
  children: React.ReactNode;
}

const Pill = styled.span`
  display: inline-flex;
  box-sizing: border-box;
  gap: 4px;
  height: 24px;
  align-items: center;
  padding: 0 7px;
  border: 1px solid ${Theme.lightGray};
  border-radius: 5px;
  color: ${Theme.darkGray};
  background: ${Theme.white};
  font-size: 11px;
  font-weight: normal;
  line-height: 1;
`;

const TaskTypePill = ({children}: TaskTypePillProps) => <Pill>{children}</Pill>;

export default TaskTypePill;
