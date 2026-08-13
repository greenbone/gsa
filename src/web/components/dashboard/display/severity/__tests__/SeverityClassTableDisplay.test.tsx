/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {render, screen} from 'web/testing';
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/SeverityClassTableDisplay';

const createProps = (overrides = {}) => ({
  data: {
    groups: [
      {value: '0.1', count: 2},
      {value: '7.5', count: 3},
    ],
  },
  dataTitles: ['Severity', 'Count'],
  height: 100,
  icons: () => null,
  id: 'severity-table-display',
  initialState: {},
  onSelectFilterClick: () => {},
  setState: () => ({}),
  showCsvDownload: false,
  showFilterSelection: false,
  showFilterString: false,
  showSvgDownload: false,
  showToggleLegend: false,
  state: {},
  title: () => 'Severity',
  width: 200,
  ...overrides,
});

describe('SeverityClassTableDisplay', () => {
  test('should render transformed severity classes as table rows', () => {
    render(<SeverityClassTableDisplay {...createProps()} />);

    expect(screen.getByRole('columnheader', {name: 'Severity'})).toBeVisible();
    expect(screen.getByRole('columnheader', {name: 'Count'})).toBeVisible();
    expect(screen.getByRole('cell', {name: 'Low'})).toBeVisible();
    expect(screen.getByRole('cell', {name: '2'})).toBeVisible();
    expect(screen.getByRole('cell', {name: 'High'})).toBeVisible();
    expect(screen.getByRole('cell', {name: '3'})).toBeVisible();
  });

  test('should render an empty table when there is no severity data', () => {
    render(
      <SeverityClassTableDisplay {...createProps({data: {groups: []}})} />,
    );

    expect(screen.getByRole('columnheader', {name: 'Severity'})).toBeVisible();
    expect(screen.getByRole('columnheader', {name: 'Count'})).toBeVisible();
    expect(screen.queryAllByRole('cell')).toHaveLength(0);
  });
});
