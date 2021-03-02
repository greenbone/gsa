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

import GmpSettings from 'gmp/gmpsettings';

import {rendererWith, screen} from '../testing';

import useGmpSettings from '../useGmpSettings';

const TestComponent = () => {
  const settings = useGmpSettings();
  return <span data-testid="setting">{settings.logLevel}</span>;
};

describe('useGmpSettings tests', () => {
  test('should return the current gmp settings object', () => {
    const gmp = {settings: new GmpSettings()};

    const {render} = rendererWith({gmp});

    render(<TestComponent />);

    expect(screen.getByTestId('setting')).toHaveTextContent('warn');
  });
});
