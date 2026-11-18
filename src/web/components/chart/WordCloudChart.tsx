/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useState} from 'react';
import CloudLayout, {type PlacedSprite} from 'd3-cloud';
import {scaleLinear} from 'd3-scale';
import {isDefined} from 'gmp/utils/identity';
import ChartWithEmptyState from 'web/components/chart/base/ChartWithEmptyState';
import Group from 'web/components/chart/base/Group';
import {type LegendData} from 'web/components/chart/base/Legend';
import Svg, {type SvgRef} from 'web/components/chart/base/Svg';

interface WordCloudChartData extends LegendData {
  value: number;
  filterValue?: string;
}

interface WordCloudChartProps {
  data?: WordCloudChartData[];
  width: number;
  height: number;
  svgRef?: SvgRef;
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
const HOVER_TRANSITION = 'opacity 180ms ease-in-out';

const placeWords = (
  data: WordCloudChartData[] | undefined,
  width: number,
  height: number,
): PlacedSprite<WordCloudChartData>[] => {
  if (!data?.length || width <= 0 || height <= 0) {
    return [];
  }

  let values = data.map(d => d.value).sort((a, b) => a - b);

  if (values.length > DEFAULT_MAX_WORDS) {
    values = values.slice(0, DEFAULT_MAX_WORDS);
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  const wordScale = scaleLinear()
    .domain([min, max])
    .range([MIN_FONT_SIZE, MAX_FONT_SIZE]);

  const prepared = data
    .map(datum => ({datum, size: Math.trunc(wordScale(datum.value))}))
    .filter(word => Number.isFinite(word.size))
    .sort((a, b) => b.size - a.size);

  const cloud = new CloudLayout().size([width, height]).overflow(false);
  const placedWords: PlacedSprite<WordCloudChartData>[] = [];
  for (const {datum, size} of prepared) {
    const sprite = cloud.getSprite(String(datum.label), {
      datum,
      font: 'Sans',
      padding: 2,
      rotate: 0,
      size,
    });
    if (sprite) {
      const word = cloud.place(sprite);
      if (word) {
        placedWords.push(word);
      }
    }
  }

  return placedWords;
};

const WordCloudChart = ({
  data,
  width,
  height,
  svgRef,
  onDataClick,
}: WordCloudChartProps) => {
  const [words, setWords] = useState<PlacedSprite<WordCloudChartData>[]>([]);
  const [hoveredWordIndex, setHoveredWordIndex] = useState<number>();

  useEffect(() => {
    const maxWidth = width - margin.left - margin.right;
    const maxHeight = height - margin.top - margin.bottom;

    // oxlint-disable-next-line react/set-state-in-effect -- Rasterization uses a browser canvas.
    setWords(placeWords(data, maxWidth, maxHeight));
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
          {words.map((word, index) => {
            const {color, filterValue} = word.datum;
            return (
              <Group
                key={word.text}
                data-testid={`word-cloud-word-${word.text}`}
                onClick={
                  isDefined(onDataClick) && isDefined(filterValue)
                    ? () => onDataClick(filterValue)
                    : undefined
                }
                onMouseEnter={() => setHoveredWordIndex(index)}
                onMouseLeave={() => setHoveredWordIndex(undefined)}
              >
                <text
                  fill={String(color)}
                  fontFamily={word.font}
                  fontSize={`${word.size}px`}
                  fontWeight={word.weight}
                  opacity={
                    isDefined(hoveredWordIndex) && hoveredWordIndex !== index
                      ? 0.35
                      : 1
                  }
                  style={{transition: HOVER_TRANSITION}}
                  textAnchor="middle"
                  transform={`translate(${word.x},${word.y})rotate(${word.rotate})`}
                >
                  {word.text}
                </text>
              </Group>
            );
          })}
        </Group>
      </ChartWithEmptyState>
    </Svg>
  );
};

export default WordCloudChart;
