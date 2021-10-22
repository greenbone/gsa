/* Copyright (C) 2020-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import {setLocale} from 'gmp/locale/lang';

import {entitiesLoadingActions} from 'web/store/entities/hosts';

import {
  LOG_VALUE,
  LOW_VALUE,
  MEDIUM_VALUE,
  NA_VALUE,
  HIGH_VALUE,
} from 'web/utils/severity';

import Theme from 'web/utils/theme';

import {rendererWith} from 'web/utils/testing';

import {hostsFilter} from '../processmaploader';

import useColorize from '../usecolorize';

setLocale('en');

const mockProcessMap2 = {
  edges: {
    11: {id: 11, source: 21, target: 22, type: 'edge'},
    12: {id: 12, source: 22, target: 23, type: 'edge'},
    13: {id: 13, source: 21, target: 24, type: 'edge'},
    14: {id: 14, source: 24, target: 25, type: 'edge'},
    15: {id: 15, source: 21, target: 26, type: 'edge'},
  },
  processes: {
    21: {id: 21, tagId: 31},
    22: {id: 22, tagId: 32},
    23: {id: 23, tagId: 33},
    24: {id: 24, tagId: 34},
    25: {id: 25, tagId: 35},
    26: {id: 26, tagId: 36},
  },
};

const hostFilter1 = hostsFilter('31');
const hostFilter2 = hostsFilter('32');
const hostFilter3 = hostsFilter('33');
const hostFilter4 = hostsFilter('34');
const hostFilter5 = hostsFilter('35');
const hostFilter6 = hostsFilter('36');

const hosts = [
  {name: '123.456.78.1', id: '41', severity: LOW_VALUE},
  {name: '123.456.78.2', id: '42', severity: MEDIUM_VALUE},
  {name: '123.456.78.3', id: '43', severity: HIGH_VALUE},
  {name: '123.456.78.4', id: '44', severity: LOG_VALUE},
  {name: '123.456.78.5', id: '45', severity: NA_VALUE},
];

const TestHook = ({callback}) => {
  callback();
  return null;
};

describe('UseColorize tests', () => {
  test('should color with derived severity', () => {
    const hosts1 = [hosts[1]];
    const hosts2 = [hosts[2]];
    const hosts3 = [hosts[0]];
    const hosts4 = [hosts[3]];
    const hosts5 = [hosts[4]];
    const hosts6 = [];

    const {render, store} = rendererWith({
      store: true,
    });

    const testHook = callback => {
      render(<TestHook callback={callback} />);
    };

    store.dispatch(
      entitiesLoadingActions.success(hosts1, hostFilter1, hostFilter1),
    );
    store.dispatch(
      entitiesLoadingActions.success(hosts2, hostFilter2, hostFilter2),
    );
    store.dispatch(
      entitiesLoadingActions.success(hosts3, hostFilter3, hostFilter3),
    );
    store.dispatch(
      entitiesLoadingActions.success(hosts4, hostFilter4, hostFilter5),
    );
    store.dispatch(
      entitiesLoadingActions.success(hosts5, hostFilter5, hostFilter5),
    );
    store.dispatch(
      entitiesLoadingActions.success(hosts6, hostFilter6, hostFilter6),
    );

    let coloredMap = {};
    testHook(() => (coloredMap = useColorize(mockProcessMap2, true)));

    expect(Object.entries(coloredMap).length).not.toBe(0);

    expect(coloredMap.processes[21].color).toBe(Theme.severityWarnYellow);
    expect(coloredMap.processes[22].color).toBe(Theme.errorRed);
    expect(coloredMap.processes[23].color).toBe(Theme.errorRed);
    expect(coloredMap.processes[24].color).toBe(Theme.severityWarnYellow);
    expect(coloredMap.processes[25].color).toBe(Theme.severityWarnYellow);
    expect(coloredMap.processes[26].color).toBe(Theme.severityWarnYellow);
  });

  test('should color without conditional colorization', () => {
    const hosts1 = [hosts[1]];
    const hosts2 = [hosts[2]];
    const hosts3 = [hosts[0]];
    const hosts4 = [hosts[3]];
    const hosts5 = [hosts[4]];
    const hosts6 = [];

    const {render, store} = rendererWith({
      store: true,
    });

    const testHook = callback => {
      render(<TestHook callback={callback} />);
    };

    store.dispatch(
      entitiesLoadingActions.success(hosts1, hostFilter1, hostFilter1),
    );
    store.dispatch(
      entitiesLoadingActions.success(hosts2, hostFilter2, hostFilter2),
    );
    store.dispatch(
      entitiesLoadingActions.success(hosts3, hostFilter3, hostFilter3),
    );
    store.dispatch(
      entitiesLoadingActions.success(hosts4, hostFilter4, hostFilter5),
    );
    store.dispatch(
      entitiesLoadingActions.success(hosts5, hostFilter5, hostFilter5),
    );
    store.dispatch(
      entitiesLoadingActions.success(hosts6, hostFilter6, hostFilter6),
    );

    let coloredMap = {};
    testHook(() => (coloredMap = useColorize(mockProcessMap2, false)));

    expect(Object.entries(coloredMap).length).not.toBe(0);

    expect(coloredMap.processes[21].color).toBe(Theme.severityWarnYellow);
    expect(coloredMap.processes[22].color).toBe(Theme.errorRed);
    expect(coloredMap.processes[23].color).toBe(Theme.severityLowBlue);
    expect(coloredMap.processes[24].color).toBe(Theme.lightGray);
    expect(coloredMap.processes[25].color).toBe(Theme.mediumGray);
    expect(coloredMap.processes[26].color).toBe(Theme.white);
  });

  test('should not forward log severity', () => {
    const hosts1 = [hosts[3]];
    const hosts2 = [hosts[2]];
    const hosts3 = [hosts[0]];
    const hosts4 = [hosts[1]];
    const hosts5 = [hosts[4]];
    const hosts6 = [];

    const {render, store} = rendererWith({
      store: true,
    });

    const testHook = callback => {
      render(<TestHook callback={callback} />);
    };

    store.dispatch(
      entitiesLoadingActions.success(hosts1, hostFilter1, hostFilter1),
    );
    store.dispatch(
      entitiesLoadingActions.success(hosts2, hostFilter2, hostFilter2),
    );
    store.dispatch(
      entitiesLoadingActions.success(hosts3, hostFilter3, hostFilter3),
    );
    store.dispatch(
      entitiesLoadingActions.success(hosts4, hostFilter4, hostFilter5),
    );
    store.dispatch(
      entitiesLoadingActions.success(hosts5, hostFilter5, hostFilter5),
    );
    store.dispatch(
      entitiesLoadingActions.success(hosts6, hostFilter6, hostFilter6),
    );

    let coloredMap = {};
    testHook(() => (coloredMap = useColorize(mockProcessMap2, true)));

    expect(Object.entries(coloredMap).length).not.toBe(0);

    expect(coloredMap.processes[21].color).toBe(Theme.lightGray);
    expect(coloredMap.processes[22].color).toBe(Theme.errorRed);
    expect(coloredMap.processes[23].color).toBe(Theme.errorRed);
    expect(coloredMap.processes[24].color).toBe(Theme.severityWarnYellow);
    expect(coloredMap.processes[25].color).toBe(Theme.severityWarnYellow);
    expect(coloredMap.processes[26].color).toBe(Theme.white);
  });
});
