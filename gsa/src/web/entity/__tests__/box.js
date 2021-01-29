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
import React from 'react';

import Date, {setLocale} from 'gmp/models/date';

import {render} from 'web/utils/testing';

import EntityBox from '../box';

setLocale('en');

const date = Date('2019-01-01T12:00:00Z');
const date2 = Date('2019-02-02T12:00:00Z');

describe('EntityBox component tests', () => {
  test('should render', () => {
    const {element} = render(
      <EntityBox
        end={date}
        modified={date2}
        text="foo"
        title="bar"
        toolbox={<div>tool</div>}
      >
        <div>child</div>
      </EntityBox>,
    );
    const title = element.querySelectorAll('h3');
    const divs = element.querySelectorAll('div');
    const table = element.querySelectorAll('table');
    const rows = element.querySelectorAll('tr');
    const pres = element.querySelectorAll('pre');

    expect(title.length).toEqual(1);
    expect(divs.length).toEqual(7);
    expect(table.length).toEqual(1);
    expect(rows.length).toEqual(2);
    expect(pres.length).toEqual(1);

    expect(element).toHaveTextContent('bar');
    expect(element).toHaveTextContent('tool');
    expect(element).toHaveTextContent('foo');
    expect(element).toHaveTextContent('child');
    expect(element).toHaveTextContent('Active untilTue, Jan 1, 2019');
    expect(element).toHaveTextContent('ModifiedSat, Feb 2, 2019');
    expect(element).toHaveStyleRule('width', '400px');
  });
});

// vim: set ts=2 sw=2 tw=80:
