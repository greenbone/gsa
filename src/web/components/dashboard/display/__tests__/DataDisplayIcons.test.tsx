/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, render, screen} from 'web/testing';
import DataDisplayIcons from 'web/components/dashboard/display/DataDisplayIcons';

interface TestState {
  showLegend: boolean;
}

describe('DataDisplayIcons component tests', () => {
  test('should render all icons by default', () => {
    render(<DataDisplayIcons setState={testing.fn()} />);

    expect(screen.getByTitle('Select Filter')).toBeInTheDocument();
    expect(screen.getByTitle('Download SVG')).toBeInTheDocument();
    expect(screen.getByTitle('Download CSV')).toBeInTheDocument();
    expect(screen.getByTitle('Toggle Legend')).toBeInTheDocument();
  });

  test('should hide icons when their options are disabled', () => {
    render(
      <DataDisplayIcons
        setState={testing.fn()}
        showCsvDownload={false}
        showFilterSelection={false}
        showSvgDownload={false}
        showToggleLegend={false}
      />,
    );

    expect(screen.queryByTitle('Select Filter')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Download SVG')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Download CSV')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Toggle Legend')).not.toBeInTheDocument();
  });

  test('should call action handlers and toggle the legend state', () => {
    const onSelectFilterClick = testing.fn();
    const onDownloadSvgClick = testing.fn();
    const onDownloadCsvClick = testing.fn();
    const setState = testing.fn();

    render(
      <DataDisplayIcons
        setState={setState}
        onDownloadCsvClick={onDownloadCsvClick}
        onDownloadSvgClick={onDownloadSvgClick}
        onSelectFilterClick={onSelectFilterClick}
      />,
    );

    fireEvent.click(screen.getByTitle('Select Filter'));
    fireEvent.click(screen.getByTitle('Download SVG'));
    fireEvent.click(screen.getByTitle('Download CSV'));
    fireEvent.click(screen.getByTitle('Toggle Legend'));

    expect(onSelectFilterClick).toHaveBeenCalledTimes(1);
    expect(onDownloadSvgClick).toHaveBeenCalledTimes(1);
    expect(onDownloadCsvClick).toHaveBeenCalledTimes(1);
    expect(setState).toHaveBeenCalledTimes(1);

    const updateLegend = setState.mock.calls[0][0] as (
      state: TestState,
    ) => TestState;
    expect(updateLegend({showLegend: false})).toEqual({showLegend: true});
    expect(updateLegend({showLegend: true})).toEqual({showLegend: false});
  });
});
