/* Copyright (C) 2019-2020 Greenbone Networks GmbH
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

import {rendererWith} from '../testing';

import useGmp from '../useGmp';

const TestUseGmp = () => {
  const gmp = useGmp();
  return <span>{gmp.foo()}</span>;
};

describe('useGmp tests', () => {
  test('should return the current gmp object', () => {
    const foo = jest.fn().mockReturnValue('foo');
    const gmp = {foo};

    const {render} = rendererWith({gmp});

    const {element} = render(<TestUseGmp />);

    expect(foo).toHaveBeenCalled();
    expect(element).toHaveTextContent(/^foo$/);
  });
});
