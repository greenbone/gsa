/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, within, rendererWith, wait} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Filter from 'gmp/models/filter';
import Setting from 'gmp/models/setting';
import UserSettingsPage, {
  ToolBarIcons,
} from 'web/pages/user-settings/UserSettingsPage';
import {setTimezone} from 'web/store/usersettings/actions';
import {USER_SETTINGS_DEFAULT_FILTER_LOADING_SUCCESS} from 'web/store/usersettings/defaultfilters/actions';
import {USER_SETTINGS_DEFAULTS_LOADING_SUCCESS} from 'web/store/usersettings/defaults/actions';

const manualUrl = 'test/';

const createGmpMock = (userSettings = {}) => {
  const mockGetSettingPromise = Promise.resolve({
    data: {
      value: null,
    },
  });

  const mockEntitiesResponse = {
    data: [],
    meta: {
      filter: {},
      counts: {},
    },
  };

  const mockGet = testing.fn().mockResolvedValue(mockEntitiesResponse);

  return {
    settings: {manualUrl},
    user: {
      getSetting: testing.fn().mockReturnValue(mockGetSettingPromise),
      currentSettings: testing.fn().mockResolvedValue(userSettings),
      saveSettings: testing.fn().mockResolvedValue({}),
      renewSession: testing.fn().mockResolvedValue({data: 123}),
    },
    alerts: {get: mockGet},
    credentials: {get: mockGet},
    filters: {get: mockGet},
    portlists: {get: mockGet},
    scanconfigs: {get: mockGet},
    scanners: {get: mockGet},
    schedules: {get: mockGet},
    targets: {get: mockGet},
  };
};

describe('UserSettingsPage', () => {
  test('renders without crashing', async () => {
    const gmp = createGmpMock();

    const {render} = rendererWith({
      capabilities: true,
      router: true,
      gmp,
      store: true,
    });
    render(<UserSettingsPage />);

    const mySettingsHeading = await screen.findByText('My Settings');
    expect(mySettingsHeading).toBeVisible();
  });

  test('renders tabs after loading completes', async () => {
    const gmp = createGmpMock({
      userInterfaceDateFormat: {value: 'MM/DD/YYYY'},
      userInterfaceTimeFormat: {value: 'hh:mm:ss a'},
      timezone: 'UTC',
    });

    const {render} = rendererWith({
      capabilities: true,
      router: true,
      gmp,
      store: true,
    });

    render(<UserSettingsPage />);

    const loadingElement = screen.getByTestId('loading');
    expect(loadingElement).toBeVisible();

    const generalTab = await screen.findByText('General', {}, {timeout: 5000});
    expect(generalTab).toBeVisible();

    expect(screen.getByText('Severity')).toBeVisible();
    expect(screen.getByText('Defaults')).toBeVisible();
    expect(screen.getByText('Filters')).toBeVisible();
  });

  describe('ToolBarIcons', () => {
    test('should render and handle click', () => {
      const {render} = rendererWith({
        gmp: {settings: {manualUrl: 'test/'}},
        capabilities: true,
        router: true,
      });
      render(<ToolBarIcons />);
      const helpIcon = screen.getByTitle('Help: My Settings').closest('a');
      expect(helpIcon).toHaveAttribute(
        'href',
        'test/en/web-interface.html#changing-the-user-settings',
      );
      expect(screen.getByTitle('Help: My Settings')).toBeVisible();
    });
  });

  describe('General tab', () => {
    test('displays user settings in the General tab', async () => {
      const dateFormatSetting = Setting.fromElement({
        _id: 'g1',
        name: 'userInterfaceDateFormat',
        value: 'MM/DD/YYYY',
        comment: 'Date format comment',
      });

      const timeFormatSetting = Setting.fromElement({
        _id: 'g2',
        name: 'userInterfaceTimeFormat',
        value: '24',
        comment: 'Time format comment',
      });

      const rowsPerPageSetting = Setting.fromElement({
        _id: 'g3',
        name: 'rowsperpage',
        value: '50',
        comment: 'Rows per page comment',
      });

      const detailsExportFilenameSetting = Setting.fromElement({
        _id: 'g4',
        name: 'detailsexportfilename',
        value: 'details-export-{{name}}.xml',
        comment: 'Details export filename comment',
      });

      const listExportFilenameSetting = Setting.fromElement({
        _id: 'g5',
        name: 'listexportfilename',
        value: 'list-export-{{name}}.csv',
        comment: 'List export filename comment',
      });

      const reportExportFilenameSetting = Setting.fromElement({
        _id: 'g6',
        name: 'reportexportfilename',
        value: 'report-{{name}}.pdf',
        comment: 'Report export filename comment',
      });

      const maxRowsPerPageSetting = Setting.fromElement({
        _id: 'g7',
        name: 'maxrowsperpage',
        value: '100',
        comment: 'Max rows per page comment',
      });

      const languageSetting = Setting.fromElement({
        _id: 'g8',
        name: 'userinterfacelanguage',
        value: 'en',
        comment: 'Language comment',
      });

      const autoCacheRebuildSetting = Setting.fromElement({
        _id: 'g9',
        name: 'autocacherebuild',
        value: '1',
        comment: 'Auto cache rebuild comment',
      });

      const settingsData = {
        userInterfaceDateFormat: dateFormatSetting,
        userInterfaceTimeFormat: timeFormatSetting,
        rowsperpage: rowsPerPageSetting,
        detailsexportfilename: detailsExportFilenameSetting,
        listexportfilename: listExportFilenameSetting,
        reportexportfilename: reportExportFilenameSetting,
        maxrowsperpage: maxRowsPerPageSetting,
        userinterfacelanguage: languageSetting,
        autocacherebuild: autoCacheRebuildSetting,
      };

      const gmp = createGmpMock();

      const {render, store} = rendererWith({
        capabilities: true,
        router: true,
        gmp,
        store: true,
      });

      store.dispatch(setTimezone('UTC'));

      store.dispatch({
        type: USER_SETTINGS_DEFAULTS_LOADING_SUCCESS,
        data: settingsData,
      });

      render(<UserSettingsPage />);

      const generalTab = await screen.findByText(
        'General',
        {},
        {timeout: 5000},
      );
      generalTab.click();

      expect(screen.getByText('Timezone')).toBeVisible();
      expect(screen.getByText('UTC')).toBeVisible();

      expect(screen.getByText('Date & Time Format')).toBeVisible();

      const dateTimeFormatRow = screen
        .getByText('Date & Time Format')
        .closest('tr');
      expect(dateTimeFormatRow).not.toBeNull();

      const cells = dateTimeFormatRow
        ? within(dateTimeFormatRow).getAllByRole('cell')
        : [];
      expect(cells.length).toBeGreaterThan(1);
      expect(cells[1]).toHaveTextContent(/Time Format/);
      expect(cells[1]).toHaveTextContent(/Date Format/);

      expect(screen.getByText('Password')).toBeVisible();
      expect(screen.getByText('********')).toBeVisible();

      expect(screen.getByText('User Interface Language')).toBeVisible();
      expect(screen.getByText('English')).toBeVisible();

      expect(screen.getByText('Rows Per Page')).toBeVisible();
      expect(screen.getByText('50')).toBeVisible();

      expect(screen.getByText('Details Export File Name')).toBeVisible();
      expect(screen.getByText('details-export-{{name}}.xml')).toBeVisible();

      expect(screen.getByText('List Export File Name')).toBeVisible();
      expect(screen.getByText('list-export-{{name}}.csv')).toBeVisible();

      expect(screen.getByText('Report Export File Name')).toBeVisible();
      expect(screen.getByText('report-{{name}}.pdf')).toBeVisible();

      expect(screen.getByText('Max Rows Per Page (immutable)')).toBeVisible();
      expect(screen.getByText('100')).toBeVisible();

      expect(screen.getByText('Auto Cache Rebuild')).toBeVisible();
      expect(screen.getByText('Yes')).toBeVisible();
    });
  });

  describe('Severity tab', () => {
    test('displays severity settings in the Severity tab', async () => {
      const dynamicSeveritySetting = Setting.fromElement({
        _id: 'd1',
        name: 'dynamicseverity',
        value: '1',
        comment: 'Dynamic severity comment',
      });

      const defaultSeveritySetting = Setting.fromElement({
        _id: 'd2',
        name: 'defaultseverity',
        value: '5.0',
        comment: 'Default severity comment',
      });

      const settingsData = {
        dynamicseverity: dynamicSeveritySetting,
        defaultseverity: defaultSeveritySetting,
      };

      const gmp = createGmpMock();

      const {render, store} = rendererWith({
        capabilities: true,
        router: true,
        gmp,
        store: true,
      });

      store.dispatch({
        type: USER_SETTINGS_DEFAULTS_LOADING_SUCCESS,
        data: settingsData,
      });

      render(<UserSettingsPage />);

      const severityTab = await screen.findByText(
        'Severity',
        {},
        {timeout: 5000},
      );
      severityTab.click();

      expect(await screen.findByText('Yes')).toBeVisible();

      const dynamicSeverityRow = screen.getByTitle('Dynamic severity comment');

      expect(dynamicSeverityRow).toBeInTheDocument();

      const cells = within(dynamicSeverityRow).getAllByRole('cell');

      expect(cells[0]).toHaveTextContent('Dynamic Severity');

      expect(cells[1]).toHaveTextContent('Yes');

      const defaultSeverityRow = screen.getByTitle('Default severity comment');

      expect(defaultSeverityRow).toBeInTheDocument();

      const defaultCells = within(defaultSeverityRow).getAllByRole('cell');

      expect(defaultCells[0]).toHaveTextContent('Default Severity');
      expect(defaultCells[1]).toHaveTextContent('5.0');
    });
  });

  describe('Defaults tab', () => {
    test('displays default settings headers and links in the Defaults tab', async () => {
      const createMockEntitiesResponse = (id, name) => ({
        data: [
          {
            id,
            name,
          },
        ],
        meta: {
          filter: {},
          counts: {},
        },
      });

      const mockTargetEntitiesResponse = createMockEntitiesResponse(
        'target-123',
        'Test Target',
      );
      const mockAlertEntitiesResponse = createMockEntitiesResponse(
        'alert-123',
        'Test alert',
      );
      const mockCredentialsOneEntitiesResponse = createMockEntitiesResponse(
        'credential-123',
        'Test Credential',
      );

      const mockPortlistEntitiesResponse = createMockEntitiesResponse(
        'portlist-123',
        'Test Port List',
      );
      const mockScanconfigEntitiesResponse = createMockEntitiesResponse(
        'scanconfig-123',
        'Test Scan Config',
      );
      const mockScannerEntitiesResponse = createMockEntitiesResponse(
        'scanner-123',
        'Test Scanner',
      );
      const mockScheduleEntitiesResponse = createMockEntitiesResponse(
        'schedule-123',
        'Test Schedule',
      );

      const mockGetTarget = testing
        .fn()
        .mockResolvedValue(mockTargetEntitiesResponse);

      const mockAlertGet = testing
        .fn()
        .mockResolvedValue(mockAlertEntitiesResponse);

      const mockCredentialsGet = testing
        .fn()
        .mockResolvedValue(mockCredentialsOneEntitiesResponse);

      const mockPortlistsGet = testing
        .fn()
        .mockResolvedValue(mockPortlistEntitiesResponse);
      const mockScanconfigsGet = testing
        .fn()
        .mockResolvedValue(mockScanconfigEntitiesResponse);
      const mockScannersGet = testing
        .fn()
        .mockResolvedValue(mockScannerEntitiesResponse);
      const mockSchedulesGet = testing
        .fn()
        .mockResolvedValue(mockScheduleEntitiesResponse);

      const gmp = {
        settings: {manualUrl},
        user: {
          getSetting: testing.fn().mockResolvedValue({
            data: {value: null},
          }),
          currentSettings: testing.fn().mockResolvedValue({}),
          saveSettings: testing.fn().mockResolvedValue({}),
          renewSession: testing.fn().mockResolvedValue({data: 123}),
        },
        alerts: {get: mockAlertGet},

        credentials: {get: mockCredentialsGet},
        filters: {get: mockGetTarget},
        portlists: {get: mockPortlistsGet},
        scanconfigs: {get: mockScanconfigsGet},
        scanners: {get: mockScannersGet},
        schedules: {get: mockSchedulesGet},
        targets: {get: mockGetTarget},
      };

      const {render, store} = rendererWith({
        capabilities: true,
        router: true,
        gmp,
        store: true,
      });

      const settingsData = {
        defaultalert: Setting.fromElement({
          _id: 'alert-uuid',
          name: 'defaultalert',
          value: 'alert-123',
          comment: 'Default alert comment',
        }),
        defaultesxicredential: Setting.fromElement({
          _id: '83545bcf-0c49-4b4c-abbf-63baf82cc2a7',
          name: 'defaultesxicredential',
          value: 'credential-123',
          comment: 'Default ESXi credential comment',
        }),
        defaulttarget: Setting.fromElement({
          _id: 'target-uuid',
          name: 'defaulttarget',
          value: 'target-123',
          comment: 'Default target comment',
        }),
        defaultopenvasscanconfig: Setting.fromElement({
          _id: 'scanconfig-uuid',
          name: 'defaultopenvasscanconfig',
          value: 'scanconfig-123',
          comment: 'Default OpenVAS scan config comment',
        }),
        defaultopenvasscanner: Setting.fromElement({
          _id: 'scanner-uuid',
          name: 'defaultopenvasscanner',
          value: 'scanner-123',
          comment: 'Default OpenVAS scanner comment',
        }),
        defaultportlist: Setting.fromElement({
          _id: 'portlist-uuid',
          name: 'defaultportlist',
          value: 'portlist-123',
          comment: 'Default port list comment',
        }),
        defaultsmbcredential: {
          _id: 'smb-uuid',
          name: 'defaultsmbcredential',
          value: 'credential-123',
          comment: 'Default SMB credential comment',
        },
        defaultsnmpcredential: Setting.fromElement({
          _id: 'snmp-uuid',
          name: 'defaultsnmpcredential',
          value: 'credential-123',
          comment: 'Default SNMP credential comment',
        }),
        defaultsshcredential: Setting.fromElement({
          _id: 'ssh-uuid',
          name: 'defaultsshcredential',
          value: 'credential-123',
          comment: 'Default SSH credential comment',
        }),
        defaultschedule: Setting.fromElement({
          _id: 'schedule-uuid',
          name: 'defaultschedule',
          value: 'schedule-123',
          comment: 'Default schedule comment',
        }),
      };

      store.dispatch({
        type: USER_SETTINGS_DEFAULTS_LOADING_SUCCESS,
        data: settingsData,
      });

      render(<UserSettingsPage />);

      const defaultsTab = await screen.findByText(
        'Defaults',
        {},
        {timeout: 5000},
      );
      defaultsTab.click();

      await wait();

      const defaultAlertRow = screen.getByText('Default Alert').closest('tr');
      expect(defaultAlertRow).not.toBeNull();
      expect(
        within(defaultAlertRow as HTMLTableRowElement).getByRole('link', {
          name: 'Test alert',
        }),
      ).toBeInTheDocument();

      const defaultScanConfigRow = screen
        .getByText('Default OpenVAS Scan Config')
        .closest('tr');
      expect(defaultScanConfigRow).not.toBeNull();
      expect(
        within(defaultScanConfigRow as HTMLTableRowElement).getByRole('link', {
          name: 'Test Scan Config',
        }),
      ).toBeInTheDocument();

      const defaultScannerRow = screen
        .getByText('Default OpenVAS Scanner')
        .closest('tr');
      expect(defaultScannerRow).not.toBeNull();
      expect(
        within(defaultScannerRow as HTMLTableRowElement).getByRole('link', {
          name: 'Test Scanner',
        }),
      ).toBeInTheDocument();

      const defaultPortListRow = screen
        .getByText('Default Port List')
        .closest('tr');
      expect(defaultPortListRow).not.toBeNull();
      expect(
        within(defaultPortListRow as HTMLTableRowElement).getByRole('link', {
          name: 'Test Port List',
        }),
      ).toBeInTheDocument();

      const defaultScheduleRow = screen
        .getByText('Default Schedule')
        .closest('tr');
      expect(defaultScheduleRow).not.toBeNull();
      expect(
        within(defaultScheduleRow as HTMLTableRowElement).getByRole('link', {
          name: 'Test Schedule',
        }),
      ).toBeInTheDocument();

      const defaultTargetRow = screen.getByText('Default Target').closest('tr');
      expect(defaultTargetRow).not.toBeNull();
      expect(
        within(defaultTargetRow as HTMLTableRowElement).getByRole('link', {
          name: 'Test Target',
        }),
      ).toBeInTheDocument();
      const defaultEsxiRow = screen
        .getByText('Default ESXi Credential')
        .closest('tr');
      expect(defaultEsxiRow).not.toBeNull();
      expect(
        within(defaultEsxiRow as HTMLTableRowElement).getByRole('link', {
          name: 'Test Credential',
        }),
      ).toBeInTheDocument();

      const defaultSMBCredentialRow = screen
        .getByText('Default SMB Credential')
        .closest('tr');
      expect(defaultSMBCredentialRow).not.toBeNull();
      expect(
        within(defaultSMBCredentialRow as HTMLTableRowElement).getByRole(
          'link',
          {
            name: 'Test Credential',
          },
        ),
      ).toBeInTheDocument();

      const defaultSNMPCredentialRow = screen
        .getByText('Default SNMP Credential')
        .closest('tr');
      expect(defaultSNMPCredentialRow).not.toBeNull();
      expect(
        within(defaultSNMPCredentialRow as HTMLTableRowElement).getByRole(
          'link',
          {
            name: 'Test Credential',
          },
        ),
      ).toBeInTheDocument();

      const defaultSSHCredentialRow = screen
        .getByText('Default SSH Credential')
        .closest('tr');
      expect(defaultSSHCredentialRow).not.toBeNull();
      expect(
        within(defaultSSHCredentialRow as HTMLTableRowElement).getByRole(
          'link',
          {
            name: 'Test Credential',
          },
        ),
      ).toBeInTheDocument();
    });

    test('permission capabilities with no capabilities', async () => {
      const gmp = createGmpMock();
      const capabilities = new Capabilities([]);

      const {render, store} = rendererWith({
        capabilities,
        router: true,
        gmp,
        store: true,
      });

      store.dispatch({
        type: USER_SETTINGS_DEFAULTS_LOADING_SUCCESS,
        data: {},
      });

      render(<UserSettingsPage />);

      const defaultsTab = await screen.findByText(
        'Defaults',
        {},
        {timeout: 5000},
      );
      defaultsTab.click();
      await wait();

      [
        'Default Alert',
        'Default ESXi Credential',
        'Default OpenVAS Scan Config',
        'Default OpenVAS Scanner',
        'Default Port List',
        'Default SMB Credential',
        'Default SNMP Credential',
        'Default SSH Credential',
        'Default Schedule',
        'Default Target',
      ].forEach(label => {
        expect(screen.queryByText(label)).not.toBeInTheDocument();
      });
    });
  });

  describe('Filter tab', () => {
    test('permission capabilities with no capabilities for filter tab', async () => {
      const gmp = createGmpMock();
      const capabilities = new Capabilities([]);

      const {render} = rendererWith({
        capabilities,
        router: true,
        gmp,
        store: true,
      });
      render(<UserSettingsPage />);
      expect(screen.queryByText('Filters')).not.toBeInTheDocument();
    });
    test('displays filter settings headers and links in the Filters tab', async () => {
      const gmp = createGmpMock();

      const {render, store} = rendererWith({
        capabilities: true,
        router: true,
        gmp,
        store: true,
      });

      const entityTypeToDisplayName = {
        alert: 'Alerts',
        auditreport: 'Audit Reports',
        scanconfig: 'Configs',
        credential: 'Credentials',
        filter: 'Filters',
        group: 'Groups',
        host: 'Hosts',
        note: 'Notes',
        operatingsystem: 'Operating Systems',
        override: 'Overrides',
        permission: 'Permissions',
        portlist: 'Port Lists',
        report: 'Reports',
        reportformat: 'Report Formats',
        result: 'Results',
        role: 'Roles',
        scanner: 'Scanners',
        schedule: 'Schedules',
        tag: 'Tags',
        target: 'Targets',
        task: 'Tasks',
        ticket: 'Tickets',
        tlscertificate: 'TLS Certificates',
        user: 'Users',
        vulnerability: 'Vulnerabilities',
        cpe: 'CPE',
        cve: 'CVE',
        certbund: 'CERT-Bund Advisories',
        dfncert: 'DFN-CERT Advisories',
        nvt: 'NVT',
      };

      const entityTypes = Object.keys(entityTypeToDisplayName);

      entityTypes.forEach(entityType => {
        const filter = new Filter({
          id: `${entityType}-filter-uuid`,
          name: `${entityType} Filter`,
        });

        store.dispatch({
          type: USER_SETTINGS_DEFAULT_FILTER_LOADING_SUCCESS,
          entityType,
          filter,
        });
      });

      render(<UserSettingsPage />);
      const filtersTab = await screen.findByText(
        'Filters',
        {},
        {timeout: 5000},
      );
      filtersTab.click();
      await wait();

      const filterRows = screen.getAllByRole('row');
      const header = 1;
      expect(filterRows.length - header).toBe(entityTypes.length);

      entityTypes.forEach(entityType => {
        const displayName = entityTypeToDisplayName[entityType];
        const headerText = `${displayName} Filter`;

        const headerElement = screen.getByText(headerText);
        expect(headerElement).toBeInTheDocument();

        const row = headerElement.closest('tr');
        expect(row).not.toBeNull();

        const linkElement = within(row as HTMLTableRowElement).getByRole(
          'link',
          {
            name: `${entityType} Filter`,
          },
        );
        expect(linkElement).toBeInTheDocument();
        expect(linkElement).toHaveAttribute(
          'href',
          `/filter/${entityType}-filter-uuid`,
        );
      });

      const certBundRow = screen
        .getByText('CERT-Bund Advisories Filter')
        .closest('tr');
      expect(
        within(certBundRow as HTMLTableRowElement).getByRole('link', {
          name: 'certbund Filter',
        }),
      ).toHaveAttribute('href', '/filter/certbund-filter-uuid');

      const dfnCertRow = screen
        .getByText('DFN-CERT Advisories Filter')
        .closest('tr');
      expect(
        within(dfnCertRow as HTMLTableRowElement).getByRole('link', {
          name: 'dfncert Filter',
        }),
      ).toHaveAttribute('href', '/filter/dfncert-filter-uuid');
    });
  });
});
