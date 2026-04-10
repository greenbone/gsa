/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith, fireEvent, waitFor} from 'web/testing';
import date from 'gmp/models/date';
import type Nvt from 'gmp/models/nvt';
import ScanConfig, {
  type ScanConfigFamilyElement,
  type ScanConfigPreferenceElement,
} from 'gmp/models/scan-config';
import {YES_VALUE, NO_VALUE, type YesNo} from 'gmp/parser';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import ScanConfigComponent, {
  createSelectedNvts,
} from 'web/pages/scanconfigs/ScanConfigComponent';

interface AllFamily {
  name: string;
  maxNvtCount: number;
}

interface Scanner {
  id: string;
  name: string;
}

interface FamilyNvt {
  oid: string | number;
  name: string;
  severity?: number;
  selected: YesNo;
}

interface NvtPreference {
  name?: string;
  value?: string | number;
  id?: string;
  type?: string;
  default?: string | number;
}

interface NvtData {
  id: string;
  oid: string;
  name: string;
  family: string;
  severity: number;
  timeout: unknown;
  defaultTimeout: number;
  modificationTime: ReturnType<typeof date>;
  preferences: NvtPreference[];
  tags: Nvt['tags'];
}

type MockFunction<T extends (...args: unknown[]) => unknown> = ReturnType<
  typeof testing.fn
> & {mockResolvedValue: (value: unknown) => MockFunction<T>};

// Common mock function types
type RecordPromiseMock = MockFunction<() => Promise<Record<string, unknown>>>;
type ConfigMock = MockFunction<() => Promise<{data: typeof config}>>;
type AllFamiliesMock = MockFunction<() => Promise<{data: AllFamily[]}>>;
type FamilyNvtsMock = MockFunction<() => Promise<{data: {nvts: FamilyNvt[]}}>>;
type NvtDataMock = MockFunction<() => Promise<{data: NvtData}>>;
type ScannersMock = MockFunction<() => Promise<{data: Scanner[]}>>;

interface GmpObject {
  scanconfig: {
    get: ConfigMock;
    save: RecordPromiseMock;
    editScanConfigFamilySettings: FamilyNvtsMock;
    saveScanConfigFamily: RecordPromiseMock;
    saveScanConfigNvt: RecordPromiseMock;
    import: RecordPromiseMock;
    export: RecordPromiseMock;
  };
  nvtfamilies: {
    get: AllFamiliesMock;
  };
  nvt: {
    getConfigNvt: NvtDataMock;
  };
  scanners: {
    getAll: ScannersMock;
  };
  settings: {manualUrl: string};
  user: {
    currentSettings: RecordPromiseMock;
  };
  [key: string]: unknown;
}

interface GmpMocks {
  getScanConfig: ConfigMock;
  saveScanConfig: RecordPromiseMock;
  editScanConfigFamilySettings: FamilyNvtsMock;
  saveScanConfigFamily: RecordPromiseMock;
  saveScanConfigNvt: RecordPromiseMock;
  importScanConfig: RecordPromiseMock;
  getNvtFamilies: AllFamiliesMock;
  getConfigNvt: NvtDataMock;
  getScannersAll: ScannersMock;
}

interface GmpFactory {
  gmp: GmpObject;
  mocks: GmpMocks;
}

const families: ScanConfigFamilyElement[] = [
  {
    name: 'family1',
    nvt_count: '2',
    max_nvt_count: '2',
    growing: 1,
  },
  {
    name: 'family2',
    nvt_count: '1',
    max_nvt_count: '4',
    growing: 0,
  },
];

const preferences: {
  preference: ScanConfigPreferenceElement[];
} = {
  preference: [
    {
      name: 'pref0',
      hr_name: 'Scanner Preference 0',
      value: '0',
      default: '0',
      nvt: {},
    },
    {
      name: 'pref1',
      hr_name: 'NVT Preference 1',
      value: 'yes',
      default: 'no',
      id: 1,
      type: 'checkbox',
      nvt: {_oid: 'nvt-1', name: 'NVT One'},
    },
  ],
};

const config = ScanConfig.fromElement({
  _id: 'c1',
  name: 'Test Config',
  comment: 'A comment',
  creation_time: '2024-01-01T00:00:00Z',
  modification_time: '2024-01-02T00:00:00Z',
  owner: {name: 'admin'},
  writable: 1,
  in_use: 0,
  family_count: {__text: '2', growing: 1},
  families: {family: families},
  preferences,
  permissions: {permission: [{name: 'everything'}]},
  scanner: {name: 'scanner', type: '42'},
  tasks: {task: []},
});

const configInUse = ScanConfig.fromElement({
  _id: 'c1',
  name: 'In-Use Config',
  comment: 'In use comment',
  creation_time: '2024-01-01T00:00:00Z',
  modification_time: '2024-01-02T00:00:00Z',
  owner: {name: 'admin'},
  writable: 1,
  in_use: 1,
  family_count: {__text: '2', growing: 1},
  families: {family: families},
  preferences,
  permissions: {permission: [{name: 'everything'}]},
  scanner: {name: 'scanner', type: '42'},
  tasks: {task: [{_id: 't1', name: 'task1'}]},
});

const allFamilies: AllFamily[] = [
  {name: 'family1', maxNvtCount: 2},
  {name: 'family2', maxNvtCount: 4},
];

const scannersData: Scanner[] = [{id: 's1', name: 'Scanner 1'}];

const familyNvts: FamilyNvt[] = [
  {oid: 'nvt-1', name: 'NVT One', severity: 5, selected: YES_VALUE},
  {oid: 'nvt-2', name: 'NVT Two', severity: 8, selected: NO_VALUE},
];

const nvtData: NvtData = {
  id: 'nvt-1',
  oid: 'nvt-1',
  name: 'NVT One',
  family: 'family1',
  severity: 5,
  timeout: undefined,
  defaultTimeout: 300,
  modificationTime: date('2024-01-01T00:00:00Z'),
  preferences: [
    {
      name: 'Disable caching',
      value: 'no',
      id: '1',
      type: 'checkbox',
      default: 'no',
    },
  ],
  tags: {
    summary: 'Test summary',
    affected: 'Test software',
    cvss_base_vector: 'AV:N/AC:L/Au:N/C:N/I:N/A:N',
  },
};

const currentSettings: RecordPromiseMock = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);

const createGmp = (overrides: Record<string, unknown> = {}): GmpFactory => {
  const getScanConfig: ConfigMock = testing
    .fn()
    .mockResolvedValue({data: config});
  const saveScanConfig: RecordPromiseMock = testing.fn().mockResolvedValue({});
  const editScanConfigFamilySettings: FamilyNvtsMock = testing
    .fn()
    .mockResolvedValue({data: {nvts: familyNvts}});
  const saveScanConfigFamily: RecordPromiseMock = testing
    .fn()
    .mockResolvedValue({});
  const saveScanConfigNvt: RecordPromiseMock = testing
    .fn()
    .mockResolvedValue({});
  const importScanConfig: RecordPromiseMock = testing
    .fn()
    .mockResolvedValue({});
  const getNvtFamilies: AllFamiliesMock = testing
    .fn()
    .mockResolvedValue({data: allFamilies});
  const getConfigNvt: NvtDataMock = testing
    .fn()
    .mockResolvedValue({data: nvtData});
  const getScannersAll: ScannersMock = testing
    .fn()
    .mockResolvedValue({data: scannersData});

  return {
    gmp: {
      scanconfig: {
        get: getScanConfig,
        save: saveScanConfig,
        editScanConfigFamilySettings,
        saveScanConfigFamily,
        saveScanConfigNvt,
        import: importScanConfig,
        export: testing.fn().mockResolvedValue({}),
      },
      nvtfamilies: {
        get: getNvtFamilies,
      },
      nvt: {
        getConfigNvt,
      },
      scanners: {
        getAll: getScannersAll,
      },
      settings: {manualUrl: 'http://test/'},
      user: {
        currentSettings,
      },
      ...overrides,
    } as GmpObject,
    mocks: {
      getScanConfig,
      saveScanConfig,
      editScanConfigFamilySettings,
      saveScanConfigFamily,
      saveScanConfigNvt,
      importScanConfig,
      getNvtFamilies,
      getConfigNvt,
      getScannersAll,
    },
  };
};

const renderComponent = (
  gmpObj: GmpObject,
  extraProps: Record<string, unknown> = {},
): ReturnType<typeof testing.fn> => {
  const childFn = testing.fn().mockReturnValue(null);

  const {render} = rendererWith({
    gmp: gmpObj,
    capabilities: true,
    store: true,
    router: true,
  });

  render(<ScanConfigComponent {...extraProps}>{childFn}</ScanConfigComponent>);

  return childFn;
};

describe('createSelectedNvts', () => {
  test('should select all NVTs when count equals nvts length', () => {
    const configFamily: {nvts: {count: number}} = {nvts: {count: 2}};
    const nvts: FamilyNvt[] = [
      {oid: 1, name: 'NVT1', selected: NO_VALUE},
      {oid: 2, name: 'NVT2', selected: NO_VALUE},
    ];
    const result = createSelectedNvts(configFamily, nvts);
    expect(result).toEqual({1: YES_VALUE, 2: YES_VALUE});
  });

  test('should use individual selected values when count differs', () => {
    const configFamily: {nvts: {count: number}} = {nvts: {count: 1}};
    const nvts: FamilyNvt[] = [
      {oid: 1, name: 'NVT1', selected: YES_VALUE},
      {oid: 2, name: 'NVT2', selected: NO_VALUE},
    ];
    const result = createSelectedNvts(configFamily, nvts);
    expect(result).toEqual({1: YES_VALUE, 2: NO_VALUE});
  });

  test('should default to count 0 when configFamily is undefined', () => {
    const nvts: FamilyNvt[] = [
      {oid: 1, name: 'NVT1', selected: YES_VALUE},
      {oid: 2, name: 'NVT2', selected: NO_VALUE},
    ];
    const result = createSelectedNvts(undefined, nvts);
    expect(result).toEqual({1: YES_VALUE, 2: NO_VALUE});
  });
});

describe('ScanConfigComponent', () => {
  test('should expose create, edit, import, settings via children', () => {
    const {gmp} = createGmp();
    const childFn = renderComponent(gmp);

    expect(childFn).toHaveBeenCalled();
    const props = childFn.mock.lastCall?.[0] as Record<string, unknown>;
    expect(props.create).toBeDefined();
    expect(props.edit).toBeDefined();
    expect(props.import).toBeDefined();
    expect(props.settings).toBeDefined();
  });

  describe('openCreateConfigDialog / closeCreateConfigDialog', () => {
    test('should open create dialog and load scanners', async () => {
      const {gmp, mocks} = createGmp();
      const childFn = renderComponent(gmp);

      const props = childFn.mock.lastCall?.[0] as Record<
        string,
        (arg: unknown) => void
      >;
      const create = props.create as (arg: unknown) => void;
      create(undefined);

      await waitFor(() => {
        expect(mocks.getScannersAll).toHaveBeenCalled();
      });

      await screen.findByText('New Scan Config');
    });
  });

  describe('openEditConfigDialog / closeEditConfigDialog', () => {
    test('should open edit dialog and load config, families, scanners', async () => {
      const {gmp, mocks} = createGmp();
      const childFn = renderComponent(gmp);

      const props = childFn.mock.calls[0]?.[0] as Record<
        string,
        (arg: typeof config) => void
      >;
      const edit = props.edit as (arg: typeof config) => void;
      edit(config);

      await waitFor(() => {
        expect(mocks.getScanConfig).toHaveBeenCalledWith({id: 'c1'});
        expect(mocks.getNvtFamilies).toHaveBeenCalled();
        expect(mocks.getScannersAll).toHaveBeenCalled();
      });

      await screen.findByText('Edit Scan Config Test Config');
    });

    test('should close edit dialog via X button', async () => {
      const {gmp} = createGmp();
      const childFn = renderComponent(gmp);

      const props = childFn.mock.calls[0]?.[0] as Record<
        string,
        (arg: typeof config) => void
      >;
      const edit = props.edit as (arg: typeof config) => void;
      edit(config);

      await screen.findByText('Edit Scan Config Test Config');

      const closeButton = screen.getByTestId('dialog-close-button');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(
          screen.queryByText('Edit Scan Config Test Config'),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('handleSaveScanConfig', () => {
    test('should call save and close dialog', async () => {
      const {gmp, mocks} = createGmp();
      const childFn = renderComponent(gmp);

      const props = childFn.mock.calls[0]?.[0] as Record<
        string,
        (arg: typeof config) => void
      >;
      const edit = props.edit as (arg: typeof config) => void;
      edit(config);

      await screen.findByText('Edit Scan Config Test Config');

      const saveButton = screen.getByTestId('dialog-save-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mocks.saveScanConfig).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(
          screen.queryByText('Edit Scan Config Test Config'),
        ).not.toBeInTheDocument();
      });
    });

    test('should only save name and comment when config is in use', async () => {
      const {gmp} = createGmp({
        scanconfig: {
          get: testing.fn().mockResolvedValue({data: configInUse}),
          save: testing.fn().mockResolvedValue({}),
          editScanConfigFamilySettings: testing
            .fn()
            .mockResolvedValue({data: {nvts: familyNvts}}),
          saveScanConfigFamily: testing.fn().mockResolvedValue({}),
          saveScanConfigNvt: testing.fn().mockResolvedValue({}),
          import: testing.fn().mockResolvedValue({}),
          export: testing.fn().mockResolvedValue({}),
        },
      });

      const childFn = renderComponent(gmp);

      const props = childFn.mock.calls[0]?.[0] as Record<
        string,
        (arg: typeof configInUse) => void
      >;
      const edit = props.edit as (arg: typeof configInUse) => void;
      edit(configInUse);

      await screen.findByText('Edit Scan Config In-Use Config');

      const saveButton = screen.getByTestId('dialog-save-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(gmp.scanconfig.save).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'In-Use Config',
            comment: 'In use comment',
            id: 'c1',
          }),
        );
      });
    });
  });

  describe('openImportDialog / handleImportConfig', () => {
    test('should open import dialog', async () => {
      const {gmp} = createGmp();
      const childFn = renderComponent(gmp);

      const props = childFn.mock.lastCall?.[0] as Record<string, () => void>;
      const openImport = props.import as () => void;
      openImport();

      await screen.findByText('Import Scan Config');
    });
  });

  describe('openEditConfigFamilyDialog', () => {
    test('should open family dialog and load family settings', async () => {
      const {gmp, mocks} = createGmp();
      const childFn = renderComponent(gmp);

      const props = childFn.mock.calls[0]?.[0] as Record<
        string,
        (arg: typeof config) => void
      >;
      const edit = props.edit as (arg: typeof config) => void;
      edit(config);

      await screen.findByText('Edit Scan Config Test Config');

      const familyEditButtons = screen.getAllByTitle('Edit Scan Config Family');
      fireEvent.click(familyEditButtons[0]);

      await waitFor(() => {
        expect(mocks.editScanConfigFamilySettings).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'c1',
            familyName: 'family1',
          }),
        );
      });

      await screen.findByText('Edit Scan Config Family family1');
    });
  });

  describe('openEditNvtDetailsDialog', () => {
    test('should open NVT details dialog and load NVT', async () => {
      const {gmp, mocks} = createGmp();
      const childFn = renderComponent(gmp);

      const props = childFn.mock.calls[0]?.[0] as Record<
        string,
        (arg: typeof config) => void
      >;
      const edit = props.edit as (arg: typeof config) => void;
      edit(config);

      await screen.findByText('Edit Scan Config Test Config');

      const nvtEditButtons = screen.getAllByTitle(
        'Edit Scan Config NVT Details',
      );
      fireEvent.click(nvtEditButtons[0]);

      await waitFor(() => {
        expect(mocks.getConfigNvt).toHaveBeenCalledWith({
          configId: 'c1',
          oid: 'nvt-1',
        });
      });

      await screen.findByText('Edit Scan Config NVT NVT One');
    });
  });

  describe('handleSaveConfigFamily', () => {
    test('should save family, reload config, and close family dialog', async () => {
      const {gmp, mocks} = createGmp();
      const childFn = renderComponent(gmp);

      const props = childFn.mock.calls[0]?.[0] as Record<
        string,
        (arg: typeof config) => void
      >;
      const edit = props.edit as (arg: typeof config) => void;
      edit(config);

      await screen.findByText('Edit Scan Config Test Config');

      const familyEditButtons = screen.getAllByTitle('Edit Scan Config Family');
      fireEvent.click(familyEditButtons[0]);

      await screen.findByText('Edit Scan Config Family family1');

      const saveButtons = screen.getAllByTestId('dialog-save-button');
      fireEvent.click(saveButtons[saveButtons.length - 1]);

      await waitFor(() => {
        expect(mocks.saveScanConfigFamily).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'c1',
            familyName: 'family1',
          }),
        );
      });

      await waitFor(() => {
        expect(
          screen.queryByText('Edit Scan Config Family family1'),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('handleSaveConfigNvt', () => {
    test('should save NVT, reload family, and close NVT dialog', async () => {
      const {gmp, mocks} = createGmp();
      const childFn = renderComponent(gmp);

      const props = childFn.mock.calls[0]?.[0] as Record<
        string,
        (arg: typeof config) => void
      >;
      const edit = props.edit as (arg: typeof config) => void;
      edit(config);

      await screen.findByText('Edit Scan Config Test Config');

      const familyEditButtons = screen.getAllByTitle('Edit Scan Config Family');
      fireEvent.click(familyEditButtons[0]);

      await screen.findByText('Edit Scan Config Family family1');

      const nvtEditButtons = screen.getAllByTitle(
        'Select and edit NVT details',
      );
      fireEvent.click(nvtEditButtons[0]);

      await waitFor(() => {
        expect(mocks.getConfigNvt).toHaveBeenCalled();
      });

      await screen.findByText('Edit Scan Config NVT NVT One');

      const saveButtons = screen.getAllByTestId('dialog-save-button');
      fireEvent.click(saveButtons[saveButtons.length - 1]);

      await waitFor(() => {
        expect(mocks.saveScanConfigNvt).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'c1',
            oid: 'nvt-1',
          }),
        );
      });

      await waitFor(() => {
        expect(
          screen.queryByText('Edit Scan Config NVT NVT One'),
        ).not.toBeInTheDocument();
      });

      expect(
        screen.getByText('Edit Scan Config Family family1'),
      ).toBeInTheDocument();
    });

    test('should reload family with correct arguments after saving NVT (regression for GEA-1698)', async () => {
      const {gmp, mocks} = createGmp();
      const childFn = renderComponent(gmp);

      const props = childFn.mock.calls[0]?.[0] as Record<
        string,
        (arg: typeof config) => void
      >;
      const edit = props.edit as (arg: typeof config) => void;
      edit(config);

      await screen.findByText('Edit Scan Config Test Config');

      const familyEditButtons = screen.getAllByTitle('Edit Scan Config Family');
      fireEvent.click(familyEditButtons[0]);

      await screen.findByText('Edit Scan Config Family family1');

      const nvtEditButtons = screen.getAllByTitle(
        'Select and edit NVT details',
      );
      fireEvent.click(nvtEditButtons[0]);

      await screen.findByText('Edit Scan Config NVT NVT One');

      mocks.editScanConfigFamilySettings.mockClear();

      const saveButtons = screen.getAllByTestId('dialog-save-button');
      fireEvent.click(saveButtons[saveButtons.length - 1]);

      await waitFor(() => {
        expect(mocks.saveScanConfigNvt).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mocks.editScanConfigFamilySettings).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'c1',
            familyName: 'family1',
          }),
        );
      });

      await waitFor(() => {
        expect(
          screen.queryByText('Edit Scan Config NVT NVT One'),
        ).not.toBeInTheDocument();
      });

      expect(
        screen.getByText('Edit Scan Config Family family1'),
      ).toBeInTheDocument();
    });
  });

  describe('openSettingsConfigDialog', () => {
    test('should load config settings and open family dialog for Settings', async () => {
      const {gmp, mocks} = createGmp();

      const configWithSettings = ScanConfig.fromElement({
        _id: 'c1',
        name: 'Test Config',
        comment: 'A comment',
        creation_time: '2024-01-01T00:00:00Z',
        modification_time: '2024-01-02T00:00:00Z',
        owner: {name: 'admin'},
        writable: 1,
        in_use: 0,
        family_count: {__text: '1', growing: 0},
        families: {
          family: [
            {name: 'Settings', nvt_count: '1', max_nvt_count: '1', growing: 0},
          ],
        },
        preferences,
        permissions: {permission: [{name: 'everything'}]},
        scanner: {name: 'scanner', type: '42'},
        tasks: {task: []},
      });

      mocks.getScanConfig.mockResolvedValue({data: configWithSettings});

      const childFn = renderComponent(gmp);
      const props = childFn.mock.calls[0]?.[0] as Record<
        string,
        (arg: typeof configWithSettings) => void
      >;
      const settings = props.settings as (
        arg: typeof configWithSettings,
      ) => void;

      settings(configWithSettings);

      await waitFor(async () => {
        expect(mocks.getScanConfig).toHaveBeenCalledWith({id: 'c1'});
        expect(mocks.getNvtFamilies).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mocks.editScanConfigFamilySettings).toHaveBeenCalledWith(
          expect.objectContaining({
            familyName: 'Settings',
          }),
        );
      });
    });
  });

  describe('handleCloseEditNvtDetailsDialog', () => {
    test('should close NVT dialog without affecting family dialog', async () => {
      const {gmp} = createGmp();
      const childFn = renderComponent(gmp);

      const props = childFn.mock.calls[0]?.[0] as Record<
        string,
        (arg: typeof config) => void
      >;
      const edit = props.edit as (arg: typeof config) => void;
      edit(config);

      await screen.findByText('Edit Scan Config Test Config');

      const familyEditButtons = screen.getAllByTitle('Edit Scan Config Family');
      fireEvent.click(familyEditButtons[0]);

      await screen.findByText('Edit Scan Config Family family1');

      const nvtEditButtons = screen.getAllByTitle(
        'Select and edit NVT details',
      );
      fireEvent.click(nvtEditButtons[0]);

      await screen.findByText('Edit Scan Config NVT NVT One');

      const closeButtons = screen.getAllByTestId('dialog-close-button');
      fireEvent.click(closeButtons[closeButtons.length - 1]);

      await waitFor(() => {
        expect(
          screen.queryByText('Edit Scan Config NVT NVT One'),
        ).not.toBeInTheDocument();
      });

      expect(
        screen.getByText('Edit Scan Config Family family1'),
      ).toBeInTheDocument();
    });
  });
});
