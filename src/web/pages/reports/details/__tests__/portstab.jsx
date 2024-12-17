/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Filter from 'gmp/models/filter';
import {getMockReport} from 'web/pages/reports/__mocks__/mockreport';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {rendererWith} from 'web/utils/testing';

import PortsTab from '../portstab';

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

describe('Report Ports Tab tests', () => {
  test('should render Report Ports Tab', () => {
    const {ports} = getMockReport();

    const onSortChange = testing.fn();
    const onInteraction = testing.fn();

    const {render, store} = rendererWith({
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement, getAllByTestId} = render(
      <PortsTab
        counts={ports.counts}
        filter={filter}
        isUpdating={false}
        ports={ports.entities}
        sortField={'severity'}
        sortReverse={true}
        onInteraction={onInteraction}
        onSortChange={sortField => onSortChange('ports', sortField)}
      />,
    );

    const header = baseElement.querySelectorAll('th');
    const rows = baseElement.querySelectorAll('tr');
    const bars = getAllByTestId('progressbar-box');

    // Headings
    expect(header[0]).toHaveTextContent('Port');
    expect(header[1]).toHaveTextContent('Hosts');
    expect(header[2]).toHaveTextContent('Severity');

    // Row 1
    expect(rows[1]).toHaveTextContent('123/tcp1'); // Port 123/tcp, Hosts 1
    expect(bars[0]).toHaveAttribute('title', 'High');
    expect(bars[0]).toHaveTextContent('10.0 (High)');

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
