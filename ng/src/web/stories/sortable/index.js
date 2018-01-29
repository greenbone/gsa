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

import glamorous from 'glamorous';

import {storiesOf} from '@storybook/react';

import Grid from 'web/components/sortable/grid.js';

const Item = glamorous.span({
  flexGrow: '1',
  backgroundColor: 'blue',
  padding: '5px',
  color: 'white',
});

const getItems = (row, count) =>
  Array.from({length: count}, (v, k) => k).map(k => ({
    id: `item-${row}-${k}`,
    content: <Item>{`row ${row} item ${k}`}</Item>,
  }));

storiesOf('Sortable/Grid', module)
  .add('default', () => {
    const items = [
      [],
      getItems(1, 10),
      [],
    ];
    return (
      <Grid
        items={items}
      />
    );
  })
  .add('max 5 items per row', () => {
    const items = [
      getItems(0, 3),
      getItems(1, 5),
      [],
    ];
    return (
      <Grid
        maxItemsPerRow="5"
        items={items}
      />
    );
  });

// vim: set ts=2 sw=2 tw=80:
