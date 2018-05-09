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

import Legend, {Label, Item, Line} from 'web/components/chart/legend';

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

storiesOf('Chart/Legend', module)
  .add('default', () => {
    return (
      <Div display="flex">
        <Legend data={data}/>
      </Div>
    );
  })
  .add('line', () => {
    return (
      <Div display="flex" margin="50">
        <Legend
          data={[{
            color: 'red',
            name: 'Foo',
            toolTip: 'Foo Foo Foo',
            width: 1,
            dashes: '1, 2',
          }, {
            color: 'green',
            name: 'Bar',
            toolTip: 'Bar Bar Bar',
            width: 2,
            dashes: '3, 2',
          }]}
        >
          {({d, toolTipProps}) => (
            <Item {...toolTipProps}>
              <Line
                color={d.color}
                lineWidth={d.width}
                dashArray={d.dashes}
              />
              <Label>{d.name}</Label>
            </Item>
          )}
        </Legend>
      </Div>
    );
  });

// vim: set ts=2 sw=2 tw=80:
