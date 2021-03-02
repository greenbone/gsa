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

import React, {useState} from 'react';

import {rendererWith, screen, fireEvent} from '../testing';

import usePrevious from '../usePrevious';

const TestUsePrevious = () => {
  const [value, setValue] = useState('foo');
  const previous = usePrevious(value);
  return (
    <div>
      <span data-testid="prev">{previous}</span>
      <span data-testid="current">{value}</span>
      <button onClick={() => setValue('bar')} />
    </div>
  );
};

describe('usePrevious hook tests', () => {
  test('should return the value from previous rendering', () => {
    const {render} = rendererWith();

    render(<TestUsePrevious value={'foo'} />);

    expect(screen.getByTestId('current')).toHaveTextContent(/^foo$/);
    expect(screen.getByTestId('prev')).toHaveTextContent(/^foo$/);

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByTestId('current')).toHaveTextContent(/^bar$/);
    expect(screen.getByTestId('prev')).toHaveTextContent(/^foo$/);
  });
});
