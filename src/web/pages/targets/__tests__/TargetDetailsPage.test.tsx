/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import Target, {ICMP_PING, TCP_SYN} from 'gmp/models/target';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import TargetDetailsPage from 'web/pages/targets/TargetDetailsPage';
import {entityLoadingActions} from 'web/store/entities/targets';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const target = Target.fromElement({
  _id: '46264',
  name: 'target 1',
  comment: 'some comment',
  creation_time: '2020-12-23T14:14:11Z',
  modification_time: '2021-01-04T11:54:12Z',
  in_use: 0,
  permissions: {permission: {name: 'Everything'}},
  owner: {name: 'admin'},
  writable: 1,
  port_list: {
    _id: '32323',
    name: 'All IANA assigned TCP',
    trash: 0,
  },
  hosts: '127.0.0.1, 123.456.574.64',
  exclude_hosts: '192.168.0.1',
  max_hosts: 2,
  reverse_lookup_only: 1,
  reverse_lookup_unify: 0,
  tasks: {task: {_id: '465', name: 'foo'}},
  alive_tests: {
    alive_test: [ICMP_PING, TCP_SYN],
  },
  allow_simultaneous_ips: 1,
  krb5_credential: {
    _id: 'krb5_id',
    name: 'krb5',
  },
  ssh_credential: {
    _id: '1235',
    name: 'ssh',
    port: 22,
  },
  ssh_elevate_credential: {
    _id: '3456',
    name: 'ssh_elevate',
  },
  smb_credential: {
    _id: '4784',
    name: 'smb_credential',
  },
  esxi_credential: {
    _id: '',
    name: '',
  },
  snmp_credential: {
    _id: '',
    name: '',
  },
});

const createGmp = (settings = {}) => {
  return {
    target: {
      get: testing.fn().mockResolvedValue({
        data: target,
      }),
      clone: testing.fn().mockResolvedValue({
        data: {id: 'foo'},
      }),
      delete: testing.fn().mockResolvedValue({
        foo: 'bar',
      }),
      export: testing.fn().mockResolvedValue({
        foo: 'bar',
      }),
    },
    permissions: {
      get: testing.fn().mockResolvedValue({
        data: [],
        meta: {
          filter: Filter.fromString(),
          counts: new CollectionCounts(),
        },
      }),
    },
    settings: {
      manualUrl: 'test/',
      reloadInterval: -1,
      ...settings,
    },
    user: {
      currentSettings: testing
        .fn()
        .mockResolvedValue(currentSettingsDefaultResponse),
    },
  };
};

describe('TargetDetailsPage tests', () => {
  test('should render full DetailsPage', () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('46264', target));

    render(<TargetDetailsPage id="46264" />);

    screen.getByTitle('Help: Targets');
    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-targets',
    );

    screen.getByTitle('Target List');
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/targets',
    );

    const entityInfo = screen.getByTestId('entity-info');
    expect(entityInfo).toHaveTextContent('ID:46264');
    expect(entityInfo).toHaveTextContent(
      'Created:Wed, Dec 23, 2020 3:14 PM Central European Standard',
    );
    expect(entityInfo).toHaveTextContent(
      'Modified:Mon, Jan 4, 2021 12:54 PM Central European Standard',
    );
    expect(entityInfo).toHaveTextContent('Owner:admin');

    const tablist = screen.getByRole('tablist');
    within(tablist).getByRole('tab', {name: /^information/i});
    within(tablist).getByRole('tab', {name: /^user tags/i});
    within(tablist).getByRole('tab', {name: /^permissions/i});

    screen.getByText('target 1');
    screen.getByText('some comment');
    screen.getByText('127.0.0.1');
    screen.getByText('123.456.574.64');
    screen.getByText('192.168.0.1');
    screen.getByText(/allow simultaneous scanning via multiple ips/i);
    screen.getByText('Maximum Number of Hosts');
    screen.getByText('Reverse Lookup Only');
    screen.getByText('Reverse Lookup Unify');
    screen.getByText(/icmp ping/i);
    screen.getByText(/IANA/i);
    expect(
      screen.getByRole('link', {name: /iana assigned tcp/i}),
    ).toHaveAttribute('href', '/port-list/32323');

    // SSH credential section
    expect(screen.getByRole('link', {name: 'ssh'})).toHaveAttribute(
      'href',
      '/credential/1235',
    );

    screen.getByText('ssh_elevate');
    expect(screen.getByRole('link', {name: /^ssh_elevate/i})).toHaveAttribute(
      'href',
      '/credential/3456',
    );

    screen.getByText('smb_credential');
    expect(
      screen.getByRole('link', {name: /^smb_credential/i}),
    ).toHaveAttribute('href', '/credential/4784');

    screen.getByText(/tasks using this target/i);

    expect(screen.getByRole('link', {name: /^foo/i})).toHaveAttribute(
      'href',
      '/task/465',
    );
  });

  test('should render full DetailsPage with Kerberos, when KRB5 is enabled', () => {
    const gmp = createGmp({enableKrb5: true});
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('46264', target));

    render(<TargetDetailsPage id="46264" />);

    screen.getByText('krb5');
    expect(screen.getByRole('link', {name: /^krb5/i})).toHaveAttribute(
      'href',
      '/credential/krb5_id',
    );
  });

  test('should render user tags tab', () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', target));

    const {container} = render(<TargetDetailsPage id="12345" />);

    const tablist = screen.getByRole('tablist');
    const userTagsTab = within(tablist).getByRole('tab', {name: /^user tags/i});
    fireEvent.click(userTagsTab);
    expect(container).toHaveTextContent('No user tags available');
  });

  test('should render permissions tab', () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('46264', target));

    const {container} = render(<TargetDetailsPage id="46264" />);

    const tablist = screen.getByRole('tablist');
    const permissionsTab = within(tablist).getByRole('tab', {
      name: /^permissions/i,
    });
    fireEvent.click(permissionsTab);
    expect(container).toHaveTextContent('No permissions available');
  });

  test('should call commands', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('46264', target));

    render(<TargetDetailsPage id="46264" />);

    const cloneIcon = await screen.findByTitle('Clone Target');
    fireEvent.click(cloneIcon);
    expect(gmp.target.clone).toHaveBeenCalledWith(target);

    const exportIcon = screen.getByTitle('Export Target as XML');
    fireEvent.click(exportIcon);
    expect(gmp.target.export).toHaveBeenCalledWith(target);

    const deleteIcon = screen.getByTitle('Move Target to trashcan');
    fireEvent.click(deleteIcon);
    expect(gmp.target.delete).toHaveBeenCalledWith({id: target.id});
  });
});
