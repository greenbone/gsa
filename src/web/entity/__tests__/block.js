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
import React from 'react';

import {render} from 'web/utils/testing';

import DetailsBlock from '../block';

describe('Entity Block component tests', () => {
  test('should render', () => {
    const {element} = render(
      <DetailsBlock id="123" title="title">
        <div>child</div>
      </DetailsBlock>,
    );
    const title = element.querySelectorAll('h2');
    const divs = element.querySelectorAll('div');

    expect(title.length).toEqual(1);
    expect(divs.length).toEqual(2);
    expect(element).toHaveTextContent('title');
    expect(element).toHaveTextContent('child');
  });
});

// vim: set ts=2 sw=2 tw=80:
