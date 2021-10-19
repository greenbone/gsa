/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import styled from 'styled-components';

import {isString} from 'gmp/utils/identity';

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
