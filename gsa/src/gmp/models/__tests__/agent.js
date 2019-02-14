/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

/* eslint-disable max-len */

import Agent from '../agent';
import {parseDate} from 'gmp/parser';
import {testModel} from 'gmp/models/testing';

testModel(Agent, 'agent');

describe('Agent Model tests', () => {
  test('should parse time and status of trust', () => {
    const elem = {
      installer: {
        trust: {
          __text: 'status',
          time: '2018-10-10T11:41:23.022Z',
        },
      },
    };
    const agent = new Agent(elem);

    expect(agent.installer).toBeUndefined();
    expect(agent.trust.time).toEqual(parseDate('2018-10-10T11:41:23.022Z'));
    expect(agent.trust.status).toEqual('status');
  });

  test('should return undefined for trust if installer or trust are undefined', () => {
    const agent = new Agent({});

    expect(agent.trust).toBeUndefined();
  });
});

// vim: set ts=2 sw=2 tw=80:
