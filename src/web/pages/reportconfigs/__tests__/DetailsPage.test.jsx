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
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/current-settings';
import {mockReportConfig} from 'web/pages/reportconfigs/__mocks__/MockReportConfig';
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

    expect(screen.getByTitle('Help: Report Configs')).toBeInTheDocument();
    expect(screen.getByTitle('Report Configs List')).toBeInTheDocument();

    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/reports.html#customizing-report-formats-with-report-configurations',
    );
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/reportconfigs',
    );

    const entityInfo = within(screen.getByTestId('entity-info'));
    expect(entityInfo.getByRole('row', {name: /^ID:/})).toHaveTextContent(
      '12345',
    );
    expect(entityInfo.getByRole('row', {name: /^Created:/})).toHaveTextContent(
      'Tue, Jul 16, 2019 8:31 AM Central European Summer Time',
    );
    expect(entityInfo.getByRole('row', {name: /^Modified:/})).toHaveTextContent(
      'Tue, Jul 16, 2019 8:44 AM Central European Summer Time',
    );
    expect(entityInfo.getByRole('row', {name: /Owner:/})).toHaveTextContent(
      'admin',
    );

    expect(
      screen.getByRole('heading', {name: /Report Config: foo$/}),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('tab', {name: /^information/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', {name: /^parameter details/i}),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', {name: /^user tags/i})).toBeInTheDocument();
    expect(
      screen.getByRole('tab', {name: /^permissions/i}),
    ).toBeInTheDocument();

    expect(screen.getByRole('row', {name: /^Report Format/})).toHaveTextContent(
      'example-configurable-1',
    );

    const paramTable = within(screen.getByRole('table', {name: /parameters/i}));
    expect(
      paramTable.getByRole('row', {name: /StringParam/}),
    ).toHaveTextContent('StringValue');
    expect(paramTable.getByRole('row', {name: /TextParam/})).toHaveTextContent(
      'TextValue',
    );
    expect(
      paramTable.getByRole('row', {name: /IntegerParam/}),
    ).toHaveTextContent('12');
    expect(
      paramTable.getByRole('row', {name: /BooleanParam/}),
    ).toHaveTextContent('Yes');
    expect(
      paramTable.getByRole('row', {name: /SelectionParam/}),
    ).toHaveTextContent('OptionB');
    expect(
      paramTable.getByRole('row', {name: /ReportFormatListParam/}),
    ).toHaveTextContent('non-configurable-1non-configurable-2');

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

    const parameterDetailsTab = screen.getByRole('tab', {
      name: /^parameter details/i,
    });
    fireEvent.click(parameterDetailsTab);

    // table heading
    expect(
      screen.getByRole('row', {
        name: /^Name Value Using Default Default Value Minimum Maximum$/i,
      }),
    ).toBeInTheDocument();

    // first param row
    expect(screen.getByRole('row', {name: /StringParam/})).toHaveTextContent(
      /StringValueYesStringValue0100$/,
    );

    // second param row
    expect(screen.getByRole('row', {name: /^TextParam/})).toHaveTextContent(
      /TextValueNoTextDefault01000$/,
    );

    // third param row
    expect(screen.getByRole('row', {name: /^IntegerParam/})).toHaveTextContent(
      /12Yes12050$/,
    );

    // fourth param row
    expect(screen.getByRole('row', {name: /^BooleanParam/})).toHaveTextContent(
      /YesNoNo01$/,
    );

    // fifth param row
    expect(
      screen.getByRole('row', {name: /^SelectionParam/}),
    ).toHaveTextContent(/OptionBNoOptionA01$/);

    // sixth param row
    expect(
      screen.getByRole('row', {name: /^ReportFormatListParam/}),
    ).toHaveTextContent(
      /ListParamnon-configurable-1non-configurable-2Nonon-configurable-2example-configurable-201$/,
    );
    expect(
      screen.getByRole('link', {name: /^non-configurable-1$/}),
    ).toHaveAttribute('href', '/reportformat/654321');
    expect(
      screen.getAllByRole('link', {name: /^non-configurable-2$/})[0],
    ).toHaveAttribute('href', '/reportformat/7654321');
    expect(
      screen.getAllByRole('link', {name: /^non-configurable-2$/})[1],
    ).toHaveAttribute('href', '/reportformat/7654321');
    expect(
      screen.getByRole('link', {name: /^example-configurable-2$/}),
    ).toHaveAttribute('href', '/reportformat/1234567');
  });
});
