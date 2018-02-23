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

import {Div} from 'glamorous';

import {storiesOf} from '@storybook/react';

import Legend from 'web/components/chart/legend';
import BarChart from 'web/components/chart/bar';
import DonutChart from 'web/components/chart/donut';
import Donut3DChart from 'web/components/chart/donut3d';

const data = [
{
  label: 'G',
  value: 1,
  color: 'silver',
  toolTip: 'Foo',
}, {
  label: 'Foo',
  value: 40,
  color: 'blue',
  toolTip: 'Foo',
}, {
  label: 'Bar',
  value: 10,
  color: 'green',
  toolTip: 'Bar',
}, {
  label: 'Lol',
  value: 5,
  color: 'red',
  toolTip: 'LOL',
},
{
  label: 'F',
  value: 1,
  color: 'yellow',
  toolTip: 'Foo',
},
];

const bardata = [{
  label: 'Foo',
  x: 3,
  y: 3,
  toolTip: <Div color="red">Foo</Div>,
  color: 'red',
}, {
  label: 'Bar',
  x: 10,
  y: 1,
  toolTip: <Div color="Green" margin="5px">Bar</Div>,
  color: 'green',
}];

storiesOf('Chart/Legend', module)
  .add('default', () => {
    return (
      <Div width="400px">
        <Legend data={data}/>
      </Div>
    );
  });

storiesOf('Chart/Bar', module)
  .add('default', () => {
    return (
      <BarChart
        width={500}
        height={300}
        data={bardata}
      />
    );
  });

storiesOf('Chart/Donut', module)
  .add('default', () => {
    return (
      <DonutChart
        width={500}
        height={300}
        data={data}
      />
    );
  });

// vim: set ts=2 sw=2 tw=80:
