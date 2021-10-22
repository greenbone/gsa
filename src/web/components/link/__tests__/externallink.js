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

  test('should close confirmation dialog on resume click', () => {
    const oldOpen = window.open;

    window.open = jest.fn();

    const {render} = rendererWith({capabilities: true, router: true});
    const {element, baseElement, getByTestId} = render(
      <ExternalLink title="Foo" to="http://foo.bar">
        Bar
      </ExternalLink>,
    );

    expect(queryByRole(baseElement, 'dialog')).toBeNull();

    fireEvent.click(element);

    const dialog = queryByRole(baseElement, 'dialog');

    expect(dialog).toBeTruthy();

    const resumeButton = getByTestId('dialog-save-button');

    fireEvent.click(resumeButton);

    const closedDialog = queryByRole(baseElement, 'dialog');

    expect(closedDialog).toBeFalsy();

    window.open = oldOpen;
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
