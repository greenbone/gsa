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

import Policy from 'gmp/models/policy';
import {OPENVAS_SCAN_CONFIG_TYPE} from 'gmp/models/scanconfig';

import {rendererWith} from 'web/utils/testing';

import Details from '../details';

describe('Policy Details tests', () => {
  test('should render full Details', () => {
    const policy = Policy.fromElement({
      name: 'foo',
      comment: 'bar',
      scanner: {name: 'scanner', type: '42'},
      type: OPENVAS_SCAN_CONFIG_TYPE,
      tasks: {
        task: [
          {id: '1234', name: 'audit1'},
          {id: '5678', name: 'audit2'},
        ],
      },
    });
    const caps = new Capabilities(['everything']);

    const {render} = rendererWith({capabilities: caps, router: true});

    const {element, getAllByTestId} = render(<Details entity={policy} />);

    expect(element).toMatchSnapshot();
    expect(element).toHaveTextContent('bar');

    const detailslinks = getAllByTestId('details-link');

    expect(element).toHaveTextContent('audit1');
    expect(detailslinks[0]).toHaveAttribute('href', '/audit/1234');

    expect(element).toHaveTextContent('audit2');
    expect(detailslinks[1]).toHaveAttribute('href', '/audit/5678');

    expect(element).not.toHaveTextContent('scanner');
  });
});
