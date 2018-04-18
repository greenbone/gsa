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

import BarChart from 'web/components/chart/bar';

const bardata = [{
  label: 'Foo',
  x: 'foo',
  y: 3,
  toolTip: <Div color="red">Foo</Div>,
  color: 'red',
}, {
  label: 'Bar',
  x: 'bar',
  y: 1,
  toolTip: <Div color="Green" margin="5px">Bar</Div>,
  color: 'green',
}, {
  label: 'Lorem',
  x: 'Lorem ipsum dolor sit amet',
  y: 5,
  toolTip: <Div color="blue" margin="5px">Lorem Ipsum</Div>,
  color: 'blue',
},
];

storiesOf('Chart/Bar', module)
  .add('default', () => {
    return (
      <BarChart
        width={500}
        height={300}
        data={bardata}
        xLabel="product"
        yLabel="kg"
      />
    );
  })
  .add('horizontal', () => {
    return (
      <BarChart
        horizontal
        width={500}
        height={300}
        data={bardata}
        xLabel="product"
        yLabel="kg"
      />
    );
  });

// vim: set ts=2 sw=2 tw=80:
