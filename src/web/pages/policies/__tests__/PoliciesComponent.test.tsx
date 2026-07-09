/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen, wait} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import Policy from 'gmp/models/policy';
import {createSession} from 'gmp/testing';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import PoliciesComponent from 'web/pages/policies/PoliciesComponent';

const createPolicy = (): Policy =>
  new Policy({
    id: 'policy-1',
    name: 'Policy One',
    comment: 'A policy used for tests',
    inUse: false,
    families: {},
    preferences: {
      nvt: [],
      scanner: [],
    },
  });

const createScannersAllResponse = () => ({
  data: [
    {
      id: 'scanner-1',
    },
  ],
});

const createGmp = ({
  currentSettings = testing
    .fn()
    .mockResolvedValue(currentSettingsDefaultResponse),
  getAlerts = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
  getScanners = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
  getScannersAll = testing.fn().mockResolvedValue(createScannersAllResponse()),
  getSchedules = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
  getTargets = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
  getPolicy = testing.fn().mockResolvedValue({
    data: createPolicy(),
  }),
  getNvtFamilies = testing.fn().mockResolvedValue({
    data: [],
  }),
} = {}) => ({
  alerts: {
    get: getAlerts,
  },
  scanners: {
    get: getScanners,
    getAll: getScannersAll,
  },
  schedules: {
    get: getSchedules,
  },
  targets: {
    get: getTargets,
  },
  nvtfamilies: {
    get: getNvtFamilies,
  },
  policy: {
    clone: testing.fn().mockResolvedValue({data: {id: 'cloned-id'}}),
    create: testing.fn().mockResolvedValue({data: {id: 'created-id'}}),
    delete: testing.fn().mockResolvedValue({}),
    export: testing.fn().mockResolvedValue({}),
    get: getPolicy,
    import: testing.fn().mockResolvedValue({}),
    save: testing.fn().mockResolvedValue({}),
    editPolicyFamilySettings: testing.fn().mockResolvedValue({
      data: {nvts: []},
    }),
    savePolicyFamily: testing.fn().mockResolvedValue({}),
    savePolicyNvt: testing.fn().mockResolvedValue({}),
  },
  nvt: {
    getConfigNvt: testing.fn().mockResolvedValue({
      data: {
        defaultTimeout: '0',
        family: 'General',
        modificationTime: '2024-01-01T00:00:00Z',
        name: 'NVT',
        oid: '1.3.6.1.4.1.25623.1.0.1',
        preferences: [],
        severity: 0,
        tags: {
          affected: '',
          cvss_base_vector: '',
          summary: '',
        },
        timeout: '0',
      },
    }),
  },
  audit: {
    create: testing.fn().mockResolvedValue({data: {id: 'audit-id'}}),
  },
  settings: {
    manualUrl: 'test/',
  },
  session: createSession(),
  user: {
    currentSettings,
  },
});

describe('PoliciesComponent tests', () => {
  test('should open create and import dialogs from render props', () => {
    const gmp = createGmp();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    render(
      <PoliciesComponent>
        {({create, import: importPolicy}) => (
          <>
            <button onClick={create}>Open Create Dialog</button>
            <button onClick={importPolicy}>Open Import Dialog</button>
          </>
        )}
      </PoliciesComponent>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Open Create Dialog'}));
    expect(screen.getDialogTitle()).toHaveTextContent('New Policy');

    fireEvent.click(screen.getDialogCloseButton());

    fireEvent.click(screen.getByRole('button', {name: 'Open Import Dialog'}));
    expect(screen.getDialogTitle()).toHaveTextContent('Import Policy');
  });

  test('should open edit policy dialog and load related data', async () => {
    const getPolicy = testing.fn().mockResolvedValue({data: createPolicy()});
    const getNvtFamilies = testing.fn().mockResolvedValue({data: []});
    const getScannersAll = testing
      .fn()
      .mockResolvedValue(createScannersAllResponse());

    const gmp = createGmp({
      getPolicy,
      getNvtFamilies,
      getScannersAll,
    });

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    render(
      <PoliciesComponent>
        {({edit}) => (
          <button onClick={() => edit(createPolicy())}>Open Edit Dialog</button>
        )}
      </PoliciesComponent>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Open Edit Dialog'}));

    await wait();

    expect(getPolicy).toHaveBeenCalledWith({id: 'policy-1'});
    expect(getNvtFamilies).toHaveBeenCalled();
    expect(getScannersAll).toHaveBeenCalled();
    expect(screen.getDialogTitle()).toHaveTextContent('Edit Policy Policy One');
  });

  test('should open create audit dialog and load related data', async () => {
    const getAlerts = testing.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: Filter.fromString(),
        counts: new CollectionCounts(),
      },
    });
    const getScanners = testing.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: Filter.fromString(),
        counts: new CollectionCounts(),
      },
    });
    const getSchedules = testing.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: Filter.fromString(),
        counts: new CollectionCounts(),
      },
    });
    const getTargets = testing.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: Filter.fromString(),
        counts: new CollectionCounts(),
      },
    });

    const gmp = createGmp({
      getAlerts,
      getScanners,
      getSchedules,
      getTargets,
    });

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    render(
      <PoliciesComponent>
        {({createAudit}) => (
          <button onClick={() => createAudit(createPolicy())}>
            Open Create Audit Dialog
          </button>
        )}
      </PoliciesComponent>,
    );

    fireEvent.click(
      screen.getByRole('button', {name: 'Open Create Audit Dialog'}),
    );

    await wait();

    expect(getAlerts).toHaveBeenCalled();
    expect(getScanners).toHaveBeenCalled();
    expect(getSchedules).toHaveBeenCalled();
    expect(getTargets).toHaveBeenCalled();
    expect(screen.getDialogTitle()).toHaveTextContent('New Audit');
  });
});
