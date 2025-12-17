/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen, within} from 'web/testing';
import {vi} from 'vitest';
import CollectionCounts from 'gmp/collection/collection-counts';
import Response from 'gmp/http/response';
import Filter from 'gmp/models/filter';
import Policy from 'gmp/models/policy';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/current-settings';
import DetailsPage from 'web/pages/policies/DetailsPage';
import {entityLoadingActions} from 'web/store/entities/policies';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

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
      id: 0,
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
      id: 1,
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
      id: 2,
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
  comment: 'Some Comment',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  owner: {name: 'admin'},
  writable: 1,
  in_use: 0,
  family_count: {__text: '', growing: 1},
  families: {family: families},
  preferences: preferences,
  permissions: {permission: [{name: 'everything'}]},
  scanner: {name: 'scanner', type: '42'},
  tasks: {
    task: [
      {_id: '1234', name: 'audit1'},
      {_id: '5678', name: 'audit2'},
    ],
  },
});

const policy2 = Policy.fromElement({
  _id: '12345',
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  owner: {name: 'user'},
  writable: 1,
  in_use: 0,
  family_count: {__text: '', growing: 1},
  families: {family: families},
  preferences: preferences,
  permissions: {permission: [{name: 'get_config'}]},
  scanner: {name: 'scanner', type: '42'},
  tasks: {
    task: [
      {_id: '1234', name: 'audit1'},
      {_id: '5678', name: 'audit2'},
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
  writable: 1,
  in_use: 1,
  family_count: {__text: '', growing: 1},
  families: {family: families},
  preferences: preferences,
  permissions: {permission: [{name: 'everything'}]},
  scanner: {name: 'scanner', type: '42'},
  tasks: {
    task: [
      {_id: '1234', name: 'audit1'},
      {_id: '5678', name: 'audit2'},
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
  writable: 0,
  in_use: 0,
  family_count: {__text: '', growing: 1},
  families: {family: families},
  preferences: preferences,
  permissions: {permission: [{name: 'everything'}]},
  scanner: {name: 'scanner', type: '42'},
  tasks: {
    task: [
      {_id: '1234', name: 'audit1'},
      {_id: '5678', name: 'audit2'},
    ],
  },
});

const scanners = [{name: 'scanner1'}, {name: 'scanner2'}];

const reloadInterval = 1;
const manualUrl = 'test/';

const createGmp = ({
  getPolicyResponse = new Response(policy),
  getTagsResponse = {
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  },
  getPermissionsResponse = {
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  },
  getNvtFamiliesResponse = {},
  getScannersResponse = {data: scanners},
  clonePolicyResponse = new Response({id: 'cloned-id'}),
  deletePolicyResponse = undefined,
  exportPolicyResponse = new Response('some-data'),
  currentSettingsResponse = currentSettingsDefaultResponse,
  getPolicy = testing.fn().mockResolvedValue(getPolicyResponse),
  getTags = testing.fn().mockResolvedValue(getTagsResponse),
  getPermissions = testing.fn().mockResolvedValue(getPermissionsResponse),
  getNvtFamilies = testing.fn().mockResolvedValue(getNvtFamiliesResponse),
  getScanners = testing.fn().mockResolvedValue(getScannersResponse),
  clonePolicy = testing.fn().mockResolvedValue(clonePolicyResponse),
  deletePolicy = testing.fn().mockResolvedValue(deletePolicyResponse),
  exportPolicy = testing.fn().mockResolvedValue(exportPolicyResponse),
  currentSettings = testing.fn().mockResolvedValue(currentSettingsResponse),
} = {}) => {
  return {
    nvtfamilies: {
      get: getNvtFamilies,
    },
    policy: {
      get: getPolicy,
      clone: clonePolicy,
      delete: deletePolicy,
      export: exportPolicy,
    },
    scanners: {
      getAll: getScanners,
    },
    tags: {
      get: getTags,
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

describe('PolicyDetailsPage tests', () => {
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
    store.dispatch(entityLoadingActions.success('12345', policy));

    render(<DetailsPage id="12345" />);

    expect(screen.getByTitle('Help: Policies')).toBeInTheDocument();
    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/compliance-and-special-scans.html#configuring-and-managing-policies',
    );

    expect(screen.getByTitle('Policies List')).toBeInTheDocument();
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/policies',
    );

    expect(
      screen.getByRole('heading', {name: /Policy: foo$/}),
    ).toBeInTheDocument();

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
    expect(entityInfo.getByRole('row', {name: /^Owner:/})).toHaveTextContent(
      'admin',
    );

    expect(
      screen.getByRole('tab', {name: /^information/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', {name: /^scanner preferences/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', {name: /^nvt families/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', {name: /^nvt preferences/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', {name: /^permissions/i}),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('row', {name: /^comment some comment/i}),
    ).toHaveTextContent('Some Comment');

    const auditsRow = within(
      screen.getByRole('row', {name: /^audits using this/i}),
    );
    expect(auditsRow.getByText('audit1')).toBeInTheDocument();
    expect(auditsRow.getByText('audit1')).toHaveAttribute(
      'href',
      '/audit/1234',
    );

    expect(auditsRow.getByText('audit2')).toBeInTheDocument();
    expect(auditsRow.getByText('audit2')).toHaveAttribute(
      'href',
      '/audit/5678',
    );
  });

  test('should render nvt families tab', () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', policy));

    render(<DetailsPage id="12345" />);

    const nvtFamiliesTab = screen.getByRole('tab', {name: /^nvt families/i});
    fireEvent.click(nvtFamiliesTab);

    expect(screen.getByRole('row', {name: /^family nvts/i})).toHaveTextContent(
      'NVTs selectedTrend',
    );
    expect(screen.getByRole('row', {name: /^family1/i})).toHaveTextContent(
      '1 of 1',
    );
    expect(screen.getByRole('row', {name: /^family2/i})).toHaveTextContent(
      '2 of 4',
    );
    expect(screen.getByRole('row', {name: /^family3/i})).toHaveTextContent(
      '0 of 2',
    );

    expect(screen.getByRole('link', {name: /^family1/i})).toHaveAttribute(
      'href',
      '/nvts?filter=family%3D%22family1%22',
    );

    expect(screen.getByRole('link', {name: /^family2/i})).toHaveAttribute(
      'href',
      '/nvts?filter=family%3D%22family2%22',
    );
    expect(screen.getByRole('link', {name: /^family3/i})).toHaveAttribute(
      'href',
      '/nvts?filter=family%3D%22family3%22',
    );

    const dynamicIcons = screen.getAllByTestId('trend-more-icon');
    expect(dynamicIcons[0]).toHaveAttribute(
      'title',
      'The families selection is DYNAMIC. New families will automatically be added and considered.',
    );
    expect(dynamicIcons[1]).toHaveAttribute(
      'title',
      'The NVT selection is DYNAMIC. New NVTs will automatically be added and considered.',
    );
    const staticIcons = screen.getAllByTestId('trend-nochange-icon');
    expect(staticIcons[0]).toHaveAttribute(
      'title',
      'The NVT selection is STATIC. New NVTs will NOT automatically be added and considered.',
    );
    expect(staticIcons[1]).toHaveAttribute(
      'title',
      'The NVT selection is STATIC. New NVTs will NOT automatically be added and considered.',
    );
  });

  test('should render scanner preferences tab', () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('12345', policy));

    render(<DetailsPage id="12345" />);

    const scannerPreferencesTab = screen.getByRole('tab', {
      name: /^scanner preferences/i,
    });
    fireEvent.click(scannerPreferencesTab);

    expect(screen.getByRole('row', {name: /^name/i})).toHaveTextContent(
      'ValueDefault Value',
    );
    expect(screen.getByRole('row', {name: /^scannerpref0/i})).toHaveTextContent(
      '00',
    );
  });

  test('should render nvt preferences tab', () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('12345', policy));

    render(<DetailsPage id="12345" />);

    const nvtPreferencesTab = screen.getByRole('tab', {
      name: /^nvt preferences/i,
    });
    fireEvent.click(nvtPreferencesTab);

    const preferencesRow1 = screen.getByRole('row', {name: /preference0/i});
    expect(preferencesRow1).toHaveTextContent(/^nvt0preference0yesno/);
    expect(within(preferencesRow1).getByTestId('details-link')).toHaveAttribute(
      'href',
      '/nvt/0',
    );

    const preferencesRow2 = screen.getByRole('row', {name: /preference1/i});
    expect(preferencesRow2).toHaveTextContent(/^nvt1preference1value2value1/);
    expect(within(preferencesRow2).getByTestId('details-link')).toHaveAttribute(
      'href',
      '/nvt/1',
    );

    const preferencesRow3 = screen.getByRole('row', {name: /preference2/i});
    expect(preferencesRow3).toHaveTextContent(/^nvt2preference2foobar/);
    expect(within(preferencesRow3).getByTestId('details-link')).toHaveAttribute(
      'href',
      '/nvt/2',
    );
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
    store.dispatch(entityLoadingActions.success('12345', policy));

    const {container} = render(<DetailsPage id="12345" />);

    const permissionsTab = screen.getByRole('tab', {name: /^permissions/i});
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
    store.dispatch(entityLoadingActions.success('12345', policy));

    render(<DetailsPage id="12345" />);

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Policy');
    fireEvent.click(cloneIcon);
    expect(gmp.policy.clone).toHaveBeenCalledWith(policy);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Policy');
    fireEvent.click(editIcon);
    expect(gmp.nvtfamilies.get).toHaveBeenCalled();
    expect(gmp.scanners.getAll).toHaveBeenCalled();

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Move Policy to trashcan');
    fireEvent.click(deleteIcon);
    expect(gmp.policy.delete).toHaveBeenCalledWith({id: policy.id});

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Policy as XML');
    fireEvent.click(exportIcon);
    expect(gmp.policy.export).toHaveBeenCalledWith(policy);
  });

  test('should not call commands without permission', async () => {
    const gmp = createGmp({
      getPermissionsResponse: new Response(policy2),
    });
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('12345', policy2));

    render(<DetailsPage id="12345" />);

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute(
      'title',
      'Permission to clone Policy denied',
    );
    fireEvent.click(cloneIcon);
    expect(gmp.policy.clone).not.toHaveBeenCalled();

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute(
      'title',
      'Permission to edit Policy denied',
    );
    fireEvent.click(editIcon);
    expect(gmp.nvtfamilies.get).not.toHaveBeenCalled();
    expect(gmp.scanners.getAll).not.toHaveBeenCalled();

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute(
      'title',
      'Permission to move Policy to trashcan denied',
    );
    fireEvent.click(deleteIcon);
    expect(gmp.policy.delete).not.toHaveBeenCalled();

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Policy as XML');
    fireEvent.click(exportIcon);
    expect(gmp.policy.export).toHaveBeenCalledWith(policy2);
  });

  test('should (not) call commands if policy is in use', async () => {
    const gmp = createGmp({
      getPolicyResponse: new Response(policy3),
    });
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('12345', policy3));

    render(<DetailsPage id="12345" />);

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Policy');
    fireEvent.click(cloneIcon);
    expect(gmp.policy.clone).toHaveBeenCalledWith(policy3);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Policy');
    fireEvent.click(editIcon);
    expect(gmp.nvtfamilies.get).toHaveBeenCalled();
    expect(gmp.scanners.getAll).toHaveBeenCalled();

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Policy is still in use');
    fireEvent.click(deleteIcon);
    expect(gmp.policy.delete).not.toHaveBeenCalled();

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Policy as XML');
    fireEvent.click(exportIcon);
    expect(gmp.policy.export).toHaveBeenCalledWith(policy3);
  });

  test('should (not) call commands if policy is not writable', async () => {
    const gmp = createGmp({
      getPolicyResponse: new Response(policy4),
    });
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('12345', policy4));

    render(<DetailsPage id="12345" />);

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Policy');
    fireEvent.click(cloneIcon);
    expect(gmp.policy.clone).toHaveBeenCalledWith(policy4);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Policy is not writable');
    fireEvent.click(editIcon);
    expect(gmp.nvtfamilies.get).not.toHaveBeenCalled();
    expect(gmp.scanners.getAll).not.toHaveBeenCalled();

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Policy is not writable');
    fireEvent.click(deleteIcon);
    expect(gmp.policy.delete).not.toHaveBeenCalled();

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Policy as XML');
    fireEvent.click(exportIcon);
    expect(gmp.policy.export).toHaveBeenCalledWith(policy4);
  });
});
