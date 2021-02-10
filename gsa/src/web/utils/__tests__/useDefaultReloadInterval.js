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
/* eslint-disable react/prop-types */

import React from 'react';

import {
  DEFAULT_RELOAD_INTERVAL_INACTIVE,
  DEFAULT_RELOAD_INTERVAL,
} from 'gmp/gmpsettings';

import {rendererWith, screen} from 'web/utils/testing';

import useDefaultReloadInterval from '../useDefaultReloadInterval';

const gmp = {
  settings: {
    reloadIntervalInactive: DEFAULT_RELOAD_INTERVAL_INACTIVE,
    reloadInterval: DEFAULT_RELOAD_INTERVAL,
  },
};

const TestComponent = ({isVisible}) => {
  const timeoutFunc = useDefaultReloadInterval();

  return <span data-testid="reload-interval">{timeoutFunc({isVisible})}</span>;
};

describe('useDefaultReloadInterval tests', () => {
  test('Should return inactive interval when the page is invisible', () => {
    const {render} = rendererWith({gmp});
    render(<TestComponent isVisible={false} />);

    const reloadInterval = screen.getByTestId('reload-interval');

    expect(reloadInterval).toHaveTextContent(DEFAULT_RELOAD_INTERVAL_INACTIVE);
  });

  test('Should return default interval when the page is visible', () => {
    const {render} = rendererWith({gmp});
    render(<TestComponent isVisible={true} />);

    const reloadInterval = screen.getByTestId('reload-interval');

    expect(reloadInterval).toHaveTextContent(DEFAULT_RELOAD_INTERVAL);
  });
});
