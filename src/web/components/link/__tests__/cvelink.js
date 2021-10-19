/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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

import {fireEvent, rendererWith} from 'web/utils/testing';

import CveLink from '../cvelink';

describe('CveLink tests', () => {
  test('should render CveLink', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    const {element} = render(<CveLink title="Foo" id="foo" />);

    expect(element).toHaveTextContent('foo');
    expect(element).toHaveAttribute('title', 'Foo');
    expect(element).toHaveAttribute('href', '/cve/foo');
  });

  test('should not override type', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    const {element} = render(<CveLink title="Foo" type="bar" id="foo" />);

    expect(element).toHaveTextContent('foo');
    expect(element).toHaveAttribute('title', 'Foo');
    expect(element).toHaveAttribute('href', '/cve/foo');
  });

  test('should route to details', () => {
    const {render, history} = rendererWith({capabilities: true, router: true});
    const {element} = render(<CveLink title="Foo" id="foo" />);

    expect(history.location.pathname).toEqual('/');

    fireEvent.click(element);

    expect(history.location.pathname).toEqual('/cve/foo');
  });

  test('should not route to details in text mode', () => {
    const {render, history} = rendererWith({capabilities: true, router: true});
    const {element} = render(<CveLink title="Foo" id="foo" textOnly={true} />);

    expect(history.location.pathname).toEqual('/');

    fireEvent.click(element);

    expect(history.location.pathname).toEqual('/');
  });
});

// vim: set ts=2 sw=2 tw=80:
