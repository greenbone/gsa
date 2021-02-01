/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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

import {scaleLinear} from 'd3-scale';

import d3cloud from 'd3-cloud';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import Group from './group';
import Svg from './svg';

const margin = {
  top: 5,
  right: 5,
  bottom: 5,
  left: 5,
};

const DEFAULT_MAX_WORDS = 50;
const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 20;

class WordCloudChart extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {};

    this.cloud = d3cloud()
      .fontSize(d => d.size)
      .rotate(0)
      .padding(2)
      .font('Sans')
      .on('end', words => this.setState({words}));
  }

  componentDidMount() {
    const {data = []} = this.props;
    if (data.length > 0) {
      this.updateSize();
      this.updateWords();
      this.cloud.start();
    }
  }

  componentDidUpdate() {
    if (
      this.state.width !== this.props.width ||
      this.state.height !== this.props.height
    ) {
      this.updateSize();
    }
    if (this.state.data !== this.props.data) {
      // data has been changed => recalcuate words
      this.updateWords();
    }
    if (
      this.state.width !== this.props.width ||
      this.state.height !== this.props.height ||
      this.state.data !== this.props.data
    ) {
      this.cloud.start();
    }
  }

  updateWords() {
    const {data} = this.props;

    let values = data.map(d => d.value).sort();

    if (values.length > DEFAULT_MAX_WORDS) {
      values = values.slice(0, DEFAULT_MAX_WORDS);
    }

    const min = Math.min(...values);
    const max = Math.max(...values);

    const wordScale = scaleLinear()
      .domain([min, max])
      .range([MIN_FONT_SIZE, MAX_FONT_SIZE]);

    const origWords = data.map(word => ({
      size: wordScale(word.value),
      text: word.label,
      color: word.color,
      filterValue: word.filterValue,
    }));

    // store to be rendered data in state
    // this allows to check if we need to update words on next render phase
    this.setState({data});

    this.cloud.stop();
    this.cloud.words(origWords);
  }

  updateSize() {
    const {width, height} = this.props;
    const maxWidth = width - margin.left - margin.right;
    const maxHeight = height - margin.top - margin.bottom;

    this.cloud.size([maxWidth, maxHeight]);

    this.setState({
      height,
      width,
    });
  }

  render() {
    const {width, height, svgRef, onDataClick} = this.props;

    const {words = []} = this.state;
    return (
      <Svg width={width} height={height} ref={svgRef}>
        <Group top={height / 2 + margin.top} left={width / 2 + margin.left}>
          {words.map(word => (
            <Group
              key={word.text}
              onClick={
                isDefined(onDataClick)
                  ? () => onDataClick(word.filterValue)
                  : undefined
              }
            >
              <text
                fontSize={word.size + 'px'}
                fontFamily={word.font}
                fontWeight={word.weight}
                fill={word.color}
                textAnchor="middle"
                transform={
                  'translate(' +
                  [word.x, word.y] +
                  ')rotate(' +
                  word.rotate +
                  ')'
                }
              >
                {word.text}
              </text>
            </Group>
          ))}
        </Group>
      </Svg>
    );
  }
}

WordCloudChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      color: PropTypes.toString.isRequired,
      label: PropTypes.toString.isRequired,
    }),
  ),
  height: PropTypes.number.isRequired,
  svgRef: PropTypes.ref,
  width: PropTypes.number.isRequired,
  onDataClick: PropTypes.func,
};

export default WordCloudChart;

// vim: set ts=2 sw=2 tw=80:
