/* Copyright (C) 2020-2022 Greenbone AG
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
import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent, screen} from 'web/utils/testing';

import DialogError from '../error';

describe('Dialog error tests', () => {
  test('should render with defined error', () => {
    const {element} = render(
      <DialogError error="foo" onCloseClick={() => {}} />,
    );

    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('foo');
  });

  test('should not render with undefined error', () => {
    const {element} = render(<DialogError onCloseClick={() => {}} />);

    expect(element).toBe(null);
  });

  test('should call close handler', () => {
    const handler = testing.fn();

    const {element} = render(
      <DialogError error="foo" onCloseClick={handler} />,
    );

    const button = screen.getByTitle('Close');

    expect(element).toHaveTextContent('foo');

    fireEvent.click(button);
    expect(handler).toHaveBeenCalled();
  });
});

// vim: set ts=2 sw=2 tw=80:
