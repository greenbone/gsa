/* Copyright (C) 2021 Greenbone Networks GmbH
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
/* eslint-disable react/prop-types */
import React, {useState} from 'react';

import {isDefined} from 'gmp/utils/identity';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import {
  createClonePolicyQueryMock,
  createCreatePolicyQueryMock,
  createDeletePoliciesByIdsQueryMock,
  createDeletePoliciesByFilterQueryMock,
  createExportPoliciesByFilterQueryMock,
  createExportPoliciesByIdsQueryMock,
  createGetPoliciesQueryMock,
  createGetPolicyQueryMock,
  createImportPolicyQueryMock,
} from '../__mocks__/policies';
import {
  useClonePolicy,
  useCreatePolicy,
  useDeletePolicy,
  useDeletePoliciesByFilter,
  useExportPoliciesByFilter,
  useExportPoliciesByIds,
  useGetPolicy,
  useLoadPolicyPromise,
  useImportPolicy,
  useLazyGetPolicies,
  useLazyGetPolicy,
} from '../policies';

const GetPolicyComponent = ({id}) => {
  const {loading, policy, error} = useGetPolicy(id);
  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      {error && <div data-testid="error">{error.message}</div>}
      {policy && (
        <div data-testid="policy">
          <span data-testid="id">{policy.id}</span>
          <span data-testid="name">{policy.name}</span>
        </div>
      )}
    </div>
  );
};

describe('useGetPolicy tests', () => {
  test('should load policy', async () => {
    const [queryMock, resultFunc] = createGetPolicyQueryMock();

    const {render} = rendererWith({queryMocks: [queryMock]});

    render(<GetPolicyComponent id="234" />);

    expect(screen.queryByTestId('loading')).toBeInTheDocument();

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();

    expect(screen.getByTestId('policy')).toBeInTheDocument();

    expect(screen.getByTestId('id')).toHaveTextContent('234');
    expect(screen.getByTestId('name')).toHaveTextContent('unnamed policy');
  });
});

const ExportPoliciesByIdsComponent = () => {
  const exportPoliciesByIds = useExportPoliciesByIds();
  return (
    <button
      data-testid="bulk-export"
      onClick={() => exportPoliciesByIds(['234'])}
    />
  );
};

