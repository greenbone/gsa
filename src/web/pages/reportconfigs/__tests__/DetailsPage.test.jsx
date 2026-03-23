/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Response from 'gmp/http/response';
import Filter from 'gmp/models/filter';
import ReportConfig from 'gmp/models/report-config';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import {mockReportConfig} from 'web/pages/reportconfigs/__fixtures__/MockReportConfig';
import DetailsPage from 'web/pages/reportconfigs/DetailsPage';
import {entityLoadingActions} from 'web/store/entities/reportconfigs';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const reloadInterval = 1;
const manualUrl = 'test/';

const reportConfig = ReportConfig.fromElement(mockReportConfig);

const createGmp = ({
  getReportConfigResponse = new Response(reportConfig),
  getPermissionsResponse = new Response([], {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  }),
  currentSettingsResponse = currentSettingsDefaultResponse,
  getReportConfig = testing.fn().mockResolvedValue(getReportConfigResponse),
  getPermissions = testing.fn().mockResolvedValue(getPermissionsResponse),
  currentSettings = testing.fn().mockResolvedValue(currentSettingsResponse),
} = {}) => {
  return {
    reportconfig: {
      get: getReportConfig,
    },
    permissions: {
      get: getPermissions,
    },
    reloadInterval,
    settings: {manualUrl},
    user: {
      currentSettings,
    },
  };
};

describe('ReportConfigDetailsPage tests', () => {
  test('should render full Details page with param details', () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', reportConfig));

    render(<DetailsPage id="12345" />);

    screen.getByTitle('Help: Report Configs');
    screen.getByTitle('Report Configs List');

    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/reports.html#customizing-report-formats-with-report-configurations',
    );
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/report-configs',
    );

    const entityInfo = within(screen.getByTestId('entity-info'));
    const infoRows = entityInfo.getAllByRole('row');
    expect(infoRows[0]).toHaveTextContent('12345');
    expect(infoRows[1]).toHaveTextContent(
      'Tue, Jul 16, 2019 8:31 AM Central European Summer Time',
    );
    expect(infoRows[2]).toHaveTextContent(
      'Tue, Jul 16, 2019 8:44 AM Central European Summer Time',
    );
    expect(infoRows[3]).toHaveTextContent('admin');

    screen.getByRole('heading', {name: /Report Config: foo$/});

    const tablist = screen.getByRole('tablist');
    within(tablist).getByRole('tab', {name: /^information/i});
    within(tablist).getByRole('tab', {name: /^parameter details/i});
    within(tablist).getByRole('tab', {name: /^user tags/i});
    within(tablist).getByRole('tab', {name: /^permissions/i});

    expect(screen.getByText('Report Format').closest('tr')).toHaveTextContent(
      'example-configurable-1',
    );

    const paramTable = within(screen.getByRole('table', {name: /parameters/i}));
    const paramRows = paramTable.getAllByRole('row');
    // Rows: StringParam, TextParam, IntegerParam, BooleanParam, SelectionParam, ReportFormatListParam
    expect(paramRows[0]).toHaveTextContent('StringValue');
    expect(paramRows[1]).toHaveTextContent('TextValue');
    expect(paramRows[2]).toHaveTextContent('12');
    expect(paramRows[3]).toHaveTextContent('Yes');
    expect(paramRows[4]).toHaveTextContent('OptionB');
    expect(paramRows[5]).toHaveTextContent(
      'non-configurable-1non-configurable-2',
    );

    const alertsList = within(
      screen.getByRole('list', {
        name: /alerts using this report config/i,
      }),
    );
    expect(alertsList.getByRole('link', {name: 'ABC'})).toHaveAttribute(
      'href',
      '/alert/321',
    );
    expect(alertsList.getByRole('link', {name: 'XYZ'})).toHaveAttribute(
      'href',
      '/alert/789',
    );
  });

  test('should render parameter details', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', reportConfig));

    render(<DetailsPage id="12345" />);

    const tablist = screen.getByRole('tablist');
    const parameterDetailsTab = within(tablist).getByRole('tab', {
      name: /^parameter details/i,
    });
    fireEvent.click(parameterDetailsTab);

    // Get all parameter detail rows from the table (get last table which is parameter details)
    const tables = screen.getAllByRole('table');
    const paramDetailsTable = within(tables[tables.length - 1]);
    const detailRows = paramDetailsTable.getAllByRole('row');
    // row 0 is header, rows 1-6 are params
    expect(detailRows[1]).toHaveTextContent(/StringValueYesStringValue0100$/);
    expect(detailRows[2]).toHaveTextContent(/TextValueNoTextDefault01000$/);
    expect(detailRows[3]).toHaveTextContent(/12Yes12050$/);
    expect(detailRows[4]).toHaveTextContent(/YesNoNo01$/);
    expect(detailRows[5]).toHaveTextContent(/OptionBNoOptionA01$/);
    expect(detailRows[6]).toHaveTextContent(
      /ListParamnon-configurable-1non-configurable-2Nonon-configurable-2example-configurable-201$/,
    );
    expect(
      screen.getByRole('link', {name: /^non-configurable-1$/}),
    ).toHaveAttribute('href', '/report-format/654321');
    expect(
      screen.getAllByRole('link', {name: /^non-configurable-2$/})[0],
    ).toHaveAttribute('href', '/report-format/7654321');
    expect(
      screen.getAllByRole('link', {name: /^non-configurable-2$/})[1],
    ).toHaveAttribute('href', '/report-format/7654321');
    expect(
      screen.getByRole('link', {name: /^example-configurable-2$/}),
    ).toHaveAttribute('href', '/report-format/1234567');
  });
});
