// @flow
/*
  Copyright(c) 2018 Uber Technologies, Inc.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

          http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import * as React from 'react';

import PropTypes from 'web/utils/proptypes';

const ARROW_SIZE = 4;

class ArrowheadMarker extends React.Component {
  constructor(...args) {
    super(...args);
  }

  render() {
    return (
      <marker
        id="end-arrow"
        key="end-arrow"
        viewBox={`0 -${ARROW_SIZE / 2} ${ARROW_SIZE} ${ARROW_SIZE}`}
        refX={`${ARROW_SIZE / 2}`}
        markerWidth={`${ARROW_SIZE}`}
        markerHeight={`${ARROW_SIZE}`}
        orient="auto"
      >
        <path
          className="arrow"
          d={`M0,-${ARROW_SIZE / 2}L${ARROW_SIZE},0L0,${ARROW_SIZE / 2}`}
        />
      </marker>
    );
  }
}

export default ArrowheadMarker;

// vim: set ts=2 sw=2 tw=80:
