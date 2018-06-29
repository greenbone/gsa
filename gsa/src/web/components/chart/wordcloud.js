/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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

import {is_defined} from 'gmp/utils/identity';

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

    this.state = {};

    this.cloud = d3cloud()
      .fontSize(d => d.size)
      .rotate(0)
      .padding(2)
      .font('Sans');
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {data, width, height} = nextProps;

    if (data !== prevState.data ||
      width !== prevState.width ||
      height !== prevState.width) {

      const state = {
        height,
        width,
        words: undefined, // reset words -> words must be recalculated
      };

      if (data !== prevState.data) {
        // only update origWords if data has changed

        let values = data.map(d => d.value).sort();

        if (values.length > DEFAULT_MAX_WORDS) {
          values = values.slice(0, DEFAULT_MAX_WORDS);
        }

        const min = Math.min(...values);
        const max = Math.max(...values);

        const wordScale = scaleLinear()
          .domain([min, max])
          .range([MIN_FONT_SIZE, MAX_FONT_SIZE]);

        state.origWords = data.map(word => ({
          size: wordScale(word.value),
          text: word.label,
          color: word.color,
          filterValue: word.filterValue,
        }));
      }
      return state;
    }
    return null;
  }

  componentDidMount() {
    this.updateWords();
  }

  componentDidUpdate() {
    if (!is_defined(this.state.words)) {
      // words have been reset => recalcuate words
      this.updateWords();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.origWords !== this.state.origWords ||
      nextState.words !== this.state.words;
  }

  updateWords() {
    const {width, height, origWords} = this.state;

    const maxWidth = width - margin.left - margin.right;
    const maxHeight = height - margin.top - margin.bottom;

    this.cloud.stop();
    this.cloud
      .size([maxWidth, maxHeight])
      .words(origWords)
      .on('end', words => this.setState({words}))
      .start();
  }

  render() {
    const {
      width,
      height,
      svgRef,
      onDataClick,
    } = this.props;

    const {
      words = [],
    } = this.state;
    return (
      <Svg
        width={width}
        height={height}
        innerRef={svgRef}
      >
        <Group
          top={height / 2 + margin.top}
          left={width / 2 + margin.left}
        >
          {words.map(word => (
            <Group
              key={word.text}
              onClick={is_defined(onDataClick) ?
                () => onDataClick(word.filterValue) : undefined}
            >
              <text
                fontSize={word.size + 'px'}
                fontFamily={word.font}
                fontWeight={word.weight}
                fill={word.color}
                textAnchor="middle"
                transform={
                  'translate(' + [word.x, word.y] + ')rotate(' +
                    word.rotate + ')'}
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
  data: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.number.isRequired,
    color: PropTypes.toString.isRequired,
    label: PropTypes.toString.isRequired,
  })),
  height: PropTypes.number.isRequired,
  svgRef: PropTypes.ref,
  width: PropTypes.number.isRequired,
  onDataClick: PropTypes.func,
};

export default WordCloudChart;

// vim: set ts=2 sw=2 tw=80:
