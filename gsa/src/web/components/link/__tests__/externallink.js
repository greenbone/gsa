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

import {setLocale} from 'gmp/locale/lang';

import {
  fireEvent,
  getByRole,
  getByText,
  queryByRole,
  rendererWith,
} from 'web/utils/testing';

import ExternalLink from '../externallink';

setLocale('en');

describe('ExternalLink tests', () => {
  test('should render ExternalLink', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    const {element} = render(
      <ExternalLink title="Foo" to="http://foo.bar">
        Bar
      </ExternalLink>,
    );

    expect(element).toHaveTextContent('Bar');
    expect(element).toHaveAttribute('title', 'Foo');
    expect(element).toHaveAttribute('href', 'http://foo.bar');
  });

  test('should open confirmation dialog', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    const {element, baseElement} = render(
      <ExternalLink title="Foo" to="http://foo.bar">
        Bar
      </ExternalLink>,
    );

    expect(queryByRole(baseElement, 'dialog')).toBeNull();

    fireEvent.click(element);

    const dialog = queryByRole(baseElement, 'dialog');

    expect(dialog).toBeTruthy();
  });

  test('should open url in new window', () => {
    const oldOpen = window.open;

    window.open = jest.fn();

    const {render} = rendererWith({capabilities: true, router: true});
    const {element, baseElement} = render(
      <ExternalLink title="Foo" to="http://foo.bar">
        Bar
      </ExternalLink>,
    );

    fireEvent.click(element);

    const dialog = getByRole(baseElement, 'dialog');

    fireEvent.click(getByText(dialog, 'Follow Link'));

    expect(window.open).toBeCalledWith(
      'http://foo.bar',
      '_blank',
      'noopener, scrollbars=1, resizable=1',
    );

    window.open = oldOpen;
  });
});

// vim: set ts=2 sw=2 tw=80:
