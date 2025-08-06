/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {isString} from 'gmp/utils/identity';

interface ResultDiffProps {
  children?: string | null;
}

interface ResultDiffChildrenProps {
  children?: React.ReactNode;
}

export const DIFF_COLOR_REMOVED = '#ffeef0';
export const DIFF_COLOR_ADDED = '#e6ffedff';
export const DIFF_COLOR_INFO = 'rgba(0, 0, 0, 0.3)';

const Pre = styled.div`
  white-space: pre-wrap;
  word-wrap: normal;
  font-family: monospace;
`;

export const Removed = styled(Pre)`
  background-color: ${DIFF_COLOR_REMOVED};
`;

export const Added = styled(Pre)`
  background-color: ${DIFF_COLOR_ADDED};
`;

const Info = styled(Pre)`
  color: ${DIFF_COLOR_INFO};
`;

const ResultDiff = ({children: diffString}: ResultDiffProps) => {
  if (!isString(diffString)) {
    return null;
  }

  const lines = diffString.trim().split(/\r|\n|\r\n/);
  return (
    <>
      {lines.map((line, i) => {
        let Component: React.ComponentType<ResultDiffChildrenProps>;
        if (line.startsWith('+')) {
          Component = Added;
        } else if (line.startsWith('-')) {
          Component = Removed;
        } else if (line.startsWith('@')) {
          Component = Info;
        } else {
          Component = Pre;
        }
        return (
          <Component key={i} data-testid="result-diff-item">
            {line}
          </Component>
        );
      })}
    </>
  );
};

export default ResultDiff;
