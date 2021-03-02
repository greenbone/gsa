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
import React, {useState} from 'react';

import useInstanceVariable from '../useInstanceVariable';
import {rendererWith, screen, fireEvent} from '../testing';

const TestComponent = () => {
  const [, setValue] = useState(0);
  const test = useInstanceVariable({});

  return (
    <div>
      <button
        data-testid="change"
        onClick={() => {
          test.value = 'bar';
        }}
      />
      <button
        data-testid="force-update"
        onClick={() => setValue(val => val + 1)}
      />
      <div data-testid="value">{test.value}</div>
    </div>
  );
};

describe('useInstanceVariable tests', () => {
  test('should not rerender if changed', () => {
    const {render} = rendererWith();

    render(<TestComponent />);

    expect(screen.getByTestId('value')).not.toHaveTextContent();

    fireEvent.click(screen.getByTestId('change'));

    expect(screen.getByTestId('value')).not.toHaveTextContent();
  });

  test('should display new value after rerender', () => {
    const {render} = rendererWith();

    render(<TestComponent />);

    expect(screen.getByTestId('value')).not.toHaveTextContent();

    fireEvent.click(screen.getByTestId('change'));

    expect(screen.getByTestId('value')).not.toHaveTextContent();

    fireEvent.click(screen.getByTestId('force-update'));

    expect(screen.getByTestId('value')).toHaveTextContent('bar');
  });
});
