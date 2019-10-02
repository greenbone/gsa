/* Copyright (C) 2019 Greenbone Networks GmbH
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
      policy_type: OPENVAS_SCAN_CONFIG_TYPE,
      tasks: {
        task: [{id: '1234', name: 'audit1'}, {id: '5678', name: 'audit2'}],
      },
    });
    const caps = new Capabilities(['everything']);

    const {render} = rendererWith({capabilities: caps, router: true});

    const {element, getAllByTestId} = render(<Details entity={policy} />);

    expect(element).toMatchSnapshot();
    expect(element).toHaveTextContent('bar');
    expect(element).toHaveTextContent('audit1');
    expect(element).toHaveTextContent('audit2');
    expect(element).not.toHaveTextContent('scanner');

    const detailslinks = getAllByTestId('details-link');

    expect(detailslinks[0]).toHaveAttribute('href', '/audit/1234');
    expect(detailslinks[1]).toHaveAttribute('href', '/audit/5678');
  });
});
