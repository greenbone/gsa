/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Filter from 'gmp/models/filter';
import {getMockReport} from 'web/pages/reports/__mocks__/MockReport';
import {rendererWith, fireEvent} from 'web/utils/Testing';

import ToolBarIcons from '../ToolbarIcons';

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

const caps = new Capabilities(['everything']);

const manualUrl = 'test/';

const currentSettings = testing.fn().mockResolvedValue({
  foo: 'bar',
});

const getReportComposerDefaults = testing.fn().mockResolvedValue({
  foo: 'bar',
});

const gmp = {
  settings: {manualUrl},
  user: {currentSettings, getReportComposerDefaults},
};

describe('Report Details ToolBarIcons tests', () => {
  test('should render ToolBarIcons', () => {
    const showError = testing.fn();
    const showSuccessMessage = testing.fn();
    const showErrorMessage = testing.fn();
    const onAddToAssetsClick = testing.fn();
    const onInteraction = testing.fn();
    const onRemoveFromAssetsClick = testing.fn();
    const onReportDownloadClick = testing.fn();

    const {report} = getMockReport();

    const {render} = rendererWith({
      capabilities: caps,
      router: true,
      store: true,
      gmp,
    });

    const {element} = render(
      <ToolBarIcons
        filter={filter}
        isLoading={false}
        report={report}
        reportId={report.id}
        showError={showError}
        showErrorMessage={showErrorMessage}
        showSuccessMessage={showSuccessMessage}
        showThresholdMessage={false}
        task={report.task}
        threshold={10}
        onAddToAssetsClick={onAddToAssetsClick}
        onInteraction={onInteraction}
        onRemoveFromAssetsClick={onRemoveFromAssetsClick}
        onReportDownloadClick={onReportDownloadClick}
      />,
    );

    const links = element.querySelectorAll('a');
    const spans = element.querySelectorAll('span');

    // Manual Icon
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/reports.html#reading-a-report',
    );
    expect(spans[0]).toHaveAttribute('title', 'Help: Reading Reports');

    // Reports List Icon
    expect(links[1]).toHaveAttribute('href', '/reports');
    expect(spans[1]).toHaveAttribute('title', 'Reports List');

    // Add to Assets Icon
    expect(spans[2]).toHaveAttribute(
      'title',
      'Add to Assets with QoD >= 70% and Overrides enabled',
    );

    // Remove from Assets Icon
    expect(spans[3]).toHaveAttribute('title', 'Remove from Assets');

    // Corresponding Task Icon
    expect(links[2]).toHaveAttribute('href', '/task/314');
    expect(links[2]).toHaveAttribute('title', 'Corresponding Task');

    // Corresponding Results Icon
    expect(links[3]).toHaveAttribute(
      'href',
      '/results?filter=report_id%3D1234',
    );
    expect(links[3]).toHaveAttribute('title', 'Corresponding Results');

    // Corresponding Vulnerabilities Icon
    expect(links[4]).toHaveAttribute(
      'href',
      '/vulnerabilities?filter=report_id%3D1234',
    );
    expect(links[4]).toHaveAttribute('title', 'Corresponding Vulnerabilities');

    // Corresponding TLS Certificates Icon
    expect(links[5]).toHaveAttribute('title', 'Corresponding TLS Certificates');
    expect(links[5]).toHaveAttribute(
      'href',
      '/tlscertificates?filter=report_id%3D1234',
    );

    // Corresponding Performance Icon
    expect(links[6]).toHaveAttribute(
      'href',
      '/performance?start=2019-06-03T11%3A00%3A22.000Z&end=2019-06-03T11%3A31%3A23.000Z',
    );
    expect(links[6]).toHaveAttribute('title', 'Corresponding Performance');

    // Download Report Icon
    expect(spans[9]).toHaveAttribute('title', 'Download filtered Report');

    // Trigger Alert Icon
    expect(spans[10]).toHaveAttribute('title', 'Trigger Alert');
  });

  test('should call click handler', () => {
    const showError = testing.fn();
    const showSuccessMessage = testing.fn();
    const showErrorMessage = testing.fn();
    const onAddToAssetsClick = testing.fn();
    const onInteraction = testing.fn();
    const onRemoveFromAssetsClick = testing.fn();
    const onReportDownloadClick = testing.fn();

    const {report} = getMockReport();

    const {render} = rendererWith({
      capabilities: caps,
      router: true,
      store: true,
      gmp,
    });

    const {element} = render(
      <ToolBarIcons
        filter={filter}
        isLoading={false}
        report={report}
        reportId={report.id}
        showError={showError}
        showErrorMessage={showErrorMessage}
        showSuccessMessage={showSuccessMessage}
        showThresholdMessage={false}
        task={report.task}
        threshold={10}
        onAddToAssetsClick={onAddToAssetsClick}
        onInteraction={onInteraction}
        onRemoveFromAssetsClick={onRemoveFromAssetsClick}
        onReportDownloadClick={onReportDownloadClick}
      />,
    );

    const spans = element.querySelectorAll('span');

    expect(spans[2]).toHaveAttribute(
      'title',
      'Add to Assets with QoD >= 70% and Overrides enabled',
    );
    fireEvent.click(spans[2]);
    expect(onAddToAssetsClick).toHaveBeenCalled();

    expect(spans[3]).toHaveAttribute('title', 'Remove from Assets');
    fireEvent.click(spans[3]);
    expect(onRemoveFromAssetsClick).toHaveBeenCalled();

    expect(spans[9]).toHaveAttribute('title', 'Download filtered Report');
    fireEvent.click(spans[9]);
    expect(onReportDownloadClick).toHaveBeenCalled();
  });
});
