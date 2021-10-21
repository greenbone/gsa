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

import Capabilities from 'gmp/capabilities/capabilities';

import {rendererWith} from '../testing';

import useCapabilities from '../useCapabilities';

const TestUseCapabilities = () => {
  const capabilities = useCapabilities();
  if (capabilities.mayCreate('task')) {
    return <span>May create a task</span>;
  }
  return <span>Not allowed to create a task</span>;
};

describe('useCapabilties tests', () => {
  test('should be allowed to create a task', () => {
    const capabilities = new Capabilities(['create_task']);
    const {render} = rendererWith({capabilities});

    const {element} = render(<TestUseCapabilities />);

    expect(element).toHaveTextContent(/^May create a task$/);
  });

  test('should not be allowed to create a task', () => {
    const capabilities = new Capabilities();
    const {render} = rendererWith({capabilities});

    const {element} = render(<TestUseCapabilities />);

    expect(element).toHaveTextContent(/^Not allowed to create a task$/);
  });
});
