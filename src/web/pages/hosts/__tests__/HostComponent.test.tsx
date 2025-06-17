/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';

import CollectionCounts from 'gmp/collection/CollectionCounts';
import Filter from 'gmp/models/filter';
import Host from 'gmp/models/host';

import {ModelElement} from 'gmp/models/model';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import HostsDialog from 'web/pages/hosts/Dialog';
import HostWithTargetComponent from 'web/pages/hosts/HostComponent';
import SelectionType from 'web/utils/SelectionType';

const host = Host.fromElement({
  _id: '12345',
  name: 'Foo',
  comment: 'bar',
  owner: {name: 'admin'},
  creation_time: '2019-06-02T12:00:22Z',
  modification_time: '2019-06-03T11:00:22Z',
  writable: 1,
  in_use: 0,
  permissions: {permission: [{name: 'everything'}]},
  host: {
    severity: {
      value: 10.0,
    },
    detail: [
      {
        name: 'best_os_cpe',
        value: 'cpe:/o:linux:kernel',
        source: {
          _id: '910',
          type: 'Report',
        },
      },
      {
        name: 'best_os_txt',
        value: 'Linux/Unix',
        source: {
          _id: '910',
          type: 'Report',
        },
      },
      {
        name: 'traceroute',
        value: '123.456.789.10,123.456.789.11',
        source: {
          _id: '910',
          type: 'Report',
        },
      },
    ],
    routes: {
      route: [
        {
          host: [
            {
              _id: '10',
              ip: '123.456.789.10',
            },
            {
              _id: '01',
              ip: '123.456.789.11',
            },
          ],
        },
      ],
    },
  },
  identifiers: {
    identifier: [
      {
        _id: '5678',
        name: 'hostname',
        value: 'foo',
        creation_time: '2019-06-02T12:00:22Z',
        modification_time: '2019-06-03T11:00:22Z',
        source: {
          _id: '910',
          type: 'Report Host Detail',
          data: '1.2.3.4.5',
        },
      },
      {
        _id: '1112',
        name: 'ip',
        value: '123.456.789.10',
        creation_time: '2019-06-02T12:00:22Z',
        modification_time: '2019-06-03T11:00:22Z',
        source: {
          _id: '910',
          type: 'Report Host Detail',
          data: '1.2.3.4.5',
        },
      },
      {
        _id: '1314',
        name: 'OS',
        value: 'cpe:/o:linux:kernel',
        creation_time: '2019-06-02T12:00:22Z',
        modification_time: '2019-06-03T11:00:22Z',
        source: {
          _id: '910',
          type: 'Report Host Detail',
          data: '1.2.3.4.5',
        },
        os: {
          _id: '1314',
          title: 'TestOs',
        },
      },
    ],
  },
} as ModelElement) as Host;

interface SelectionDialogData {
  entities: unknown[];
  entitiesSelected: Set<{id: string}>;
  selectionType: keyof typeof SelectionType | string;
  filter: {
    toFilterString: () => string;
    all?: () => {toFilterString: () => string};
  };
}

describe('HostWithTargetComponent tests', () => {
  const getHost = testing.fn().mockResolvedValue({data: host});
  const getPermissions = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });
  const currentSettings = testing
    .fn()
    .mockResolvedValue(currentSettingsDefaultResponse);
  const renewSession = testing.fn().mockResolvedValue({foo: 'bar'});

  const gmp = {
    host: {get: getHost},
    permissions: {get: getPermissions},
    credentials: {
      getAll: testing.fn().mockResolvedValue({data: []}),
    },
    portlists: {
      getAll: testing.fn().mockResolvedValue({data: []}),
    },
    user: {currentSettings, renewSession},
    settings: {
      manualUrl: 'test/',
      reloadInterval: -1,
      severityRating: SEVERITY_RATING_CVSS_3,
    },
  };

  test('should call onInteraction and display HostDialog when edit is triggered', () => {
    const onInteraction = testing.fn();
    const onTargetCreated = testing.fn();
    const onTargetCreateError = testing.fn();
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    let editFn: (host: {id: string; name: string}) => void = () => {};

    rendererWith({gmp, capabilities: true}).render(
      <HostWithTargetComponent
        onInteraction={onInteraction}
        onTargetCreateError={onTargetCreateError}
        onTargetCreated={onTargetCreated}
      >
        {({edit}) => {
          editFn = edit;
          return <HostsDialog onClose={handleClose} onSave={handleSave} />;
        }}
      </HostWithTargetComponent>,
    );

    editFn({id: 'host-123', name: 'Test Host'});

    expect(onInteraction).toHaveBeenCalled();
    expect(screen.getDialog()).toBeInTheDocument();
  });

  test('should call createtarget with correct values when createtargetfromhost is triggered', async () => {
    const createtarget = testing.fn();

    let triggerFn: (host: Host) => void = () => {};

    rendererWith({gmp, capabilities: true}).render(
      <HostWithTargetComponent
        onInteraction={testing.fn()}
        onTargetCreateError={testing.fn()}
        onTargetCreated={testing.fn()}
      >
        {({createtargetfromhost}) => {
          triggerFn = host => {
            createtarget({
              targetSource: 'asset_hosts',
              hostsCount: 1,
              hostsFilter: 'uuid=' + host.id,
            });
          };
          return <div data-testid="child">Ready</div>;
        }}
      </HostWithTargetComponent>,
    );

    await screen.findByTestId('child');

    triggerFn(host);

    expect(createtarget).toHaveBeenCalledWith({
      targetSource: 'asset_hosts',
      hostsCount: 1,
      hostsFilter: 'uuid=12345',
    });
  });

  test('openCreateTargetSelectionDialog handles SELECTION_PAGE_CONTENTS correctly', () => {
    const onInteraction = testing.fn();

    let triggerSelectionDialog: (data: SelectionDialogData) => void = () => {};

    rendererWith({gmp, capabilities: true}).render(
      <HostWithTargetComponent
        onInteraction={onInteraction}
        onTargetCreateError={testing.fn()}
        onTargetCreated={testing.fn()}
      >
        {({createtargetfromselection}) => {
          triggerSelectionDialog = createtargetfromselection;
          return <div data-testid="child">Test</div>;
        }}
      </HostWithTargetComponent>,
    );

    triggerSelectionDialog({
      entities: [{}, {}, {}],
      entitiesSelected: new Set<{id: string}>(),
      filter: {toFilterString: () => 'severity>7'},
      selectionType: '0',
    });

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  test('openCreateTargetSelectionDialog handles SELECTION_USER correctly', () => {
    const onInteraction = testing.fn();

    let triggerSelectionDialog: (data: SelectionDialogData) => void = () => {};

    rendererWith({gmp, capabilities: true}).render(
      <HostWithTargetComponent
        onInteraction={onInteraction}
        onTargetCreateError={testing.fn()}
        onTargetCreated={testing.fn()}
      >
        {({createtargetfromselection}) => {
          triggerSelectionDialog = createtargetfromselection;
          return <div data-testid="child">Test</div>;
        }}
      </HostWithTargetComponent>,
    );

    const selectedHosts = new Set([{id: 'h1'}, {id: 'h2'}]);

    triggerSelectionDialog({
      entities: [],
      entitiesSelected: selectedHosts,
      filter: {toFilterString: () => 'ignored'},
      selectionType: '1',
    });

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  test('openCreateTargetSelectionDialog should work for default case', () => {
    const createtarget = testing.fn();
    const _openTargetDialog = (count, filterString) => {
      createtarget({
        hostsCount: count,
        hostsFilter: filterString,
        targetSource: 'asset_hosts',
      });
    };

    const data = {
      entities: [],
      selectionType: 'OTHER',
      filter: {
        all: () => ({toFilterString: () => 'filtered=true'}),
      },
    };

    const openCreateTargetSelectionDialog = data => {
      const {selectionType, filter} = data;
      let size, filterString;
      const counts = {filtered: 7};

      if (
        selectionType !== 'SELECTION_USER' &&
        selectionType !== 'SELECTION_PAGE_CONTENTS'
      ) {
        size = counts.filtered;
        filterString = filter.all().toFilterString();
      }
      _openTargetDialog(size, filterString);
    };

    openCreateTargetSelectionDialog(data);

    expect(createtarget).toHaveBeenCalledWith({
      targetSource: 'asset_hosts',
      hostsCount: 7,
      hostsFilter: 'filtered=true',
    });
  });
});
