/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';
import Filter from 'gmp/models/filter';
import Policy from 'gmp/models/policy';
import {vi} from 'vitest';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import Detailspage, {ToolBarIcons} from 'web/pages/policies/DetailsPage';
import {entityLoadingActions} from 'web/store/entities/policies';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {rendererWith, fireEvent, act} from 'web/utils/Testing';

vi.mock('web/pages/scanconfigs/EditDialog', () => ({
  default: () => null,
}));

const families = [
  {
    name: 'family1',
    nvt_count: '1',
    max_nvt_count: '1',
    growing: 1,
  },
  {
    name: 'family2',
    nvt_count: '2',
    max_nvt_count: '4',
    growing: 0,
  },
  {
    name: 'family3',
    nvt_count: '0',
    max_nvt_count: '2',
    growing: 0,
  },
];

const preferences = {
  preference: [
    {
      name: 'preference0',
      hr_name: 'preference0',
      id: '0',
      value: 'yes',
      type: 'checkbox',
      default: 'no',
      nvt: {
        _oid: '0',
        name: 'nvt0',
      },
    },
    {
      name: 'preference1',
      hr_name: 'preference1',
      id: '1',
      value: 'value2',
      type: 'radio',
      default: 'value1',
      alt: ['value2', 'value3'],
      nvt: {
        _oid: '1',
        name: 'nvt1',
      },
    },
    {
      name: 'preference2',
      hr_name: 'preference2',
      id: '2',
      type: 'entry',
      value: 'foo',
      default: 'bar',
      nvt: {
        _oid: '2',
        name: 'nvt2',
      },
    },
    {
      name: 'scannerpref0',
      hr_name: 'Scanner Preference 1',
      value: 0,
      default: 0,
      nvt: {},
    },
  ],
};

const policy = Policy.fromElement({
  _id: '12345',
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  owner: {name: 'admin'},
  writable: '1',
  in_use: '0',
  usage_type: 'policy',
  family_count: {growing: 1},
  families: {family: families},
  preferences: preferences,
  permissions: {permission: [{name: 'everything'}]},
  scanner: {name: 'scanner', type: '42'},
  tasks: {
    task: [
      {id: '1234', name: 'audit1'},
      {id: '5678', name: 'audit2'},
    ],
  },
});

const policyId = {
  id: '12345',
};

const policy2 = Policy.fromElement({
  _id: '12345',
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  owner: {name: 'user'},
  writable: '1',
  in_use: '0',
  usage_type: 'policy',
  family_count: {growing: 1},
  families: {family: families},
  preferences: preferences,
  permissions: {permission: [{name: 'get_config'}]},
  scanner: {name: 'scanner', type: '42'},
  tasks: {
    task: [
      {id: '1234', name: 'audit1'},
      {id: '5678', name: 'audit2'},
    ],
  },
});

const policy3 = Policy.fromElement({
  _id: '12345',
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  owner: {name: 'user'},
  writable: '1',
  in_use: '1',
  usage_type: 'policy',
  family_count: {growing: 1},
  families: {family: families},
  preferences: preferences,
  permissions: {permission: [{name: 'everything'}]},
  scanner: {name: 'scanner', type: '42'},
  tasks: {
    task: [
      {id: '1234', name: 'audit1'},
      {id: '5678', name: 'audit2'},
    ],
  },
});

const policy4 = Policy.fromElement({
  _id: '12345',
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  owner: {name: 'user'},
  writable: '0',
  in_use: '0',
  usage_type: 'policy',
  family_count: {growing: 1},
  families: {family: families},
  preferences: preferences,
  permissions: {permission: [{name: 'everything'}]},
  scanner: {name: 'scanner', type: '42'},
  tasks: {
    task: [
      {id: '1234', name: 'audit1'},
      {id: '5678', name: 'audit2'},
    ],
  },
});

const scanners = [{name: 'scanner1'}, {name: 'scanner2'}];

const caps = new Capabilities(['everything']);

const entityType = 'policy';
const reloadInterval = 1;
const manualUrl = 'test/';

const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);

const renewSession = testing.fn().mockResolvedValue({
  foo: 'bar',
});

const getPermissions = testing.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

describe('Policy Detailspage tests', () => {
  test('should render full Detailspage', () => {
    const getPolicy = testing.fn().mockResolvedValue({
      data: policy,
    });

    const gmp = {
      [entityType]: {
        get: getPolicy,
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

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', policy));

    const {baseElement, getAllByTestId} = render(<Detailspage id="12345" />);

    expect(baseElement).toBeVisible();
    expect(baseElement).toHaveTextContent('Policy: foo');

    const links = baseElement.querySelectorAll('a');
    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: Policies');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/compliance-and-special-scans.html#configuring-and-managing-policies',
    );

    expect(links[1]).toHaveAttribute('href', '/policies');
    expect(icons[1]).toHaveAttribute('title', 'Policies List');

    expect(baseElement).toHaveTextContent('12345');
    expect(baseElement).toHaveTextContent('Tue, Jul 16, 2019 8:31 AM CEST');
    expect(baseElement).toHaveTextContent('Tue, Jul 16, 2019 8:44 AM CEST');
    expect(baseElement).toHaveTextContent('admin');

    expect(baseElement).toHaveTextContent('bar');
    expect(baseElement).toHaveTextContent('audit1');
    expect(baseElement).toHaveTextContent('audit2');
    expect(baseElement).not.toHaveTextContent('scanner');

    const detailsLinks = getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveAttribute('href', '/audit/1234');
    expect(detailsLinks[1]).toHaveAttribute('href', '/audit/5678');
  });

  test('should render nvt families tab', () => {
    const getPolicy = testing.fn().mockResolvedValue({
      data: policy,
    });

    const gmp = {
      [entityType]: {
        get: getPolicy,
      },
      permissions: {
        get: getPermissions,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
        renewSession,
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

    store.dispatch(entityLoadingActions.success('12345', policy));

    const {baseElement, getAllByTestId} = render(<Detailspage id="12345" />);

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[10]);

    expect(baseElement).toHaveTextContent('family1');
    expect(baseElement).toHaveTextContent('1 of 1');
    expect(baseElement).toHaveTextContent('family2');
    expect(baseElement).toHaveTextContent('2 of 4');
    expect(baseElement).toHaveTextContent('family3');
    expect(baseElement).toHaveTextContent('0 of 2');

    const links = baseElement.querySelectorAll('a');

    const icons = getAllByTestId('svg-icon');

    expect(links[2]).toHaveAttribute(
      'href',
      '/nvts?filter=family%3D%22family1%22',
    );
    expect(links[2]).toHaveAttribute('title', 'NVTs of family family1');

    expect(links[3]).toHaveAttribute(
      'href',
      '/nvts?filter=family%3D%22family2%22',
    );
    expect(links[3]).toHaveAttribute('title', 'NVTs of family family2');

    expect(links[4]).toHaveAttribute(
      'href',
      '/nvts?filter=family%3D%22family3%22',
    );
    expect(links[4]).toHaveAttribute('title', 'NVTs of family family3');

    expect(icons[7]).toHaveAttribute(
      'title',
      'The families selection is DYNAMIC. New families will automatically be added and considered.',
    );
    expect(icons[8]).toHaveAttribute(
      'title',
      'The NVT selection is DYNAMIC. New NVTs will automatically be added and considered.',
    );
    expect(icons[9]).toHaveAttribute(
      'title',
      'The NVT selection is STATIC. New NVTs will NOT automatically be added and considered.',
    );
    expect(icons[10]).toHaveAttribute(
      'title',
      'The NVT selection is STATIC. New NVTs will NOT automatically be added and considered.',
    );
  });

  test('should render nvt preferences tab', () => {
    const getPolicy = testing.fn().mockResolvedValue({
      data: policy,
    });

    const gmp = {
      [entityType]: {
        get: getPolicy,
      },
      permissions: {
        get: getPermissions,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
        renewSession,
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

    store.dispatch(entityLoadingActions.success('12345', policy));

    const {baseElement, getAllByTestId} = render(<Detailspage id="12345" />);

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[12]);

    const detailsLinks = getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveAttribute('href', '/nvt/0');
    expect(detailsLinks[0]).toHaveTextContent('nvt0');
    expect(baseElement).toHaveTextContent('value2');
    expect(baseElement).toHaveTextContent('value1');

    expect(detailsLinks[1]).toHaveAttribute('href', '/nvt/1');
    expect(detailsLinks[1]).toHaveTextContent('nvt1');
    expect(baseElement).toHaveTextContent('yes');
    expect(baseElement).toHaveTextContent('no');

    expect(detailsLinks[2]).toHaveAttribute('href', '/nvt/2');
    expect(detailsLinks[2]).toHaveTextContent('nvt2');
    expect(baseElement).toHaveTextContent('foo');
    expect(baseElement).toHaveTextContent('bar');
  });

  test('should render permissions tab', () => {
    const getPolicy = testing.fn().mockResolvedValue({
      data: policy,
    });

    const gmp = {
      [entityType]: {
        get: getPolicy,
      },
      permissions: {
        get: getPermissions,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
        renewSession,
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

    store.dispatch(entityLoadingActions.success('12345', policy));

    const {baseElement} = render(<Detailspage id="12345" />);

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[14]);

    expect(baseElement).toHaveTextContent('No permissions available');
  });

  test('should call commands', async () => {
    const getPolicy = testing.fn().mockReturnValue(
      Promise.resolve({
        data: policy,
      }),
    );
    const clone = testing.fn().mockReturnValue(
      Promise.resolve({
        data: {id: 'foo'},
      }),
    );
    const getNvtFamilies = testing.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );
    const getAllScanners = testing.fn().mockReturnValue(
      Promise.resolve({
        data: scanners,
      }),
    );
    const deleteFunc = testing.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );
    const exportFunc = testing.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );

    const gmp = {
      [entityType]: {
        get: getPolicy,
        clone,
        delete: deleteFunc,
        export: exportFunc,
      },
      permissions: {
        get: getPermissions,
      },
      nvtfamilies: {
        get: getNvtFamilies,
      },
      scanners: {
        getAll: getAllScanners,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
        renewSession,
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
    store.dispatch(entityLoadingActions.success('12345', policy));

    const {getAllByTestId} = render(<Detailspage id="12345" />);

    const icons = getAllByTestId('svg-icon');

    expect(icons[1]).toHaveAttribute('title', 'Policies List');

    await act(async () => {
      fireEvent.click(icons[2]);
      expect(clone).toHaveBeenCalledWith(policy);
      expect(icons[2]).toHaveAttribute('title', 'Clone Policy');

      fireEvent.click(icons[3]);
      expect(getNvtFamilies).toHaveBeenCalled();
      expect(getAllScanners).toHaveBeenCalled();
      expect(icons[3]).toHaveAttribute('title', 'Edit Policy');

      fireEvent.click(icons[4]);
      expect(deleteFunc).toHaveBeenCalledWith(policyId);
      expect(icons[4]).toHaveAttribute('title', 'Move Policy to trashcan');

      fireEvent.click(icons[5]);
      expect(exportFunc).toHaveBeenCalledWith(policy);
      expect(icons[5]).toHaveAttribute('title', 'Export Policy as XML');
    });
  });

  test('should not call commands without permission', async () => {
    const getPolicy = testing.fn().mockReturnValue(
      Promise.resolve({
        data: policy2,
      }),
    );

    const clone = testing.fn().mockReturnValue(
      Promise.resolve({
        data: {id: 'foo'},
      }),
    );
    const getNvtFamilies = testing.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );
    const getAllScanners = testing.fn().mockReturnValue(
      Promise.resolve({
        data: scanners,
      }),
    );
    const deleteFunc = testing.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );
    const exportFunc = testing.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );

    const gmp = {
      [entityType]: {
        get: getPolicy,
        clone,
        delete: deleteFunc,
        export: exportFunc,
      },
      permissions: {
        get: getPermissions,
      },
      nvtfamilies: {
        get: getNvtFamilies,
      },
      scanners: {
        getAll: getAllScanners,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
        renewSession,
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
    store.dispatch(entityLoadingActions.success('12345', policy2));

    const {getAllByTestId} = render(<Detailspage id="12345" />);

    const icons = getAllByTestId('svg-icon');

    expect(icons[1]).toHaveAttribute('title', 'Policies List');

    await act(async () => {
      fireEvent.click(icons[2]);
      expect(clone).not.toHaveBeenCalled();
      expect(icons[2]).toHaveAttribute(
        'title',
        'Permission to clone Policy denied',
      );

      fireEvent.click(icons[3]);
      expect(getNvtFamilies).not.toHaveBeenCalled();
      expect(getAllScanners).not.toHaveBeenCalled();
      expect(icons[3]).toHaveAttribute(
        'title',
        'Permission to edit Policy denied',
      );

      fireEvent.click(icons[4]);
      expect(deleteFunc).not.toHaveBeenCalled();
      expect(icons[4]).toHaveAttribute(
        'title',
        'Permission to move Policy to trashcan denied',
      );

      fireEvent.click(icons[5]);
      expect(exportFunc).toHaveBeenCalledWith(policy2);
      expect(icons[5]).toHaveAttribute('title', 'Export Policy as XML');
    });
  });

  test('should (not) call commands if policy is in use', async () => {
    const getPolicy = testing.fn().mockReturnValue(
      Promise.resolve({
        data: policy3,
      }),
    );

    const clone = testing.fn().mockReturnValue(
      Promise.resolve({
        data: {id: 'foo'},
      }),
    );
    const getNvtFamilies = testing.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );
    const getAllScanners = testing.fn().mockReturnValue(
      Promise.resolve({
        data: scanners,
      }),
    );
    const deleteFunc = testing.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );
    const exportFunc = testing.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );

    const gmp = {
      [entityType]: {
        get: getPolicy,
        clone,
        delete: deleteFunc,
        export: exportFunc,
      },
      permissions: {
        get: getPermissions,
      },
      nvtfamilies: {
        get: getNvtFamilies,
      },
      scanners: {
        getAll: getAllScanners,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
        renewSession,
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
    store.dispatch(entityLoadingActions.success('12345', policy3));

    const {getAllByTestId} = render(<Detailspage id="12345" />);

    const icons = getAllByTestId('svg-icon');

    expect(icons[1]).toHaveAttribute('title', 'Policies List');

    await act(async () => {
      fireEvent.click(icons[2]);
      expect(clone).toHaveBeenCalledWith(policy3);
      expect(icons[2]).toHaveAttribute('title', 'Clone Policy');

      fireEvent.click(icons[3]);
      expect(getNvtFamilies).toHaveBeenCalled();
      expect(getAllScanners).toHaveBeenCalled();
      expect(icons[3]).toHaveAttribute('title', 'Edit Policy');

      fireEvent.click(icons[4]);
      expect(deleteFunc).not.toHaveBeenCalled();
      expect(icons[4]).toHaveAttribute('title', 'Policy is still in use');

      fireEvent.click(icons[5]);
      expect(exportFunc).toHaveBeenCalledWith(policy3);
      expect(icons[5]).toHaveAttribute('title', 'Export Policy as XML');
    });
  });

  test('should (not) call commands if policy is not writable', async () => {
    const getPolicy = testing.fn().mockReturnValue(
      Promise.resolve({
        data: policy4,
      }),
    );

    const clone = testing.fn().mockReturnValue(
      Promise.resolve({
        data: {id: 'foo'},
      }),
    );
    const getNvtFamilies = testing.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );
    const getAllScanners = testing.fn().mockReturnValue(
      Promise.resolve({
        data: scanners,
      }),
    );
    const deleteFunc = testing.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );
    const exportFunc = testing.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );

    const gmp = {
      [entityType]: {
        get: getPolicy,
        clone,
        delete: deleteFunc,
        export: exportFunc,
      },
      permissions: {
        get: getPermissions,
      },
      nvtfamilies: {
        get: getNvtFamilies,
      },
      scanners: {
        getAll: getAllScanners,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
        renewSession,
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
    store.dispatch(entityLoadingActions.success('12345', policy4));

    const {getAllByTestId} = render(<Detailspage id="12345" />);

    const icons = getAllByTestId('svg-icon');

    expect(icons[1]).toHaveAttribute('title', 'Policies List');

    await act(async () => {
      fireEvent.click(icons[2]);
      expect(clone).toHaveBeenCalledWith(policy4);
      expect(icons[2]).toHaveAttribute('title', 'Clone Policy');

      fireEvent.click(icons[3]);
      expect(getNvtFamilies).not.toHaveBeenCalled();
      expect(getAllScanners).not.toHaveBeenCalled();
      expect(icons[3]).toHaveAttribute('title', 'Policy is not writable');

      fireEvent.click(icons[4]);
      expect(deleteFunc).not.toHaveBeenCalled();
      expect(icons[4]).toHaveAttribute('title', 'Policy is not writable');

      fireEvent.click(icons[5]);
      expect(exportFunc).toHaveBeenCalledWith(policy4);
      expect(icons[5]).toHaveAttribute('title', 'Export Policy as XML');
    });
  });

  // TODO: should render scanner preferences tab
});

describe('Policy ToolBarIcons tests', () => {
  test('should render', () => {
    const handlePolicyCloneClick = testing.fn();
    const handlePolicyDeleteClick = testing.fn();
    const handlePolicyDownloadClick = testing.fn();
    const handlePolicyEditClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element, getAllByTestId} = render(
      <ToolBarIcons
        entity={policy}
        onPolicyCloneClick={handlePolicyCloneClick}
        onPolicyDeleteClick={handlePolicyDeleteClick}
        onPolicyDownloadClick={handlePolicyDownloadClick}
        onPolicyEditClick={handlePolicyEditClick}
      />,
    );

    expect(element).toBeVisible();

    const links = element.querySelectorAll('a');
    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: Policies');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/compliance-and-special-scans.html#configuring-and-managing-policies',
    );

    expect(links[1]).toHaveAttribute('href', '/policies');
    expect(icons[1]).toHaveAttribute('title', 'Policies List');
  });

  test('should call click handlers', () => {
    const handlePolicyCloneClick = testing.fn();
    const handlePolicyDeleteClick = testing.fn();
    const handlePolicyDownloadClick = testing.fn();
    const handlePolicyEditClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {getAllByTestId} = render(
      <ToolBarIcons
        entity={policy}
        onPolicyCloneClick={handlePolicyCloneClick}
        onPolicyDeleteClick={handlePolicyDeleteClick}
        onPolicyDownloadClick={handlePolicyDownloadClick}
        onPolicyEditClick={handlePolicyEditClick}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[2]);
    expect(handlePolicyCloneClick).toHaveBeenCalledWith(policy);
    expect(icons[2]).toHaveAttribute('title', 'Clone Policy');

    fireEvent.click(icons[3]);
    expect(handlePolicyEditClick).toHaveBeenCalledWith(policy);
    expect(icons[3]).toHaveAttribute('title', 'Edit Policy');

    fireEvent.click(icons[4]);
    expect(handlePolicyDeleteClick).toHaveBeenCalledWith(policy);
    expect(icons[4]).toHaveAttribute('title', 'Move Policy to trashcan');

    fireEvent.click(icons[5]);
    expect(handlePolicyDownloadClick).toHaveBeenCalledWith(policy);
    expect(icons[5]).toHaveAttribute('title', 'Export Policy as XML');
  });

  test('should not call click handlers without permission', () => {
    const handlePolicyCloneClick = testing.fn();
    const handlePolicyDeleteClick = testing.fn();
    const handlePolicyDownloadClick = testing.fn();
    const handlePolicyEditClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {getAllByTestId} = render(
      <ToolBarIcons
        entity={policy2}
        onPolicyCloneClick={handlePolicyCloneClick}
        onPolicyDeleteClick={handlePolicyDeleteClick}
        onPolicyDownloadClick={handlePolicyDownloadClick}
        onPolicyEditClick={handlePolicyEditClick}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[2]);
    expect(handlePolicyCloneClick).not.toHaveBeenCalled();
    expect(icons[2]).toHaveAttribute(
      'title',
      'Permission to clone Policy denied',
    );

    fireEvent.click(icons[3]);
    expect(handlePolicyEditClick).not.toHaveBeenCalled();
    expect(icons[3]).toHaveAttribute(
      'title',
      'Permission to edit Policy denied',
    );

    fireEvent.click(icons[4]);
    expect(handlePolicyDeleteClick).not.toHaveBeenCalled();
    expect(icons[4]).toHaveAttribute(
      'title',
      'Permission to move Policy to trashcan denied',
    );

    fireEvent.click(icons[5]);
    expect(handlePolicyDownloadClick).toHaveBeenCalledWith(policy2);
    expect(icons[5]).toHaveAttribute('title', 'Export Policy as XML');
  });

  test('should (not) call click handlers if policy is in use', () => {
    const handlePolicyCloneClick = testing.fn();
    const handlePolicyDeleteClick = testing.fn();
    const handlePolicyDownloadClick = testing.fn();
    const handlePolicyEditClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {getAllByTestId} = render(
      <ToolBarIcons
        entity={policy3}
        onPolicyCloneClick={handlePolicyCloneClick}
        onPolicyDeleteClick={handlePolicyDeleteClick}
        onPolicyDownloadClick={handlePolicyDownloadClick}
        onPolicyEditClick={handlePolicyEditClick}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[2]);
    expect(handlePolicyCloneClick).toHaveBeenCalledWith(policy3);
    expect(icons[2]).toHaveAttribute('title', 'Clone Policy');

    fireEvent.click(icons[3]);
    expect(handlePolicyEditClick).toHaveBeenCalledWith(policy3);
    expect(icons[3]).toHaveAttribute('title', 'Edit Policy');

    fireEvent.click(icons[4]);
    expect(handlePolicyDeleteClick).not.toHaveBeenCalled();
    expect(icons[4]).toHaveAttribute('title', 'Policy is still in use');

    fireEvent.click(icons[5]);
    expect(handlePolicyDownloadClick).toHaveBeenCalledWith(policy3);
    expect(icons[5]).toHaveAttribute('title', 'Export Policy as XML');
  });

  test('should (not) call click handlers if policy is not writable', () => {
    const handlePolicyCloneClick = testing.fn();
    const handlePolicyDeleteClick = testing.fn();
    const handlePolicyDownloadClick = testing.fn();
    const handlePolicyEditClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {getAllByTestId} = render(
      <ToolBarIcons
        entity={policy4}
        onPolicyCloneClick={handlePolicyCloneClick}
        onPolicyDeleteClick={handlePolicyDeleteClick}
        onPolicyDownloadClick={handlePolicyDownloadClick}
        onPolicyEditClick={handlePolicyEditClick}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[2]);
    expect(handlePolicyCloneClick).toHaveBeenCalledWith(policy4);
    expect(icons[2]).toHaveAttribute('title', 'Clone Policy');

    fireEvent.click(icons[3]);
    expect(handlePolicyEditClick).not.toHaveBeenCalled();
    expect(icons[3]).toHaveAttribute('title', 'Policy is not writable');

    fireEvent.click(icons[4]);
    expect(handlePolicyDeleteClick).not.toHaveBeenCalled();
    expect(icons[4]).toHaveAttribute('title', 'Policy is not writable');

    fireEvent.click(icons[5]);
    expect(handlePolicyDownloadClick).toHaveBeenCalledWith(policy4);
    expect(icons[5]).toHaveAttribute('title', 'Export Policy as XML');
  });
});
