/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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

import {rendererWith} from 'web/utils/testing';

import ProtocolDocLink from '../protocoldoclink';

describe('ProtocolDocLink tests', () => {
  test('should render ProtocolDocLink', () => {
    const gmp = {
      settings: {
        protocolDocUrl: 'http://foo.bar',
      },
    };

    const {render} = rendererWith({gmp});
    const {element} = render(<ProtocolDocLink title="Foo" />);

    expect(element).toHaveAttribute('title', 'Foo');
    expect(element).toHaveAttribute('href', 'http://foo.bar');
    expect(element).toHaveAttribute('target', '_blank');
    expect(element).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

// vim: set ts=2 sw=2 tw=80:
