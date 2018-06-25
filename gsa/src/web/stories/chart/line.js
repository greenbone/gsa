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

import {longDate} from 'gmp/locale/date';

import date from 'gmp/models/date';

import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';

import LineChart from 'web/components/chart/line';

const linedata = [{
  label: 'Foo',
  x: 1,
  y: 3,
  y2: 5,
}, {
  label: 'Ipsum',
  x: 2,
  y: 2,
  y2: 4,
}, {
  label: 'Bar',
  x: 2.4,
  y: 1,
  y2: 4,
}, {
  label: 'Lorem',
  x: 3,
  y: 5,
  y2: 7,
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
        yLine={{
          color: 'red',
          label: 'Tomatoes',
        }}
        y2Line={{
          color: 'green',
          label: 'Apples',
          dashArray: '3,1',
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
          y: 5,
          y2: 7,
        }]}
        yLine={{
          color: 'red',
          label: 'Tomatoes',
        }}
        y2Line={{
          color: 'green',
          label: 'Apples',
          dashArray: '3,1',
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
        yLine={{
          color: 'red',
          label: 'Tomatoes',
        }}
        y2Line={{
          color: 'green',
          label: 'Apples',
          dashArray: '3,1',
        }}
        yAxisLabel="Tomatoes"
        y2AxisLabel="Apples"
        onRangeSelected={action('range selected')}
      />
    );
  })
  .add('timeline', () => {
    const start = date().subtract(2, 'year');
    const dates = [
      start,
      start.clone().add(1, 'year'),
      start.clone().add(2, 'year'),
    ];
    return (
      <LineChart
        width={500}
        height={300}
        timeline
        data={[{
          label: `Ipsum: ${longDate(dates[0])}`,
          x: dates[0],
          y: 5,
          y2: 7,
        }, {
          label: `Ipsum: ${longDate(dates[1])}`,
          x: dates[1],
          y: 7,
          y2: 3,
        }, {
          label: `Foo: ${longDate(dates[2])}`,
          x: dates[2],
          y: 3,
          y2: 5,
        },
      ]}
        yLine={{
          color: 'red',
          label: 'Tomatoes',
        }}
        y2Line={{
          color: 'green',
          label: 'Apples',
          dashArray: '3,1',
        }}
        yAxisLabel="Tomatoes"
        y2AxisLabel="Apples"
        onRangeSelected={action('range selected')}
      />
    );
  });

// vim: set ts=2 sw=2 tw=80:
