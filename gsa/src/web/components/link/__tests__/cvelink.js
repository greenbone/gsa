/* Copyright (C) 2018 Greenbone Networks GmbH
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
