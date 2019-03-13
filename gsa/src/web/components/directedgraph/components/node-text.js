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
import GraphUtils from './graph-util';
import PropTypes from 'web/utils/proptypes';

class NodeText extends React.Component {
  render() {
    const {data, nodeTypes, isSelected} = this.props;
    const lineOffset = 5;
    const {title} = data;
    const className = GraphUtils.classNames('node-text', {
      selected: isSelected,
    });

    return (
      <text className={className} textAnchor="middle">
        {title && (
          <tspan x={0} dy={lineOffset} fontSize="10px">
            {title}
          </tspan>
        )}
        {title && <title>{title}</title>}
      </text>
    );
  }
}

NodeText.propTypes = {
  data: PropTypes.any,
  isSelected: PropTypes.bool,
  nodeTypes: PropTypes.any,
};

export default NodeText;

// vim: set ts=2 sw=2 tw=80:
