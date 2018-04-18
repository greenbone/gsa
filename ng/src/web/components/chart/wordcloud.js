/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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

import {scaleLinear} from 'd3-scale';

import d3cloud from 'd3-cloud';

import {arrays_equal} from 'gmp/utils/array';

import PropTypes from '../../utils/proptypes';

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

    this.state = {
      words: [],
    };
  }

  componentDidMount() {
    this.updateWords(this.props.data);
  }

  componentWillReceiveProps(next) {
    const {data, width, height} = this.props;

    if (!arrays_equal(next.data, data) ||
      next.width !== width || next.height !== height) {
      this.updateWords(next.data);
    }
  }

  updateWords(data) {
    const {width, height} = this.props;

    const maxWidth = width - margin.left - margin.right;
    const maxHeight = height - margin.top - margin.bottom;

    let values = data.map(d => d.value).sort();

    if (values.length > DEFAULT_MAX_WORDS) {
      values = values.slice(0, DEFAULT_MAX_WORDS);
    }

    const min = Math.min(...values);
    const max = Math.max(...values);

    const wordScale = scaleLinear()
      .domain([min, max])
      .range([MIN_FONT_SIZE, MAX_FONT_SIZE]);

    const words = data.map(word => ({
      size: wordScale(word.value),
      text: word.label,
      color: word.color,
    }));

    const cloud = d3cloud();

    cloud
      .size([maxWidth, maxHeight])
      .fontSize(d => d.size)
      .rotate(0)
      .padding(2)
      .font('Sans')
      .words(words)
      .on('end', wrds => this.setState({words: wrds}))
      .start();
  }

  render() {
    const {
      width,
      height,
    } = this.props;

    const {
      words,
    } = this.state;
    return (
      <Svg width={width} height={height}>
        <Group
          top={height / 2 + margin.top}
          left={width / 2 + margin.left}
        >
          {words.map(word => (
            <text
              key={word.text}
              fontSize={word.size + 'px'}
              fontFamily={word.font}
              fontWeight={word.weight}
              fill={word.color}
              textAnchor="middle"
              transform={
                'translate(' + [word.x, word.y] + ')rotate(' + word.rotate + ')'
              }
            >
              {word.text}
            </text>
          ))}
        </Group>
      </Svg>
    );
  }
}

WordCloudChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.number.isRequired,
    color: PropTypes.toString.isRequired,
    label: PropTypes.toString.isRequired,
  })),
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
};

export default WordCloudChart;

// vim: set ts=2 sw=2 tw=80:
