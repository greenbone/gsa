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
import ArrowheadMarker from './arrowhead-marker';
import BackgroundPattern from './background-pattern';

import PropTypes from 'web/utils/proptypes';

class Defs extends React.Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    const graphConfigDefs = [];
    Defs.processGraphConfigDefs(nextProps.nodeTypes, graphConfigDefs);
    Defs.processGraphConfigDefs(nextProps.nodeSubtypes, graphConfigDefs);
    Defs.processGraphConfigDefs(nextProps.edgeTypes, graphConfigDefs);

    return {
      graphConfigDefs,
    };
  }

  static processGraphConfigDefs(typesObj, graphConfigDefs) {
    Object.keys(typesObj).forEach(type => {
      const safeId = typesObj[type].shapeId
        ? typesObj[type].shapeId.replace('#', '')
        : 'graphdef';
      graphConfigDefs.push(
        React.cloneElement(typesObj[type].shape, {
          key: `${safeId}-${graphConfigDefs.length + 1}`,
        }),
      );
    });
  }

  constructor(...props) {
    super(...props);
    this.state = {
      graphConfigDefs: [],
    };
  }

  render() {
    const {renderDefs = () => null} = this.props;
    return (
      <defs>
        {this.state.graphConfigDefs}

        <ArrowheadMarker />

        <BackgroundPattern />

        {renderDefs && renderDefs()}
      </defs>
    );
  }
}

Defs.propTypes = {
  edgeTypes: PropTypes.any,
  nodeSubtypes: PropTypes.any,
  nodeTypes: PropTypes.any,
  renderDefs: PropTypes.func,
};

export default Defs;

// vim: set ts=2 sw=2 tw=80:
