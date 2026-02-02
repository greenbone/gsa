/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import ReportConfig from 'gmp/models/report-config';
import {mockReportConfig} from 'web/pages/reportconfigs/__fixtures__/MockReportConfig';
import ReportConfigDetailsPageToolBarIcons from 'web/pages/reportconfigs/ReportConfigDetailsPageToolBarIcons';

const manualUrl = 'test/';

describe('ReportConfigDetailsPageToolBarIcons tests', () => {
  test('should render toolbar icons', async () => {
    const gmp = {settings: {manualUrl}};
    // @ts-expect-error
    const reportConfig = ReportConfig.fromElement(mockReportConfig);
    const onCreateClick = testing.fn();
    const onCloneClick = testing.fn();
    const onEditClick = testing.fn();
    const onDeleteClick = testing.fn();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
    });
    render(
      <ReportConfigDetailsPageToolBarIcons
        entity={reportConfig}
        onReportConfigCloneClick={onCloneClick}
        onReportConfigCreateClick={onCreateClick}
        onReportConfigDeleteClick={onDeleteClick}
        onReportConfigEditClick={onEditClick}
      />,
    );

    expect(screen.getByTitle('Help: Report Configs')).toBeInTheDocument();
    expect(screen.getByTitle('Report Configs List')).toBeInTheDocument();
    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/reports.html#customizing-report-formats-with-report-configurations',
    );
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/report-configs',
    );
    expect(screen.getByTitle('Create new Report Config')).toBeInTheDocument();
    expect(screen.getByTitle('Clone Report Config')).toBeInTheDocument();
    expect(screen.getByTitle('Edit Report Config')).toBeInTheDocument();
    expect(
      screen.getByTitle('Move Report Config to trashcan'),
    ).toBeInTheDocument();
  });

  test('should call click handlers', async () => {
    const gmp = {settings: {manualUrl}};
    // @ts-expect-error
    const reportConfig = ReportConfig.fromElement(mockReportConfig);
    const onCreateClick = testing.fn();
    const onCloneClick = testing.fn();
    const onEditClick = testing.fn();
    const onDeleteClick = testing.fn();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
    });
    render(
      <ReportConfigDetailsPageToolBarIcons
        entity={reportConfig}
        onReportConfigCloneClick={onCloneClick}
        onReportConfigCreateClick={onCreateClick}
        onReportConfigDeleteClick={onDeleteClick}
        onReportConfigEditClick={onEditClick}
      />,
    );

    fireEvent.click(screen.getByTitle('Create new Report Config'));
    expect(onCreateClick).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Clone Report Config'));
    expect(onCloneClick).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Edit Report Config'));
    expect(onEditClick).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Move Report Config to trashcan'));
    expect(onDeleteClick).toHaveBeenCalled();
  });

  test('should not call click handlers without permissions', async () => {
    const gmp = {settings: {manualUrl}};
    // @ts-expect-error
    const reportConfig = ReportConfig.fromElement(mockReportConfig);
    const wrongCaps = new Capabilities(['get_report_configs']);
    const onCreateClick = testing.fn();
    const onCloneClick = testing.fn();
    const onEditClick = testing.fn();
    const onDeleteClick = testing.fn();
    const {render} = rendererWith({
      gmp,
      capabilities: wrongCaps,
    });
    render(
      <ReportConfigDetailsPageToolBarIcons
        entity={reportConfig}
        onReportConfigCloneClick={onCloneClick}
        onReportConfigCreateClick={onCreateClick}
        onReportConfigDeleteClick={onDeleteClick}
        onReportConfigEditClick={onEditClick}
      />,
    );

    expect(screen.queryByTestId('new-icon')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('clone-icon'));
    expect(onCloneClick).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('edit-icon'));
    expect(onEditClick).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('trashcan-icon'));
    expect(onDeleteClick).not.toHaveBeenCalled();
  });
});
