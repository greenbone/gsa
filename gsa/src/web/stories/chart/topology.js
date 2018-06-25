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

import HostsTopologyChart from 'web/components/chart/topology';

import hosts from './hosts.json';
import links from './links.json';

const simpledata = {
  hosts: [{
    id: '192.168.123.73',
    uuid: '1',
    name: '192.168.123.73',
    severity: 8.0,
    isScanner: true,
  }, {
    id: '192.168.123.158',
    name: '192.168.123.158',
    severity: 4.0,
    isScanner: true,
  }, {
    id: '192.168.123.159',
    name: '192.168.123.159',
    severity: 4.0,
    isScanner: false,
  }],
  links: [{
    source: '192.168.123.73',
    target: '192.168.123.158',
  }, {
    source: '192.168.123.73',
    target: '192.168.123.159',
  }],
};

storiesOf('Chart/Topology', module)
  .add('default', () => (
    <HostsTopologyChart
      width={500}
      height={300}
      data={simpledata}
    />
  ))
  .add('Big Network', () => {
    return (
      <Div
        border="1px solid black"
        margin="25px"
        display="inline-flex"
      >
        <HostsTopologyChart
          width={500}
          height={300}
          data={{hosts, links}}
        />
      </Div>
    );
  });

// vim: set ts=2 sw=2 tw=80:
