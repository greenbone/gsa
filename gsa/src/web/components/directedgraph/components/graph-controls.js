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

import React from 'react';
// import Parse from 'html-react-parser';
import faExpand from 'web/components/icon/svg/details.svg';

import PropTypes from 'web/utils/proptypes';

const steps = 100; // Slider steps
// const parsedIcon = Parse(faExpand); //  parse SVG once
const ExpandIcon = faExpand; // convert SVG to react component

class GraphControls extends React.Component {
  constructor(...props) {
    super(...props);
  }

  // Convert slider val (0-steps) to original zoom value range
  sliderToZoom(val) {
    const {minZoom = 0.15, maxZoom = 1.5} = this.props;
    return (val * ((maxZoom || 0) - (minZoom || 0))) / steps + (minZoom || 0);
  }

  // Convert zoom val (minZoom-maxZoom) to slider range
  zoomToSlider(val) {
    const {minZoom, maxZoom} = this.props;
    return ((val - (minZoom || 0)) * steps) / ((maxZoom || 0) - (minZoom || 0));
  }

  // Modify current zoom of graph-view
  zoom = e => {
    const {minZoom, maxZoom} = this.props;
    const sliderVal = e.target.value;
    const zoomLevelNext = this.sliderToZoom(sliderVal);
    const delta = zoomLevelNext - this.props.zoomLevel;

    if (zoomLevelNext <= (maxZoom || 0) && zoomLevelNext >= (minZoom || 0)) {
      this.props.modifyZoom(delta);
    }
  };

  render() {
    return (
      <div className="graph-controls">
        <div className="slider-wrapper">
          <span>-</span>
          <input
            type="range"
            className="slider"
            min={this.zoomToSlider(this.props.minZoom || 0)}
            max={this.zoomToSlider(this.props.maxZoom || 0)}
            value={this.zoomToSlider(this.props.zoomLevel)}
            onChange={this.zoom}
            step="1"
          />
          <span>+</span>
        </div>
        <button
          type="button"
          className="slider-button"
          onMouseDown={this.props.zoomToFit}
        >
          <ExpandIcon />
        </button>
      </div>
    );
  }
}

GraphControls.propTypes = {
  maxZoom: PropTypes.number,
  minZoom: PropTypes.number,
  zoomLevel: PropTypes.number,
  // zoomToFit: (event: SyntheticMouseEvent<HTMLButtonElement>) => void,
  // modifyZoom: (delta: number) => boolean;
};

export default GraphControls;

// vim: set ts=2 sw=2 tw=80:
