/* Copyright (C) 2019 Greenbone Networks GmbH
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
import {act} from 'react-dom/test-utils';

import {render, fireEvent} from 'web/utils/testing';

import CloneIcon from '../cloneicon';

const entity = {name: 'entity'};

describe('SVG icon component tests', () => {
  test('should render icon', () => {
    const handleClick = jest.fn();

    const {element} = render(
      <CloneIcon
        title="Clone Entity"
        value={entity}
        active={true}
        onClick={handleClick}
      />,
    );

    expect(element).toMatchSnapshot();
  });

  test('should render loading state', async () => {
    let res;
    const promise = new Promise((resolve, reject) => {
      res = resolve;
    });

    const handleClick = jest.fn().mockReturnValue(promise);

    const {element} = render(
      <CloneIcon
        title="Clone Entity"
        value={entity}
        active={true}
        onClick={handleClick}
      />,
    );

    expect(element).toHaveAttribute('title', 'Clone Entity');
    fireEvent.click(element);
    expect(handleClick).toHaveBeenCalledWith(entity);
    expect(element).toHaveAttribute('title', 'Loading...');

    await act(async () => {
      res();
    });

    expect(element).toHaveAttribute('title', 'Clone Entity');
  });
});
