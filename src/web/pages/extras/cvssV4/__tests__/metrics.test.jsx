/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Metrics from 'web/pages/extras/cvssV4/Metrics';
import {render} from 'web/utils/testing';

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

    const {getAllByTestId} = render(
      <Metrics
        handleOptionChange={handleOptionChange}
        metrics={metrics}
        selectedOptions={selectedOptions}
      />,
    );

    const selects = getAllByTestId('form-select');
    expect(selects).toHaveLength(Object.keys(metrics).length);
  });
});