describe('useExportPoliciesByIds tests', () => {
  test('should export a list of policys after user interaction', async () => {
    const [mock, resultFunc] = createExportPoliciesByIdsQueryMock(['234']);
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ExportPoliciesByIdsComponent />);
    const button = screen.getByTestId('bulk-export');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const DeletePolicyComponent = () => {
  const [deletePolicy] = useDeletePolicy();
  return <button data-testid="delete" onClick={() => deletePolicy('234')} />;
};

describe('useDeletePoliciesByIds tests', () => {
  test('should delete a list of policys after user interaction', async () => {
    const [mock, resultFunc] = createDeletePoliciesByIdsQueryMock(['234']);
    const {render} = rendererWith({queryMocks: [mock]});

    render(<DeletePolicyComponent />);
    const button = screen.getByTestId('delete');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const ClonePolicyComponent = () => {
  const [clonePolicy, {id: policyId}] = useClonePolicy();
  return (
    <div>
      {policyId && <span data-testid="cloned-policy">{policyId}</span>}
      <button data-testid="clone" onClick={() => clonePolicy('234')} />
    </div>
  );
};

describe('useClonePolicy tests', () => {
  test('should clone a policy after user interaction', async () => {
    const [mock, resultFunc] = createClonePolicyQueryMock('234', '345');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ClonePolicyComponent />);

    const button = screen.getByTestId('clone');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.getByTestId('cloned-policy')).toHaveTextContent('345');
  });
});

const DeletePoliciesByFilterComponent = () => {
  const [deletePoliciesByFilter] = useDeletePoliciesByFilter();
  return (
    <button
      data-testid="filter-delete"
      onClick={() => deletePoliciesByFilter('foo')}
    />
  );
};

describe('useDeletePoliciesByFilter tests', () => {
  test('should delete a list of policies by filter string after user interaction', async () => {
    const [mock, resultFunc] = createDeletePoliciesByFilterQueryMock('foo');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<DeletePoliciesByFilterComponent />);
    const button = screen.getByTestId('filter-delete');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const ExportPoliciesByFilterComponent = () => {
  const exportPoliciesByFilter = useExportPoliciesByFilter();
  return (
    <button
      data-testid="filter-export"
      onClick={() => exportPoliciesByFilter('foo')}
    />
  );
};

describe('useExportPoliciesByFilter tests', () => {
  test('should export a list of policies by filter string after user interaction', async () => {
    const [mock, resultFunc] = createExportPoliciesByFilterQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ExportPoliciesByFilterComponent />);
    const button = screen.getByTestId('filter-export');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const GetLazyPoliciesComponent = () => {
  const [getPolicies, {counts, loading, policies}] = useLazyGetPolicies();

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getPolicies()} />
      {isDefined(counts) ? (
        <div data-testid="counts">
          <span data-testid="total">{counts.all}</span>
          <span data-testid="filtered">{counts.filtered}</span>
          <span data-testid="first">{counts.first}</span>
          <span data-testid="limit">{counts.rows}</span>
          <span data-testid="length">{counts.length}</span>
        </div>
      ) : (
        <div data-testid="no-counts" />
      )}
      {isDefined(policies) ? (
        policies.map(policy => {
          return (
            <div key={policy.id} data-testid="policy">
              {policy.id}
            </div>
          );
        })
      ) : (
        <div data-testid="no-policies" />
      )}
    </div>
  );
};

describe('useLazyGetPolicies tests', () => {
  test('should query policies after user interaction', async () => {
    const [mock, resultFunc] = createGetPoliciesQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});
    render(<GetLazyPoliciesComponent />);

    let policyElements = screen.queryAllByTestId('policy');
    expect(policyElements).toHaveLength(0);

    expect(screen.queryByTestId('no-policies')).toBeInTheDocument();
    expect(screen.queryByTestId('no-counts')).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    policyElements = screen.getAllByTestId('policy');
    expect(policyElements).toHaveLength(1);

    expect(policyElements[0]).toHaveTextContent('234');

    expect(screen.queryByTestId('no-policies')).not.toBeInTheDocument();

    expect(screen.getByTestId('total')).toHaveTextContent(1);
    expect(screen.getByTestId('filtered')).toHaveTextContent(1);
    expect(screen.getByTestId('first')).toHaveTextContent(1);
    expect(screen.getByTestId('limit')).toHaveTextContent(10);
    expect(screen.getByTestId('length')).toHaveTextContent(1);
  });
});

const LoadPolicyPromiseComponent = () => {
  const [getPolicy] = useLoadPolicyPromise();
  const [policy, setPolicy] = useState();

  const handleLoadPolicy = policyId => {
    return getPolicy(policyId).then(response => setPolicy(response));
  };

  return (
    <div>
      <button data-testid="load" onClick={() => handleLoadPolicy('234')} />
      {isDefined(policy) ? (
        <div key={policy.id} data-testid="policy">
          {policy.id}
        </div>
      ) : (
        <div data-testid="no-policy" />
      )}
    </div>
  );
};

describe('useLoadPolicyPromise tests', () => {
  test('should query policy after user interaction', async () => {
    const [mock, resultFunc] = createGetPolicyQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});
    render(<LoadPolicyPromiseComponent />);

    await wait();

    let policyElement = screen.queryAllByTestId('policy');
    expect(policyElement).toHaveLength(0);

    expect(screen.queryByTestId('no-policy')).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    policyElement = screen.getByTestId('policy');

    expect(policyElement).toHaveTextContent('234');
  });
});

const CreatePolicyComponent = () => {
  const [notification, setNotification] = useState('');

  const [createPolicy] = useCreatePolicy();

  const handleCreateResult = id => {
    setNotification(`Policy created with id ${id}.`);
  };

  return (
    <div>
      <button
        title={'Create Policy'}
        onClick={() =>
          createPolicy({policyId: 'foo', name: 'bar', comment: 'lorem'}).then(
            handleCreateResult,
          )
        }
      />
      <h3 data-testid="notification">{notification}</h3>
    </div>
  );
};

describe('Policy mutation tests', () => {
  test('should create a policy', async () => {
    const [
      createPolicyMock,
      createPolicyResult,
    ] = createCreatePolicyQueryMock();
    const {render} = rendererWith({queryMocks: [createPolicyMock]});

    const {element} = render(<CreatePolicyComponent />);

    const buttons = element.querySelectorAll('button');

    fireEvent.click(buttons[0]);

    await wait();

    expect(createPolicyResult).toHaveBeenCalled();
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Policy created with id 345.',
    );
  });
});

const ImportPolicyComponent = () => {
  const [notification, setNotification] = useState('');

  const [importPolicy] = useImportPolicy();

  const handleCreateResult = id => {
    setNotification(`Policy imported with id ${id}.`);
  };

  return (
    <div>
      <button
        title={'Import Policy'}
        onClick={() =>
          importPolicy('<get_configs_response />').then(handleCreateResult)
        }
      />
      <h3 data-testid="notification">{notification}</h3>
    </div>
  );
};

describe('Import Policy tests', () => {
  test('should import a policy', async () => {
    const [
      importPolicyQueryMock,
      importPolicyQueryResult,
    ] = createImportPolicyQueryMock();
    const {render} = rendererWith({queryMocks: [importPolicyQueryMock]});

    const {element} = render(<ImportPolicyComponent />);

    const buttons = element.querySelectorAll('button');

    fireEvent.click(buttons[0]);

    await wait();

    expect(importPolicyQueryResult).toHaveBeenCalled();
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Policy imported with id 456.',
    );
  });
});

const GetLazyPolicyComponent = () => {
  const [getPolicy, {policy, loading}] = useLazyGetPolicy();

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getPolicy('234')} />
      {isDefined(policy) ? (
        <div key={policy.id} data-testid="policy">
          {policy.id}
        </div>
      ) : (
        <div data-testid="no-policy" />
      )}
    </div>
  );
};

describe('useLazyGetPolicy tests', () => {
  test('should query policy after user interaction', async () => {
    const [mock, resultFunc] = createGetPolicyQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});
    render(<GetLazyPolicyComponent />);

    let policyElement = screen.queryAllByTestId('policy');
    expect(policyElement).toHaveLength(0);

    expect(screen.queryByTestId('no-policy')).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    policyElement = screen.getByTestId('policy');

    expect(policyElement).toHaveTextContent('234');

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });
});
