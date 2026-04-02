/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import Theme from 'web/utils/Theme';

export const CommandWrapper = styled.div`
  position: relative;
  margin: 8px 0;
`;

export const Pre = styled.pre`
  background: ${Theme.black};
  color: ${Theme.lightGray};
  padding: 16px 44px 16px 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.9em;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

export const OsCard = styled.div`
  background: ${Theme.white};
  border: 1px solid ${Theme.inputBorderGray};
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0 20px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const ChecksumBox = styled.div`
  background: ${Theme.dialogGray};
  border: 1px solid ${Theme.mediumDarkGray};
  border-radius: 4px;
  padding: 8px 12px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.85em;
  word-break: break-all;
  margin: 8px 0;
`;

export const ConfigValue = styled.span`
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.9em;
  word-break: break-all;
`;

export const StepsList = styled.ol`
  background: ${Theme.dialogGray};
  border: 1px solid ${Theme.lightGray};
  border-radius: 8px;
  padding: 16px 16px 16px 40px;
  margin: 8px 0;

  li {
    padding: 6px 0;
    line-height: 1.6;
  }
`;

export const BulletList = styled.ul`
  background: ${Theme.dialogGray};
  border: 1px solid ${Theme.lightGray};
  border-radius: 8px;
  padding: 16px 16px 16px 36px;
  margin: 8px 0;

  li {
    padding: 4px 0;
    line-height: 1.6;
  }
`;

export const InfoParagraph = styled.p`
  margin: 8px 0 16px 0;
  padding: 8px 12px;
  border-left: 3px solid ${Theme.mediumDarkGray};
  background: ${Theme.dialogGray};
  color: ${Theme.darkGray};
  line-height: 1.4;
`;
