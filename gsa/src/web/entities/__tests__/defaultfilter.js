/* Copyright (C) 2019 Greenbone Networks GmbH
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

import Filter from 'gmp/models/filter';

import {rendererWith, waitForElement} from 'web/utils/testing';

import DefaultFilter from '../defaultfilter';

describe('DefaultFilter component tests', () => {
  test('should load default filter', async () => {
    const entityType = 'task';
    const filter = Filter.fromString('foo=bar');
    const getSetting = jest.fn().mockResolvedValue({data: {value: 'f1'}});
    const getFilter = jest.fn().mockResolvedValue({data: filter});
    const subscribe = jest.fn();
    const gmp = {
      user: {
        getSetting,
      },
      filter: {
        get: getFilter,
      },
    };
    const {render, store} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    store.subscribe(subscribe);

    const childElement = <div />;
    const renderFunc = jest.fn().mockReturnValue(childElement);

    render(<DefaultFilter entityType={entityType}>{renderFunc}</DefaultFilter>);

    await waitForElement(() => childElement);

    expect(subscribe).toHaveBeenCalledTimes(2);

    expect(getSetting).toHaveBeenCalled();
    expect(getFilter).toHaveBeenCalledWith({id: 'f1'});

    expect(renderFunc).toHaveBeenCalledWith({filter});
  });

  test('should use query filter', async () => {
    const entityType = 'task';
    const filter1 = Filter.fromString('foo=bar');
    const filter2 = Filter.fromString('bar=foo');
    const getSetting = jest.fn().mockResolvedValue({data: {value: 'f1'}});
    const getFilter = jest.fn().mockResolvedValue({data: filter1});
    const subscribe = jest.fn();
    const gmp = {
      user: {
        getSetting,
      },
      filter: {
        get: getFilter,
      },
    };
    const {render, history, store} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    const query = {filter: filter2.toFilterString()};

    history.push({pathname: history.location.pathname, query});

    store.subscribe(subscribe);

    const childElement = <div />;
    const renderFunc = jest.fn().mockReturnValue(childElement);

    render(<DefaultFilter entityType={entityType}>{renderFunc}</DefaultFilter>);

    await waitForElement(() => childElement);

    expect(subscribe).not.toHaveBeenCalled();

    expect(getSetting).not.toHaveBeenCalled();
    expect(getFilter).not.toHaveBeenCalled();

    expect(renderFunc).toHaveBeenCalledWith({filter: filter2});
  });
});
