/* Copyright (C) 2024 Greenbone AG
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

import {describe, test, expect, testing} from '@gsa/testing';
import {render} from 'web/utils/testing';
import Metrics from 'web/pages/extras/cvssV4/Metrics';

describe('Metrics', () => {
  test('renders the correct number of Select components', () => {
    const metrics = {
      metric1: {
        name: 'Metric 1',
        options: {option1: 'Option 1', option2: 'Option 2'},
      },
      metric2: {
        name: 'Metric 2',
        options: {option1: 'Option 1', option2: 'Option 2'},
      },
    };
    const selectedOptions = {metric1: 'option1', metric2: 'option2'};
    const handleOptionChange = testing.fn();

    const {getAllByRole} = render(
      <Metrics
        metrics={metrics}
        selectedOptions={selectedOptions}
        handleOptionChange={handleOptionChange}
      />,
    );

    const selects = getAllByRole('combobox');
    expect(selects).toHaveLength(Object.keys(metrics).length);
  });
});
