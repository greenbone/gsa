/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import Capabilities from 'gmp/capabilities/capabilities';

import ScanConfig, {
  OPENVAS_SCAN_CONFIG_TYPE,
  OSP_SCAN_CONFIG_TYPE,
} from 'gmp/models/scanconfig';

import {OPENVAS_SCANNER_TYPE, OSP_SCANNER_TYPE} from 'gmp/models/scanner';

import {rendererWith} from 'web/utils/testing';

import Details from '../details';

describe('Scan Config Details tests', () => {
  test('should render full Details', () => {
    const config = ScanConfig.fromElement({
      name: 'foo',
      comment: 'bar',
      scanner: {name: 'scanner1', id: '42', type: OPENVAS_SCANNER_TYPE},
      type: OPENVAS_SCAN_CONFIG_TYPE,
      tasks: {
        task: [
          {id: '1234', name: 'task1'},
          {id: '5678', name: 'task2'},
        ],
      },
    });
    const caps = new Capabilities(['everything']);

    const {render} = rendererWith({capabilities: caps, router: true});

    const {element, getAllByTestId} = render(<Details entity={config} />);

    expect(element).toMatchSnapshot();
    expect(element).toHaveTextContent('bar');

    const detailslinks = getAllByTestId('details-link');

    expect(element).toHaveTextContent('task1');
    expect(detailslinks[0]).toHaveAttribute('href', '/task/1234');

    expect(element).toHaveTextContent('task2');
    expect(detailslinks[1]).toHaveAttribute('href', '/task/5678');

    expect(element).not.toHaveTextContent('scanner');
  });

  test('should render details for osp config', () => {
    const config = ScanConfig.fromElement({
      name: 'foo',
      comment: 'bar',
      scanner: {_id: '42', name: 'scanner1', type: OSP_SCANNER_TYPE},
      type: OSP_SCAN_CONFIG_TYPE,
      tasks: {
        task: [
          {id: '1234', name: 'task1'},
          {id: '5678', name: 'task2'},
        ],
      },
    });
    const caps = new Capabilities(['everything']);

    const {render} = rendererWith({capabilities: caps, router: true});

    const {element, getAllByTestId} = render(<Details entity={config} />);

    expect(element).toHaveTextContent('bar');

    const detailslinks = getAllByTestId('details-link');

    expect(element).toHaveTextContent('task1');
    expect(detailslinks[1]).toHaveAttribute('href', '/task/1234');

    expect(element).toHaveTextContent('task2');
    expect(detailslinks[2]).toHaveAttribute('href', '/task/5678');

    expect(element).toHaveTextContent('Scanner');
    expect(detailslinks[0]).toHaveAttribute('href', '/scanner/42');
    // TODO test if scanner name is displayed correctly
  });
});
