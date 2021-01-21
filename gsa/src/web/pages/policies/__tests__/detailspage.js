/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import Capabilities from 'gmp/capabilities/capabilities';

import {setLocale} from 'gmp/locale/lang';

import Policy from 'gmp/models/policy';

import {isDefined} from 'gmp/utils/identity';

import {createGetPermissionsQueryMock} from 'web/graphql/__mocks__/permissions';
import {
  createClonePolicyQueryMock,
  createDeletePoliciesByIdsQueryMock,
  createExportPoliciesByIdsQueryMock,
  createGetPolicyQueryMock,
  policy1 as policyObject1,
  policy2 as policyObject2,
  policy3 as policyObject3,
  policy4 as policyObject4,
} from 'web/graphql/__mocks__/policies';
import {createRenewSessionQueryMock} from 'web/graphql/__mocks__/session';

import {policy as policyObject} from 'web/store/entities/policies';
import {setTimezone} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent, wait, screen} from 'web/utils/testing';

import Detailspage, {ToolBarIcons} from '../detailspage';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: '234',
  }),
}));

if (!isDefined(window.URL)) {
  window.URL = {};
}
window.URL.createObjectURL = jest.fn();

setLocale('en');

const policy = Policy.fromObject(policyObject1);

const policy2 = Policy.fromObject(policyObject2);

const policy3 = Policy.fromObject(policyObject3);

const policy4 = Policy.fromObject(policyObject4);

const scanners = [{name: 'scanner1'}, {name: 'scanner2'}];

const caps = new Capabilities(['everything']);

const entityType = 'policy';
const reloadInterval = -1;
const manualUrl = 'test/';

let currentSettings;
let getPermissions;
let renewSession;

beforeEach(() => {
  currentSettings = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  renewSession = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  getPermissions = jest.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });
});

describe('Policy Detailspage tests', () => {
  test('should render full Detailspage', async () => {
    const gmp = {
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const [mock, resultFunc] = createGetPolicyQueryMock();

    const [renewSessionQueryMock] = createRenewSessionQueryMock();
    const [
      permissionQueryMock,
      permissionResult,
    ] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=234 first=1 rows=-1',
    });
    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, renewSessionQueryMock, permissionQueryMock],
    });

    store.dispatch(setTimezone('CET'));

    const {baseElement, getAllByTestId} = render(<Detailspage id="234" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(permissionResult).toHaveBeenCalled();

    await wait();

    expect(baseElement).toHaveTextContent('Policy: unnamed policy');

    const links = baseElement.querySelectorAll('a');
    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: Policies');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/compliance-and-special-scans.html#configuring-and-managing-policies',
    );

    expect(links[1]).toHaveAttribute('href', '/policies');
    expect(icons[1]).toHaveAttribute('title', 'Policies List');

    expect(baseElement).toHaveTextContent('234');
    expect(baseElement).toHaveTextContent('Mon, Aug 17, 2020 2:18 PM CEST');
    expect(baseElement).toHaveTextContent('Tue, Sep 29, 2020 2:16 PM CEST');
    expect(baseElement).toHaveTextContent('admin');

    expect(baseElement).toHaveTextContent('some policy description');
    expect(baseElement).toHaveTextContent('foo');
    expect(baseElement).not.toHaveTextContent('scanner');

    const detailslinks = getAllByTestId('details-link');

    expect(detailslinks[0]).toHaveAttribute('href', '/audit/457');
  });

  test('should render nvt families tab', async () => {
    const gmp = {
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetPolicyQueryMock();

    const [renewSessionQueryMock] = createRenewSessionQueryMock();
    const [permissionQueryMock] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=234 first=1 rows=-1',
    });
    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, renewSessionQueryMock, permissionQueryMock],
    });

    store.dispatch(setTimezone('CET'));

    const {baseElement} = render(<Detailspage id="234" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[10]);

    expect(baseElement).toHaveTextContent('family1');
    expect(baseElement).toHaveTextContent('7 of 10');
    expect(baseElement).toHaveTextContent('family2');
    expect(baseElement).toHaveTextContent('0 of 5');

    const links = baseElement.querySelectorAll('a');

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

    const staticTitle =
      'The NVT selection is STATIC. New NVTs will NOT automatically be added and considered.';
    const dynamicTitle =
      'The NVT selection is DYNAMIC. New NVTs will automatically be added and considered.';

    expect(screen.getAllByTitle(staticTitle)[0]).toBeInTheDocument();
    expect(screen.getAllByTitle(dynamicTitle)[0]).toBeInTheDocument();
  });

  test('should render nvt preferences tab', async () => {
    const gmp = {
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetPolicyQueryMock();

    const [renewSessionQueryMock] = createRenewSessionQueryMock();
    const [permissionQueryMock] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=234 first=1 rows=-1',
    });
    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, renewSessionQueryMock, permissionQueryMock],
    });

    store.dispatch(setTimezone('CET'));

    const {baseElement, getAllByTestId} = render(<Detailspage id="234" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[12]);

    const detailsLinks = getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveAttribute(
      'href',
      '/nvt/1.3.6.1.4.1.25623.1.0.100151',
    );
    expect(detailsLinks[0]).toHaveTextContent('PostgreSQL Detection');
    expect(baseElement).toHaveTextContent('postgres');
    expect(baseElement).toHaveTextContent('regress');
  });

  test('should render permissions tab', async () => {
    const gmp = {
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetPolicyQueryMock();

    const [renewSessionQueryMock] = createRenewSessionQueryMock();
    const [
      permissionQueryMock,
      permissionResult,
    ] = createGetPermissionsQueryMock(
      {
        filterString: 'resource_uuid=234 first=1 rows=-1',
      },
      {permissions: null},
    );
    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, renewSessionQueryMock, permissionQueryMock],
    });

    store.dispatch(setTimezone('CET'));

    const {baseElement} = render(<Detailspage id="234" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[14]);

    expect(permissionResult).toHaveBeenCalled();

    expect(baseElement).toHaveTextContent('No permissions available');
  });

  test('should render scanner preferences tab', async () => {
    const gmp = {
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetPolicyQueryMock();

    const [
      renewSessionQueryMock,
      renewSessionResult,
    ] = createRenewSessionQueryMock();
    const [permissionQueryMock] = createGetPermissionsQueryMock(
      {
        filterString: 'resource_uuid=234 first=1 rows=-1',
      },
      {permissions: null},
    );
    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, renewSessionQueryMock, permissionQueryMock],
    });

    store.dispatch(setTimezone('CET'));

    const {baseElement} = render(<Detailspage id="234" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[9]);

    await wait();

    expect(renewSessionResult).toHaveBeenCalled();

    expect(baseElement).toHaveTextContent('Name');
    expect(baseElement).toHaveTextContent('brightness of alpha centauri');

    expect(baseElement).toHaveTextContent('Value');
    expect(baseElement).toHaveTextContent('brilliant');

    expect(baseElement).toHaveTextContent('Default Value');
    expect(baseElement).toHaveTextContent('dull');
  });

  test('should call commands', async () => {
    const getPolicy = jest.fn().mockReturnValue(
      Promise.resolve({
        data: policy,
      }),
    );

    const getNvtFamilies = jest.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );
    const getAllScanners = jest.fn().mockReturnValue(
      Promise.resolve({
        data: scanners,
      }),
    );

    const gmp = {
      [entityType]: {
        get: getPolicy,
      },
      nvtfamilies: {
        get: getNvtFamilies,
      },
      scanners: {
        getAll: getAllScanners,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetPolicyQueryMock('234', policyObject);

    const [renewSessionQueryMock] = createRenewSessionQueryMock();
    const [permissionQueryMock] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=234 first=1 rows=-1',
    });
    const [cloneQueryMock, cloneQueryResult] = createClonePolicyQueryMock();
    const [
      exportQueryMock,
      exportQueryResult,
    ] = createExportPoliciesByIdsQueryMock(['234']);
    const [
      deleteQueryMock,
      deleteQueryResult,
    ] = createDeletePoliciesByIdsQueryMock();
    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [
        mock,
        renewSessionQueryMock,
        permissionQueryMock,
        cloneQueryMock,
        exportQueryMock,
        deleteQueryMock,
      ],
    });

    store.dispatch(setTimezone('CET'));

    const {getAllByTestId} = render(<Detailspage id="234" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    const icons = getAllByTestId('svg-icon');

    expect(icons[1]).toHaveAttribute('title', 'Policies List');

    fireEvent.click(icons[2]);

    await wait();

    expect(cloneQueryResult).toHaveBeenCalled();
    expect(icons[2]).toHaveAttribute('title', 'Clone Policy');

    expect(icons[3]).toHaveAttribute('title', 'Edit Policy');
    fireEvent.click(icons[3]);
    await wait();

    expect(getNvtFamilies).toHaveBeenCalled();
    expect(getAllScanners).toHaveBeenCalled();

    fireEvent.click(icons[4]);

    await wait();

    expect(deleteQueryResult).toHaveBeenCalled();
    expect(icons[4]).toHaveAttribute('title', 'Move Policy to trashcan');

    fireEvent.click(icons[5]);
    expect(exportQueryResult).toHaveBeenCalled();
    expect(icons[5]).toHaveAttribute('title', 'Export Policy as XML');
  });

  test('should not call commands without permission', async () => {
    const getPolicy = jest.fn().mockReturnValue(
      Promise.resolve({
        data: policy,
      }),
    );

    const getNvtFamilies = jest.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );
    const getAllScanners = jest.fn().mockReturnValue(
      Promise.resolve({
        data: scanners,
      }),
    );

    const gmp = {
      [entityType]: {
        get: getPolicy,
      },
      nvtfamilies: {
        get: getNvtFamilies,
      },
      scanners: {
        getAll: getAllScanners,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetPolicyQueryMock('234', policyObject2);

    const [renewSessionQueryMock] = createRenewSessionQueryMock();
    const [permissionQueryMock] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=234 first=1 rows=-1',
    });
    const [cloneQueryMock, cloneQueryResult] = createClonePolicyQueryMock();
    const [
      exportQueryMock,
      exportQueryResult,
    ] = createExportPoliciesByIdsQueryMock(['234']);
    const [
      deleteQueryMock,
      deleteQueryResult,
    ] = createDeletePoliciesByIdsQueryMock();
    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [
        mock,
        renewSessionQueryMock,
        permissionQueryMock,
        cloneQueryMock,
        exportQueryMock,
        deleteQueryMock,
      ],
    });

    store.dispatch(setTimezone('CET'));

    const {getAllByTestId} = render(<Detailspage id="234" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    const icons = getAllByTestId('svg-icon');

    expect(icons[1]).toHaveAttribute('title', 'Policies List');

    fireEvent.click(icons[2]);
    expect(cloneQueryResult).not.toHaveBeenCalled();
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
    expect(deleteQueryResult).not.toHaveBeenCalled();
    expect(icons[4]).toHaveAttribute(
      'title',
      'Permission to move Policy to trashcan denied',
    );

    fireEvent.click(icons[5]);

    await wait();
    expect(exportQueryResult).toHaveBeenCalled();
    expect(icons[5]).toHaveAttribute('title', 'Export Policy as XML');
  });

  test('should (not) call commands if policy is in use', async () => {
    const getPolicy = jest.fn().mockReturnValue(
      Promise.resolve({
        data: policy,
      }),
    );

    const getNvtFamilies = jest.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );
    const getAllScanners = jest.fn().mockReturnValue(
      Promise.resolve({
        data: scanners,
      }),
    );

    const gmp = {
      [entityType]: {
        get: getPolicy,
      },
      nvtfamilies: {
        get: getNvtFamilies,
      },
      scanners: {
        getAll: getAllScanners,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetPolicyQueryMock('234', policyObject3);

    const [renewSessionQueryMock] = createRenewSessionQueryMock();
    const [permissionQueryMock] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=234 first=1 rows=-1',
    });
    const [cloneQueryMock, cloneQueryResult] = createClonePolicyQueryMock();
    const [
      exportQueryMock,
      exportQueryResult,
    ] = createExportPoliciesByIdsQueryMock(['234']);
    const [
      deleteQueryMock,
      deleteQueryResult,
    ] = createDeletePoliciesByIdsQueryMock();
    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [
        mock,
        renewSessionQueryMock,
        permissionQueryMock,
        cloneQueryMock,
        exportQueryMock,
        deleteQueryMock,
      ],
    });

    store.dispatch(setTimezone('CET'));

    const {getAllByTestId} = render(<Detailspage id="234" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    const icons = getAllByTestId('svg-icon');

    expect(icons[1]).toHaveAttribute('title', 'Policies List');

    fireEvent.click(icons[2]);

    await wait();

    expect(cloneQueryResult).toHaveBeenCalled();
    expect(icons[2]).toHaveAttribute('title', 'Clone Policy');

    fireEvent.click(icons[3]);
    expect(getNvtFamilies).toHaveBeenCalled();
    expect(getAllScanners).toHaveBeenCalled();
    expect(icons[3]).toHaveAttribute('title', 'Edit Policy');

    fireEvent.click(icons[4]);

    await wait();
    expect(deleteQueryResult).not.toHaveBeenCalled();
    expect(icons[4]).toHaveAttribute('title', 'Policy is still in use');

    fireEvent.click(icons[5]);

    await wait();
    expect(exportQueryResult).toHaveBeenCalled();
    expect(icons[5]).toHaveAttribute('title', 'Export Policy as XML');
  });

  test('should (not) call commands if policy is not writable', async () => {
    const getPolicy = jest.fn().mockReturnValue(
      Promise.resolve({
        data: policy,
      }),
    );

    const getNvtFamilies = jest.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );
    const getAllScanners = jest.fn().mockReturnValue(
      Promise.resolve({
        data: scanners,
      }),
    );

    const gmp = {
      [entityType]: {
        get: getPolicy,
      },
      nvtfamilies: {
        get: getNvtFamilies,
      },
      scanners: {
        getAll: getAllScanners,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetPolicyQueryMock('234', policyObject4);

    const [renewSessionQueryMock] = createRenewSessionQueryMock();
    const [permissionQueryMock] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=234 first=1 rows=-1',
    });
    const [cloneQueryMock, cloneQueryResult] = createClonePolicyQueryMock();
    const [
      exportQueryMock,
      exportQueryResult,
    ] = createExportPoliciesByIdsQueryMock(['234']);
    const [
      deleteQueryMock,
      deleteQueryResult,
    ] = createDeletePoliciesByIdsQueryMock();
    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [
        mock,
        renewSessionQueryMock,
        permissionQueryMock,
        cloneQueryMock,
        exportQueryMock,
        deleteQueryMock,
      ],
    });

    store.dispatch(setTimezone('CET'));

    const {getAllByTestId} = render(<Detailspage id="234" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    const icons = getAllByTestId('svg-icon');

    expect(icons[1]).toHaveAttribute('title', 'Policies List');

    fireEvent.click(icons[2]);

    await wait();
    expect(cloneQueryResult).toHaveBeenCalled();
    expect(icons[2]).toHaveAttribute('title', 'Clone Policy');

    fireEvent.click(icons[3]);
    expect(getNvtFamilies).not.toHaveBeenCalled();
    expect(getAllScanners).not.toHaveBeenCalled();
    expect(icons[3]).toHaveAttribute('title', 'Policy is not writable');

    fireEvent.click(icons[4]);
    expect(deleteQueryResult).not.toHaveBeenCalled();
    expect(icons[4]).toHaveAttribute('title', 'Policy is not writable');

    fireEvent.click(icons[5]);
    expect(exportQueryResult).toHaveBeenCalled();
    expect(icons[5]).toHaveAttribute('title', 'Export Policy as XML');
  });
});

describe('Policy ToolBarIcons tests', () => {
  test('should render', () => {
    const handlePolicyCloneClick = jest.fn();
    const handlePolicyDeleteClick = jest.fn();
    const handlePolicyDownloadClick = jest.fn();
    const handlePolicyEditClick = jest.fn();

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
    const handlePolicyCloneClick = jest.fn();
    const handlePolicyDeleteClick = jest.fn();
    const handlePolicyDownloadClick = jest.fn();
    const handlePolicyEditClick = jest.fn();

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
    const handlePolicyCloneClick = jest.fn();
    const handlePolicyDeleteClick = jest.fn();
    const handlePolicyDownloadClick = jest.fn();
    const handlePolicyEditClick = jest.fn();

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
    const handlePolicyCloneClick = jest.fn();
    const handlePolicyDeleteClick = jest.fn();
    const handlePolicyDownloadClick = jest.fn();
    const handlePolicyEditClick = jest.fn();

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
    const handlePolicyCloneClick = jest.fn();
    const handlePolicyDeleteClick = jest.fn();
    const handlePolicyDownloadClick = jest.fn();
    const handlePolicyEditClick = jest.fn();

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
