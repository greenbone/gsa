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

import Model from 'gmp/model';

import Date, {setLocale} from 'gmp/models/date';

import {setTimezone} from 'web/store/usersettings/actions';

import {rendererWith} from 'web/utils/testing';

import EntityInfo from '../info';

setLocale('en');

const date = Date('2019-01-01T12:00:00Z');
const date2 = Date('2019-02-02T12:00:00Z');

describe('EntityInfo component tests', () => {
  test('should render with existing owner', () => {
    const entity = Model.fromElement({
      _id: '123',
      owner: {
        name: 'owner',
      },
      creation_time: date,
      modification_time: date2,
    });

    const {render, store} = rendererWith({store: true});

    store.dispatch(setTimezone('UTC'));

    const {element} = render(<EntityInfo entity={entity} />);

    const divs = element.querySelectorAll('div');
    const span = element.querySelectorAll('span');

    expect(divs.length).toEqual(7);
    expect(span.length).toEqual(1);
    expect(element).toHaveTextContent('ID:123');
    expect(element).toHaveTextContent('Created:Tue, Jan 1, 2019 12:00 PM UTC');
    expect(element).toHaveTextContent('Modified:Sat, Feb 2, 2019 12:00 PM UTC');
    expect(element).toHaveTextContent('Owner:owner');
  });

  test('should render without specific owner', () => {
    const entity = Model.fromElement({
      _id: '123',
      creation_time: date,
      modification_time: date2,
    });

    const {render, store} = rendererWith({store: true});

    store.dispatch(setTimezone('UTC'));

    const {element} = render(<EntityInfo entity={entity} />);

    const divs = element.querySelectorAll('div');
    const span = element.querySelectorAll('span');
    const italic = element.querySelectorAll('i');

    expect(divs.length).toEqual(7);
    expect(span.length).toEqual(0);
    expect(italic.length).toEqual(1);
    expect(element).toHaveTextContent('ID:123');
    expect(element).toHaveTextContent('Created:Tue, Jan 1, 2019 12:00 PM UTC');
    expect(element).toHaveTextContent('Modified:Sat, Feb 2, 2019 12:00 PM UTC');
    expect(element).toHaveTextContent('Owner:(Global Object)');
  });
});

// vim: set ts=2 sw=2 tw=80:
