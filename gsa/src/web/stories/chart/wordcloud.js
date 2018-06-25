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

import {scaleOrdinal, schemeCategory20c} from 'd3-scale';

import {storiesOf} from '@storybook/react';

import WordCloudChart from 'web/components/chart/wordcloud';

const random = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

const scale10 = scaleOrdinal(schemeCategory20c);

const data = [{
  value: 1,
  label: 'Ipsum',
}, {
  value: 1,
  label: 'Lorem',
}, {
  value: 100,
  label: 'Foo',
}, {
  value: 1,
  label: 'Bar',
}, {
  value: 1,
  label: 'B',
}, {
  value: 1,
  label: 'A',
}, {
  value: 3,
  label: 'C',
}];

storiesOf('Chart/WordCloud', module)
  .add('default', () => {
    return (
      <WordCloudChart
        width={500}
        height={300}
        data={data.map(val => ({
          ...val,
          color: scale10(val.label),
        }))}
      />
    );
  })
  .add('1000 random words', () => {
    const words = [];
    for (let i = 1; i <= 100; i++) {
      const value = random(1, 1000);
      words.push({
        value,
        label: 'A' + i,
        color: scale10(value),
      });
    }
    return (
      <WordCloudChart
        width={500}
        height={300}
        data={words}
      />
    );
  });

// vim: set ts=2 sw=2 tw=80:
