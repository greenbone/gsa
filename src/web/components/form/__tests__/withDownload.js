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

import {render, fireEvent} from 'web/utils/testing';

import withDownload from '../withDownload';

const TestComponent = withDownload(({onDownload, filename, data}) => (
  <button data-testid="button" onClick={() => onDownload({filename, data})} />
));

const createObjectURL = jest.fn().mockReturnValue('foo://bar');
window.URL.createObjectURL = createObjectURL;
window.URL.revokeObjectURL = jest.fn();

describe('withDownload tests', () => {
  test('should render', () => {
    const {rerender, getByTestId} = render(
      <TestComponent filename="foo" data="bar" />,
    );

    // rerender to set reference to Download component
    rerender(<TestComponent filename="foo" data="bar" />);

    const button = getByTestId('button');
    fireEvent.click(button);

    expect(createObjectURL).toHaveBeenCalled();
  });
});
