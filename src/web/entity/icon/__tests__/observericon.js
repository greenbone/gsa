/* Copyright (C) 2019-2022 Greenbone Networks GmbH
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

import Task from 'gmp/models/task';

import {render} from 'web/utils/testing';

import ObserverIcon from '../observericon';

describe('Entity ObserverIcon component tests', () => {
  test('should render if the owner is not the current user', () => {
    const entity = Task.fromElement({owner: {name: 'foo'}});

    const {element} = render(<ObserverIcon entity={entity} userName={'bar'} />);

    expect(element).toBeInTheDocument();
  });

  test('should not render if the owner is the current user', () => {
    const entity = Task.fromElement({owner: {name: 'foo'}});

    const {element} = render(<ObserverIcon entity={entity} userName={'foo'} />);

    expect(element).toEqual(null);
  });
});

// vim: set ts=2 sw=2 tw=80:
