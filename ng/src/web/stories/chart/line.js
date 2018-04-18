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

import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';

import LineChart from 'web/components/chart/line';

const linedata = [{
  label: 'Foo',
  x: 1,
  y: [3, 5, 1],
  y2: [5],
}, {
  label: 'Ipsum',
  x: 2,
  y: [2, 5, 4],
  y2: [4],
}, {
  label: 'Bar',
  x: 2.4,
  y: [1, 2, 5],
  y2: [4],
}, {
  label: 'Lorem',
  x: 3,
  y: [5, 1, 7],
  y2: [7],
},
];


storiesOf('Chart/Line', module)
  .add('default', () => {
    return (
      <LineChart
        width={500}
        height={300}
        data={linedata}
        yAxisLabel="Tomatoes"
        y2AxisLabel="Apples"
        lineData={{
          y: [{
            color: 'red',
            label: 'Tomatoes',
          }, {
            color: 'yellow',
            label: 'Bananas',
          }, {
            color: 'silver',
            label: 'Pears',
            dashArray: '3,5',
          }],
          y2: [{
            color: 'green',
            label: 'Apples',
            dashArray: '3,1',
          }],
        }}
        onRangeSelected={action('range selected')}
      />
    );
  })
  .add('single', () => {
    return (
      <LineChart
        width={500}
        height={300}
        data={[{
          label: 'Lorem',
          x: 1,
          y: [5, 7],
          y2: [7],
        }]}
        lineData={{
          y: [{
            color: 'red',
            label: 'Tomatoes',
          }, {
            color: 'blue',
            label: 'Bananas',
          }],
          y2: [{
            color: 'green',
            label: 'Apples',
            dashArray: '3,1',
          }],
        }}
        yAxisLabel="Tomatoes"
        y2AxisLabel="Apples"
        onRangeSelected={action('range selected')}
      />
    );
  })
  .add('empty', () => {
    return (
      <LineChart
        width={500}
        height={300}
        data={[]}
        lineData={{
          y: [{
            color: 'red',
            label: 'Tomatoes',
          }, {
            color: 'blue',
            label: 'Bananas',
          }],
          y2: [{
            color: 'green',
            label: 'Apples',
            dashArray: '3,1',
          }],
        }}
        yAxisLabel="Tomatoes"
        y2AxisLabel="Apples"
        onRangeSelected={action('range selected')}
      />
    );
  });

// vim: set ts=2 sw=2 tw=80:
