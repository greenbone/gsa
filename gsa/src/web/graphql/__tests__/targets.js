/* Copyright (C) 2020-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
/* eslint-disable react/prop-types */

import React, {useState} from 'react';

import {isDefined} from 'gmp/utils/identity';

import Button from 'web/components/form/button';

import {rendererWith, fireEvent, wait, screen} from 'web/utils/testing';

import {
  useCreateTarget,
  useLazyGetTargets,
  useModifyTarget,
  CREATE_TARGET,
  MODIFY_TARGET,
  useGetTarget,
  useCloneTarget,
  useExportTargetsByIds,
  useDeleteTargetsByIds,
  useDeleteTargetsByFilter,
  useExportTargetsByFilter,
} from '../targets';

import {
  createCloneTargetQueryMock,
  createDeleteTargetsByFilterQueryMock,
  createDeleteTargetsByIdsQueryMock,
  createExportTargetsByFilterQueryMock,
  createExportTargetsByIdsQueryMock,
  createGetTargetQueryMock,
  createGetTargetsQueryMock,
} from '../__mocks__/targets';

const createTargetInput = {
  name: 'foo',
  hosts: 'lorem, ipsum',
};

const modifyTargetInput = {
  id: '12345',
  name: 'bar',
};

let createTargetMock;
let createTargetResult;
let modifyTargetMock;
let modifyTargetResult;

beforeEach(() => {
  createTargetResult = jest.fn().mockReturnValue({
    data: {
      createTarget: {
        id: '12345',
        status: 200,
      },
    },
  });

  modifyTargetResult = jest.fn().mockReturnValue({
    data: {
      modifyTarget: {
        ok: true,
      },
    },
  });

  createTargetMock = {
    request: {
      query: CREATE_TARGET,
      variables: {input: createTargetInput},
    },
    newData: createTargetResult,
  };

  modifyTargetMock = {
    request: {
      query: MODIFY_TARGET,
      variables: {input: modifyTargetInput},
    },
    newData: modifyTargetResult,
  };
});

const CreateModifyTargetTestComponent = () => {
  const [notification, setNotification] = useState('');

  const [createTarget] = useCreateTarget();
  const [modifyTarget] = useModifyTarget();

  const handleCreateResult = id => {
    setNotification(`Target created with id ${id}.`);
  };

  const handleModifyResult = resp => {
    const {data} = resp;
    setNotification(`Target modified with ok=${data.modifyTarget.ok}.`);
  };

  return (
    <div>
      <Button
        title={'Create target'}
        onClick={() => createTarget(createTargetInput).then(handleCreateResult)}
      />
      <Button
        title={'Modify target'}
        onClick={() => modifyTarget(modifyTargetInput).then(handleModifyResult)}
      />
      <h3 data-testid="notification">{notification}</h3>
    </div>
  );
};

describe('Target mutation tests', () => {
  test('should create a target', async () => {
    const {render} = rendererWith({queryMocks: [createTargetMock]});

    const {element} = render(<CreateModifyTargetTestComponent />);

    const buttons = element.querySelectorAll('button');

    fireEvent.click(buttons[0]);

    await wait();

    expect(createTargetResult).toHaveBeenCalled();
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Target created with id 12345.',
    );
  });

  test('should modify a target', async () => {
    const {render} = rendererWith({queryMocks: [modifyTargetMock]});

    const {element} = render(<CreateModifyTargetTestComponent />);

    const buttons = element.querySelectorAll('button');

    fireEvent.click(buttons[1]);

    await wait();

    expect(modifyTargetResult).toHaveBeenCalled();
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Target modified with ok=true.',
    );
  });
});

const GetLazyTargetsComponent = () => {
  const [getTargets, {counts, loading, targets}] = useLazyGetTargets();

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getTargets()} />
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
      {isDefined(targets) ? (
        targets.map(target => {
          return (
            <div key={target.id} data-testid="target">
              {target.name}
            </div>
          );
        })
      ) : (
        <div data-testid="no-targets" />
      )}
    </div>
  );
};

describe('useLazyGetTargets tests', () => {
  test('should query targets after user interaction', async () => {
    const [mock, resultFunc] = createGetTargetsQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<GetLazyTargetsComponent />);

    let targetElements = screen.queryAllByTestId('target');
    expect(targetElements).toHaveLength(0);

    expect(screen.queryByTestId('no-targets')).toBeInTheDocument();
    expect(screen.queryByTestId('no-counts')).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    targetElements = screen.getAllByTestId('target');
    expect(targetElements).toHaveLength(2);

    expect(targetElements[0]).toHaveTextContent('target 1');
    expect(targetElements[1]).toHaveTextContent('target 2');

    expect(screen.queryByTestId('no-target')).not.toBeInTheDocument();

    expect(screen.getByTestId('total')).toHaveTextContent(2);
    expect(screen.getByTestId('filtered')).toHaveTextContent(2);
    expect(screen.getByTestId('first')).toHaveTextContent(1);
    expect(screen.getByTestId('limit')).toHaveTextContent(10);
    expect(screen.getByTestId('length')).toHaveTextContent(2);
  });
});

const GetTargetComponent = ({id}) => {
  const {loading, target, error} = useGetTarget(id);
  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      {error && <div data-testid="error">{error.message}</div>}
      {target && (
        <div data-testid="target">
          <span data-testid="id">{target.id}</span>
          <span data-testid="name">{target.name}</span>
        </div>
      )}
    </div>
  );
};

describe('useGetTarget tests', () => {
  test('should load target', async () => {
    const [queryMock, resultFunc] = createGetTargetQueryMock();

    const {render} = rendererWith({queryMocks: [queryMock]});

    render(<GetTargetComponent id="159" />);

    expect(screen.queryByTestId('loading')).toBeInTheDocument();

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();

    expect(screen.getByTestId('target')).toBeInTheDocument();

    expect(screen.getByTestId('id')).toHaveTextContent('159');
    expect(screen.getByTestId('name')).toHaveTextContent('target 1');
  });
});

const DeleteTargetsByIdsComponent = () => {
  const [deleteTargetsByIds] = useDeleteTargetsByIds();
  return (
    <button
      data-testid="bulk-delete"
      onClick={() => deleteTargetsByIds(['foo', 'bar'])}
    />
  );
};

describe('useDeleteTargetsByIds tests', () => {
  test('should delete a list of targets after user interaction', async () => {
    const [mock, resultFunc] = createDeleteTargetsByIdsQueryMock([
      'foo',
      'bar',
    ]);
    const {render} = rendererWith({queryMocks: [mock]});

    render(<DeleteTargetsByIdsComponent />);
    const button = screen.getByTestId('bulk-delete');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const ExportTargetsByIdsComponent = () => {
  const exportTargetsByIds = useExportTargetsByIds();
  return (
    <button
      data-testid="bulk-export"
      onClick={() => exportTargetsByIds(['159'])}
    />
  );
};

describe('useExportTargetsByIds tests', () => {
  test('should export a list of targets after user interaction', async () => {
    const [mock, resultFunc] = createExportTargetsByIdsQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ExportTargetsByIdsComponent />);
    const button = screen.getByTestId('bulk-export');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const CloneTargetComponent = () => {
  const [cloneTarget, {id: targetId}] = useCloneTarget();
  return (
    <div>
      {targetId && <span data-testid="cloned-target">{targetId}</span>}
      <button data-testid="clone" onClick={() => cloneTarget('159')} />
    </div>
  );
};

describe('useCloneTarget tests', () => {
  test('should clone a target after user interaction', async () => {
    const [mock, resultFunc] = createCloneTargetQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<CloneTargetComponent />);

    const button = screen.getByTestId('clone');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.getByTestId('cloned-target')).toHaveTextContent('bar');
  });
});

const DeleteTargetsByFilterComponent = () => {
  const [deleteTargetsByFilter] = useDeleteTargetsByFilter();
  return (
    <button
      data-testid="filter-delete"
      onClick={() => deleteTargetsByFilter('foo')}
    />
  );
};

describe('useDeleteTargetsByFilter tests', () => {
  test('should delete a list of targets by filter string after user interaction', async () => {
    const [mock, resultFunc] = createDeleteTargetsByFilterQueryMock('foo');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<DeleteTargetsByFilterComponent />);
    const button = screen.getByTestId('filter-delete');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const ExportTargetsByFilterComponent = () => {
  const exportTargetsByFilter = useExportTargetsByFilter();
  return (
    <button
      data-testid="filter-export"
      onClick={() => exportTargetsByFilter('foo')}
    />
  );
};

describe('useExportTargetsByFilter tests', () => {
  test('should export a list of targets by filter string after user interaction', async () => {
    const [mock, resultFunc] = createExportTargetsByFilterQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ExportTargetsByFilterComponent />);
    const button = screen.getByTestId('filter-export');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});
