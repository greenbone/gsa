/* Copyright (C) 2020 Greenbone Networks GmbH
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

import React, {useReducer} from 'react';
import stateReducer from 'web/utils/stateReducer';
import {render, screen, fireEvent} from 'web/utils/testing';

const TestComponent = () => {
  const [state, dispatch] = useReducer(stateReducer, {foo: ''});

  const handleSetFoo = () => dispatch({foo: 'bar'});
  const handleSetLorem = () => dispatch({lorem: 'ipsum'});
  const handleSetUndef = () => dispatch();

  const {foo, lorem, undef} = state;

  return (
    <div>
      <button data-testid="set-foo" onClick={handleSetFoo} />
      <button data-testid="set-lorem" onClick={handleSetLorem} />
      <button data-testid="set-undef" onClick={handleSetUndef} />
      <span data-testid="foo">{foo}</span>
      <span data-testid="lorem">{lorem}</span>
      <span data-testid="undef">{undef}</span>
    </div>
  );
};

describe('stateReducer tests', () => {
  test('Should set correct states', async () => {
    render(<TestComponent />);

    const foo = await screen.findByTestId('foo');
    const lorem = await screen.findByTestId('lorem');
    const undef = await screen.findByTestId('undef');

    expect(foo).toHaveTextContent('');
    expect(lorem).toHaveTextContent('');
    expect(undef).toHaveTextContent('');

    const setFoo = await screen.findByTestId('set-foo');
    fireEvent.click(setFoo);

    expect(foo).toHaveTextContent('bar');
    expect(lorem).toHaveTextContent('');
    expect(undef).toHaveTextContent('');

    const setLorem = await screen.findByTestId('set-lorem');
    fireEvent.click(setLorem);

    expect(foo).toHaveTextContent('bar');
    expect(lorem).toHaveTextContent('ipsum');
    expect(undef).toHaveTextContent('');

    const setUndef = await screen.findByTestId('set-undef');
    fireEvent.click(setUndef);

    // Should do nothing
    expect(foo).toHaveTextContent('bar');
    expect(lorem).toHaveTextContent('ipsum');
    expect(undef).toHaveTextContent('');
  });
});
