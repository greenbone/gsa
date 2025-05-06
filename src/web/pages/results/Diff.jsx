/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isString} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';

const Pre = styled.div`
  white-space: pre-wrap;
  word-wrap: normal;
  font-family: monospace;
`;

export const Removed = styled(Pre)`
  background-color: #ffeef0;
`;

export const Added = styled(Pre)`
  background-color: #e6ffed;
`;

const Info = styled(Pre)`
  color: rgba(0, 0, 0, 0.3);
`;

const Diff = ({children: diffString}) => {
  if (!isString(diffString)) {
    return null;
  }

  const lines = diffString.split(/\r|\n|\r\n/);
  return (
    <React.Fragment>
      {lines.map((line, i) => {
        let Component;
        if (line.startsWith('+')) {
          Component = Added;
        } else if (line.startsWith('-')) {
          Component = Removed;
        } else if (line.startsWith('@')) {
          Component = Info;
        } else {
          Component = Pre;
        }
        return <Component key={i}>{line}</Component>;
      })}
    </React.Fragment>
  );
};

export default Diff;
