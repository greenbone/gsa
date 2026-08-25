/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useEffect, useRef, useState} from 'react';
import type d3 from 'd3';
import d3cloud, {type Word as d3Word} from 'd3-cloud';
import {scaleLinear} from 'd3-scale';
import {isDefined} from 'gmp/utils/identity';
import ChartWithEmptyState from 'web/components/chart/base/ChartWithEmptyState';
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

const margin = {
  top: 5,
  right: 5,
  bottom: 5,
  left: 5,
} as const;

const DEFAULT_MAX_WORDS = 50;
const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 20;

const createCloud = (onEnd: (words: Word[]) => void): Cloud =>
  d3cloud<Word>()
    .fontSize(d => d.size as number)
    .rotate(0)
    .padding(2)
    .font('Sans')
    .on('end', onEnd);

const createWords = (data: WordCloudChartData[]): Word[] => {
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

  return origWords;
};

const WordCloudChart = ({
  data,
  width,
  height,
  svgRef,
  onDataClick,
}: WordCloudChartProps) => {
  const [words, setWords] = useState<Word[]>([]);
  const cloudRef = useRef<Cloud | null>(null);

  if (!cloudRef.current) {
    cloudRef.current = createCloud(setWords);
  }

  useEffect(() => {
    const cloud = cloudRef.current as Cloud;
    const maxWidth = width - margin.left - margin.right;
    const maxHeight = height - margin.top - margin.bottom;

    cloud.size([maxWidth, maxHeight]);
    cloud.stop();
    cloud.words(createWords(data));
    if (data.length > 0) {
      cloud.start();
    } else {
      setWords([]);
    }

    return () => {
      cloud.stop();
    };
  }, [data, height, width]);

  return (
    <Svg
      ref={svgRef}
      data-testid="word-cloud-chart-svg"
      height={height}
      width={width}
    >
      <ChartWithEmptyState
        data-testid="word-cloud-empty"
        height={height}
        isEmpty={words.length === 0}
        width={width}
      >
        <Group left={width / 2 + margin.left} top={height / 2 + margin.top}>
          {words.map(word => (
            <Group
              key={word.text}
              data-testid={`word-cloud-word-${word.text}`}
              onClick={
                isDefined(onDataClick)
                  ? () => onDataClick(word.filterValue)
                  : undefined
              }
            >
              <text
                fill={word.color}
                fontFamily={word.font}
                fontSize={`${word.size}px`}
                fontWeight={word.weight}
                textAnchor="middle"
                transform={`translate(${word.x},${word.y})rotate(${word.rotate})`}
              >
                {word.text}
              </text>
            </Group>
          ))}
        </Group>
      </ChartWithEmptyState>
    </Svg>
  );
};

export default WordCloudChart;
