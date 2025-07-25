/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith} from 'web/testing';
import Filter from 'gmp/models/filter';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {getMockReport} from 'web/pages/reports/__mocks__/MockReport';
import PortsTab from 'web/pages/reports/details/PortsTab';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);
const gmp = {
  settings: {
    severityRating: SEVERITY_RATING_CVSS_3,
  },
};

describe('Report Ports Tab tests', () => {
  test('should render Report Ports Tab', () => {
    const {ports} = getMockReport();

    const onSortChange = testing.fn();

    const {render, store} = rendererWith({
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(
      <PortsTab
        counts={ports.counts}
        filter={filter}
        isUpdating={false}
        ports={ports.entities}
        sortField={'severity'}
        sortReverse={true}
        onSortChange={sortField => onSortChange('ports', sortField)}
      />,
    );

    const header = baseElement.querySelectorAll('th');
    const rows = baseElement.querySelectorAll('tr');
    const bars = screen.getAllByTestId('progressbar-box');

    // Headings
    expect(header[0]).toHaveTextContent('Port');
    expect(header[1]).toHaveTextContent('Hosts');
    expect(header[2]).toHaveTextContent('Severity');

    // Row 1
    expect(rows[1]).toHaveTextContent('123/tcp1'); // Port 123/tcp, Hosts 1
    expect(bars[0]).toHaveAttribute('title', 'Critical');
    expect(bars[0]).toHaveTextContent('10.0 (Critical)');

    // Row 2
    expect(rows[2]).toHaveTextContent('456/tcp1'); // Port 456/tcp, Hosts 1
    expect(bars[1]).toHaveAttribute('title', 'Medium');
    expect(bars[1]).toHaveTextContent('5.0 (Medium)');

    // Filter
    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity)',
    );
  });
});
