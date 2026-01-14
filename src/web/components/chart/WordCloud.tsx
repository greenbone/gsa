/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import type d3 from 'd3';
import d3cloud, {type Word as d3Word} from 'd3-cloud';
import {scaleLinear} from 'd3-scale';
import {isDefined} from 'gmp/utils/identity';
import Group from 'web/components/chart/base/Group';
import {type LegendData} from 'web/components/chart/base/Legend';
import Svg from 'web/components/chart/base/Svg';

interface Word extends d3Word {
  color?: string;
  filterValue: string;
}

type Cloud = d3.layout.Cloud<Word>;

interface WordCloudChartData extends LegendData {
  value: number;
  filterValue?: string;
}

interface WordCloudChartProps {
  data: WordCloudChartData[];
  width: number;
  height: number;
  svgRef?: React.RefObject<SVGSVGElement>;
  onDataClick?: (filterValue: string) => void;
}

interface WordCloudChartState {
  width?: number;
  height?: number;
  words?: Word[];
  data?: WordCloudChartData[];
}

const margin = {
  top: 5,
  right: 5,
  bottom: 5,
  left: 5,
} as const;

const DEFAULT_MAX_WORDS = 50;
const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 20;

class WordCloudChart extends React.Component<
  WordCloudChartProps,
  WordCloudChartState
> {
  private cloud: Cloud;

  constructor(props: WordCloudChartProps) {
    super(props);

    this.state = {};

    this.cloud = d3cloud<Word>()
      .fontSize(d => d.size as number)
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
      // data has been changed => recalculate words
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
    })) as Word[];

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
      <Svg ref={svgRef} height={height} width={width}>
        <Group left={width / 2 + margin.left} top={height / 2 + margin.top}>
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
                fill={word.color}
                fontFamily={word.font}
                fontSize={word.size + 'px'}
                fontWeight={word.weight}
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

export default WordCloudChart;
