/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/CvssTableDisplay';

const createGmp = () => ({
  settings: {
    severityRating: SEVERITY_RATING_CVSS_3,
  },
});

const createProps = (overrides = {}) => ({
  data: {
    groups: [
      {value: '0.2', count: 20},
      {value: '7.5', count: 30},
    ],
  },
  dataTitles: ['CVSS', 'Count'],
  height: 100,
  icons: () => null,
  id: 'cvss-table-display',
  initialState: {},
  onSelectFilterClick: () => {},
  setState: () => ({}),
  showCsvDownload: false,
  showFilterSelection: false,
  showFilterString: false,
  showSvgDownload: false,
  showToggleLegend: false,
  state: {},
  title: () => 'CVSS',
  width: 200,
  ...overrides,
});

describe('CvssTableDisplay', () => {
  test('should render transformed CVSS data as table cells', () => {
    const {render} = rendererWith({gmp: createGmp()});
    render(<CvssTableDisplay {...createProps()} />);

    expect(screen.getByRole('columnheader', {name: 'CVSS'})).toBeVisible();
    expect(screen.getByRole('columnheader', {name: 'Count'})).toBeVisible();
    expect(screen.getByRole('cell', {name: '0.1'})).toBeVisible();
    expect(screen.getByRole('cell', {name: '20'})).toBeVisible();
    expect(screen.getByRole('cell', {name: '7'})).toBeVisible();
    expect(screen.getByRole('cell', {name: '30'})).toBeVisible();
  });

  test('should render an empty table when there is no CVSS data', () => {
    const {render} = rendererWith({gmp: createGmp()});
    render(<CvssTableDisplay {...createProps({data: {groups: []}})} />);

    expect(screen.getByRole('columnheader', {name: 'CVSS'})).toBeVisible();
    expect(screen.getByRole('columnheader', {name: 'Count'})).toBeVisible();
    expect(screen.getAllByRole('row')).toHaveLength(14);
    expect(screen.queryAllByRole('cell')).toHaveLength(26);
    expect(screen.getAllByRole('cell', {name: '0'})).toHaveLength(13);
  });
});
