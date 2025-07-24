/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen, wait} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import Filter from 'gmp/models/filter';
import Target from 'gmp/models/target';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import DetailsPage, {ToolBarIcons} from 'web/pages/targets/DetailsPage';
import {entityLoadingActions} from 'web/store/entities/targets';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const caps = new Capabilities(['everything']);

const reloadInterval = -1;
const manualUrl = 'test/';

let getTarget;
let getEntities;
let currentSettings;

beforeEach(() => {
  getTarget = testing.fn().mockResolvedValue({
    data: target,
  });

  getEntities = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  currentSettings = testing
    .fn()
    .mockResolvedValue(currentSettingsDefaultResponse);
});

const target = Target.fromElement({
  _id: '46264',
  name: 'target 1',
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
  alive_tests: 'Scan Config Default',
  allow_simultaneous_ips: 1,
  port_range: '1-5',
  krb5_credential: {
    _id: 'krb5_id',
    name: 'krb5',
    trash: '0',
  },
  ssh_credential: {
    _id: '1235',
    name: 'ssh',
    port: '22',
    trash: '0',
  },
  ssh_elevate_credential: {
    _id: '3456',
    name: 'ssh_elevate',
    trash: '0',
  },
  smb_credential: {
    _id: '4784',
    name: 'smb_credential',
  },
  esxi_credential: {
    _id: '',
    name: '',
    trash: '0',
  },
  snmp_credential: {
    _id: '',
    name: '',
    trash: '0',
  },
});

const targetInUse = Target.fromElement({
  _id: '46264',
  name: 'target 1',
  creation_time: '2020-12-23T14:14:11Z',
  modification_time: '2021-01-04T11:54:12Z',
  in_use: 1,
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
  alive_tests: 'Scan Config Default',
  allow_simultaneous_ips: 1,
  port_range: '1-5',
});

const noPermTarget = Target.fromElement({
  _id: '46264',
  name: 'target 1',
  creation_time: '2020-12-23T14:14:11Z',
  modification_time: '2021-01-04T11:54:12Z',
  in_use: 0,
  permissions: {permission: {name: 'get_targets'}},
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
  alive_tests: 'Scan Config Default',
  allow_simultaneous_ips: 1,
  port_range: '1-5',
});

describe('Target DetailsPage tests', () => {
  test('should render full DetailsPage', () => {
    const gmp = {
      target: {
        get: getTarget,
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('46264', target));

    const {baseElement} = render(<DetailsPage id="46264" />);

    expect(baseElement).toHaveTextContent('Target: target 1');

    const links = baseElement.querySelectorAll('a');

    expect(screen.getAllByTitle('Help: Targets')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-targets',
    );

    expect(screen.getAllByTitle('Target List')[0]).toBeInTheDocument();
    expect(links[1]).toHaveAttribute('href', '/targets');

    expect(baseElement).toHaveTextContent('ID:46264');
    expect(baseElement).toHaveTextContent(
      'Created:Wed, Dec 23, 2020 3:14 PM Central European Standard',
    );
    expect(baseElement).toHaveTextContent(
      'Modified:Mon, Jan 4, 2021 12:54 PM Central European Standard',
    );
    expect(baseElement).toHaveTextContent('Owner:admin');

    const spans = baseElement.querySelectorAll('span');
    expect(spans[9]).toHaveTextContent('User Tags');
    expect(spans[11]).toHaveTextContent('Permissions');

    expect(baseElement).toHaveTextContent('Included');
    expect(baseElement).toHaveTextContent('127.0.0.1');
    expect(baseElement).toHaveTextContent('123.456.574.64');

    expect(baseElement).toHaveTextContent('Excluded');
    expect(baseElement).toHaveTextContent('192.168.0.1');

    expect(baseElement).toHaveTextContent('Maximum Number of Hosts');
    expect(baseElement).toHaveTextContent('2');

    expect(baseElement).toHaveTextContent('Reverse Lookup Only');
    expect(baseElement).toHaveTextContent('Yes');

    expect(baseElement).toHaveTextContent('Reverse Lookup Unify');
    expect(baseElement).toHaveTextContent('No');

    expect(baseElement).toHaveTextContent('Alive Test');
    expect(baseElement).toHaveTextContent('Scan Config Default');

    expect(baseElement).toHaveTextContent('Port List');
    expect(links[2]).toHaveAttribute('href', '/portlist/32323');
    expect(baseElement).toHaveTextContent('All IANA assigned TCP');

    expect(baseElement).toHaveTextContent('Credentials');

    expect(baseElement).toHaveTextContent('SSH');
    expect(baseElement).toHaveTextContent('ssh');
    expect(links[3]).toHaveAttribute('href', '/credential/1235');
    expect(baseElement).toHaveTextContent('on Port 22');

    expect(baseElement).toHaveTextContent('SSH elevate credential');
    expect(baseElement).toHaveTextContent('ssh_elevate');
    expect(links[4]).toHaveAttribute('href', '/credential/3456');

    expect(baseElement).toHaveTextContent('SMB (NTLM)');
    expect(baseElement).toHaveTextContent('smb_credential');
    expect(links[5]).toHaveAttribute('href', '/credential/4784');

    expect(baseElement).toHaveTextContent('Tasks using this Target (1)');
    expect(links[6]).toHaveAttribute('href', '/task/465');
    expect(baseElement).toHaveTextContent('foo');
  });

  test('should render full DetailsPage with Kerberos, when KRB5 is enabled', () => {
    const gmp = {
      target: {
        get: getTarget,
      },
      permissions: {
        get: getEntities,
      },
      settings: {
        manualUrl,
        reloadInterval,
        enableKrb5: true,
      },
      user: {
        currentSettings,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('46264', target));

    const {baseElement} = render(<DetailsPage id="46264" />);
    const kerberosLink = baseElement.querySelectorAll('a')[5];

    expect(baseElement).toHaveTextContent('SMB (Kerberos)');
    expect(baseElement).toHaveTextContent('krb5');
    expect(kerberosLink).toHaveAttribute('href', '/credential/krb5_id');
  });

  test('should render user tags tab', () => {
    const gmp = {
      target: {
        get: getTarget,
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', target));

    const {baseElement} = render(<DetailsPage id="12345" />);

    const spans = baseElement.querySelectorAll('span');
    expect(spans[9]).toHaveTextContent('User Tags');

    fireEvent.click(spans[9]);

    expect(baseElement).toHaveTextContent('No user tags available');
  });

  test('should render permissions tab', () => {
    const gmp = {
      target: {
        get: getTarget,
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('46264', target));

    const {baseElement} = render(<DetailsPage id="46264" />);

    const spans = baseElement.querySelectorAll('span');
    expect(spans[11]).toHaveTextContent('Permissions');

    fireEvent.click(spans[11]);

    expect(baseElement).toHaveTextContent('No permissions available');
  });

  test('should call commands', async () => {
    const clone = testing.fn().mockResolvedValue({
      data: {id: 'foo'},
    });

    const deleteFunc = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportFunc = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      target: {
        get: getTarget,
        clone,
        delete: deleteFunc,
        export: exportFunc,
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('46264', target));

    render(<DetailsPage id="46264" />);

    await wait();

    const cloneIcon = screen.getAllByTitle('Clone Target');
    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);

    await wait();

    expect(clone).toHaveBeenCalledWith(target);

    const exportIcon = screen.getAllByTitle('Export Target as XML');
    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    await wait();

    expect(exportFunc).toHaveBeenCalledWith(target);

    const deleteIcon = screen.getAllByTitle('Move Target to trashcan');
    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    await wait();

    expect(deleteFunc).toHaveBeenCalledWith({id: target.id});
  });
});

describe('Target ToolBarIcons tests', () => {
  test('should render', () => {
    const handleTargetCloneClick = testing.fn();
    const handleTargetDeleteClick = testing.fn();
    const handleTargetDownloadClick = testing.fn();
    const handleTargetEditClick = testing.fn();
    const handleTargetCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons
        entity={target}
        onTargetCloneClick={handleTargetCloneClick}
        onTargetCreateClick={handleTargetCreateClick}
        onTargetDeleteClick={handleTargetDeleteClick}
        onTargetDownloadClick={handleTargetDownloadClick}
        onTargetEditClick={handleTargetEditClick}
      />,
    );

    const links = element.querySelectorAll('a');

    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-targets',
    );
    expect(screen.getAllByTitle('Help: Targets')[0]).toBeInTheDocument();

    expect(links[1]).toHaveAttribute('href', '/targets');
    expect(screen.getAllByTitle('Target List')[0]).toBeInTheDocument();
  });

  test('should call click handlers', () => {
    const handleTargetCloneClick = testing.fn();
    const handleTargetDeleteClick = testing.fn();
    const handleTargetDownloadClick = testing.fn();
    const handleTargetEditClick = testing.fn();
    const handleTargetCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={target}
        onTargetCloneClick={handleTargetCloneClick}
        onTargetCreateClick={handleTargetCreateClick}
        onTargetDeleteClick={handleTargetDeleteClick}
        onTargetDownloadClick={handleTargetDownloadClick}
        onTargetEditClick={handleTargetEditClick}
      />,
    );

    const cloneIcon = screen.getAllByTitle('Clone Target');
    const editIcon = screen.getAllByTitle('Edit Target');
    const deleteIcon = screen.getAllByTitle('Move Target to trashcan');
    const exportIcon = screen.getAllByTitle('Export Target as XML');

    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);
    expect(handleTargetCloneClick).toHaveBeenCalledWith(target);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);
    expect(handleTargetEditClick).toHaveBeenCalledWith(target);

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);
    expect(handleTargetDeleteClick).toHaveBeenCalledWith(target);

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);
    expect(handleTargetDownloadClick).toHaveBeenCalledWith(target);
  });

  test('should not call click handlers without permission', () => {
    const handleTargetCloneClick = testing.fn();
    const handleTargetDeleteClick = testing.fn();
    const handleTargetDownloadClick = testing.fn();
    const handleTargetEditClick = testing.fn();
    const handleTargetCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={noPermTarget}
        onTargetCloneClick={handleTargetCloneClick}
        onTargetCreateClick={handleTargetCreateClick}
        onTargetDeleteClick={handleTargetDeleteClick}
        onTargetDownloadClick={handleTargetDownloadClick}
        onTargetEditClick={handleTargetEditClick}
      />,
    );

    const cloneIcon = screen.getAllByTitle('Clone Target');
    const editIcon = screen.getAllByTitle('Permission to edit Target denied');
    const deleteIcon = screen.getAllByTitle(
      'Permission to move Target to trashcan denied',
    );
    const exportIcon = screen.getAllByTitle('Export Target as XML');

    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);

    expect(handleTargetCloneClick).toHaveBeenCalledWith(noPermTarget);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);

    expect(handleTargetEditClick).not.toHaveBeenCalled();

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    expect(handleTargetDeleteClick).not.toHaveBeenCalled();

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    expect(handleTargetDownloadClick).toHaveBeenCalledWith(noPermTarget);
  });

  test('should (not) call click handlers for target in use', () => {
    const handleTargetCloneClick = testing.fn();
    const handleTargetDeleteClick = testing.fn();
    const handleTargetDownloadClick = testing.fn();
    const handleTargetEditClick = testing.fn();
    const handleTargetCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={targetInUse}
        onTargetCloneClick={handleTargetCloneClick}
        onTargetCreateClick={handleTargetCreateClick}
        onTargetDeleteClick={handleTargetDeleteClick}
        onTargetDownloadClick={handleTargetDownloadClick}
        onTargetEditClick={handleTargetEditClick}
      />,
    );
    const cloneIcon = screen.getAllByTitle('Clone Target');
    const editIcon = screen.getAllByTitle('Edit Target');
    const deleteIcon = screen.getAllByTitle('Target is still in use');
    const exportIcon = screen.getAllByTitle('Export Target as XML');

    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);

    expect(handleTargetCloneClick).toHaveBeenCalledWith(targetInUse);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);

    expect(handleTargetEditClick).toHaveBeenCalled();

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);
    expect(handleTargetDeleteClick).not.toHaveBeenCalled();

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    expect(handleTargetDownloadClick).toHaveBeenCalledWith(targetInUse);
  });
});
