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

import React, {useState} from 'react';

import {isDefined} from 'gmp/utils/identity';

import Button from 'web/components/form/button';

import {rendererWith, fireEvent, wait, screen} from 'web/utils/testing';

import {
  useCloneOverride,
  useCreateOverride,
  useDeleteOverridesByIds,
  useDeleteOverridesByFilter,
  useExportOverridesByFilter,
  useExportOverridesByIds,
  useGetOverride,
  useLazyGetOverrides,
  useModifyOverride,
} from '../overrides';

import {
  createCloneOverrideQueryMock,
  createDeleteOverridesByFilterQueryMock,
  createDeleteOverridesByIdsQueryMock,
  createDeleteOverrideQueryMock,
  createExportOverridesByFilterQueryMock,
  createExportOverridesByIdsQueryMock,
  createGetOverridesQueryMock,
  createGetOverrideQueryMock,
  createCreateOverrideQueryMock,
  createModifyOverrideQueryMock,
  createOverrideInput,
  modifyOverrideInput,
} from '../__mocks__/overrides';

const GetLazyOverridesComponent = () => {
  const [getOverrides, {counts, loading, overrides}] = useLazyGetOverrides();

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getOverrides()} />
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
      {isDefined(overrides) ? (
        overrides.map(override => {
          return (
            <div key={override.id} data-testid="override">
              {override.id}
            </div>
          );
        })
      ) : (
        <div data-testid="no-overrides" />
      )}
    </div>
  );
};

const CreateModifyOverrideComponent = () => {
  const [notification, setNotification] = useState('');

  const [createOverride] = useCreateOverride();
  const [modifyOverride] = useModifyOverride();

  const handleCreateResult = resp => {
    const {data} = resp;
    setNotification('Override created with id ' + data.createOverride.id + '.');
  };

  const handleModifyResult = resp => {
    const {data} = resp;
    setNotification(
      'Override modified with ok=' + data.modifyOverride.ok + '.',
    );
  };

  return (
    <div>
      <Button
        title={'Create Override'}
        onClick={() =>
          createOverride(createOverrideInput).then(handleCreateResult)
        }
      />
      <Button
        title={'Modify Override'}
        onClick={() =>
          modifyOverride(modifyOverrideInput).then(handleModifyResult)
        }
      />
      <h3 data-testid="notification">{notification}</h3>
    </div>
  );
};

const CloneOverrideComponent = () => {
  const [cloneOverride, {id: overrideId}] = useCloneOverride();
  return (
    <div>
      {overrideId && <span data-testid="cloned-override">{overrideId}</span>}
      <button data-testid="clone" onClick={() => cloneOverride('123')} />
    </div>
  );
};

const DeleteOverridesByIdsComponent = () => {
  const [deleteOverridesByIds] = useDeleteOverridesByIds();
  return (
    <button
      data-testid="bulk-delete"
      onClick={() => deleteOverridesByIds(['foo', 'bar'])}
    />
  );
};

const DeleteOverridesByFilterComponent = () => {
  const [deleteOverridesByFilter] = useDeleteOverridesByFilter();
  return (
    <button
      data-testid="filter-delete"
      onClick={() => deleteOverridesByFilter('foo')}
    />
  );
};

const ExportOverridesByIdsComponent = () => {
  const exportOverridesByIds = useExportOverridesByIds();
  return (
    <button
      data-testid="bulk-export"
      onClick={() => exportOverridesByIds(['123'])}
    />
  );
};

const DeleteOverrideComponent = () => {
  const [deleteOverride] = useDeleteOverridesByIds();
  return (
    <button data-testid="delete" onClick={() => deleteOverride(['123'])} />
  );
};

/* eslint-disable react/prop-types */
const GetOverrideComponent = ({id}) => {
  const {loading, override, error} = useGetOverride(id);
  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      {error && <div data-testid="error">{error.message}</div>}
      {override && (
        <div data-testid="override">
          <span data-testid="id">{override.id}</span>
          <span data-testid="active">{override.active}</span>
          <span data-testid="creationTime">{override.creationTime}</span>
          <span data-testid="endTime">{override.endTime}</span>
          <span data-testid="hosts">{override.hosts}</span>
          <span data-testid="modificationTime">
            {override.modificationTime}
          </span>
          <span data-testid="nvtId">{override.nvt?.id}</span>
          <span data-testid="nvtName">{override.nvt?.name}</span>
          <span data-testid="owner">{override.owner}</span>
          <span data-testid="resultId">{override.result?.id}</span>
          <span data-testid="resultName">{override.result?.name}</span>
          <span data-testid="port">{override.port}</span>
          <span data-testid="severity">{override.severity}</span>
          <span data-testid="newSeverity">{override.newSeverity}</span>
          <span data-testid="taskId">{override.task?.id}</span>
          <span data-testid="taskName">{override.task?.name}</span>
          <span data-testid="text">{override.text}</span>
          <span data-testid="writable">{override.writable}</span>
        </div>
      )}
    </div>
  );
};

const ExportOverridesByFilterComponent = () => {
  const exportOverridesByFilter = useExportOverridesByFilter();
  return (
    <button
      data-testid="filter-export"
      onClick={() => exportOverridesByFilter('foo')}
    />
  );
};

describe('useLazyGetOverrides tests', () => {
  test('should query overrides after user interaction', async () => {
    const [mock, resultFunc] = createGetOverridesQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<GetLazyOverridesComponent />);

    let overrideElements = screen.queryAllByTestId('override');
    expect(overrideElements).toHaveLength(0);

    expect(screen.queryByTestId('no-overrides')).toBeInTheDocument();
    expect(screen.queryByTestId('no-counts')).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    overrideElements = screen.getAllByTestId('override');
    expect(overrideElements).toHaveLength(1);

    expect(overrideElements[0]).toHaveTextContent('123');

    expect(screen.queryByTestId('no-overrides')).not.toBeInTheDocument();

    expect(screen.getByTestId('total')).toHaveTextContent(1);
    expect(screen.getByTestId('filtered')).toHaveTextContent(1);
    expect(screen.getByTestId('first')).toHaveTextContent(1);
    expect(screen.getByTestId('limit')).toHaveTextContent(10);
    expect(screen.getByTestId('length')).toHaveTextContent(1);
  });
});

describe('useLazyGetOverrides tests', () => {
  test('should query overrides after user interaction', async () => {
    const [mock, resultFunc] = createGetOverridesQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<GetLazyOverridesComponent />);

    let overrideElements = screen.queryAllByTestId('override');
    expect(overrideElements).toHaveLength(0);

    expect(screen.queryByTestId('no-overrides')).toBeInTheDocument();
    expect(screen.queryByTestId('no-counts')).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    overrideElements = screen.getAllByTestId('override');
    expect(overrideElements).toHaveLength(1);

    expect(overrideElements[0]).toHaveTextContent('123');

    expect(screen.queryByTestId('no-overrides')).not.toBeInTheDocument();

    expect(screen.getByTestId('total')).toHaveTextContent(1);
    expect(screen.getByTestId('filtered')).toHaveTextContent(1);
    expect(screen.getByTestId('first')).toHaveTextContent(1);
    expect(screen.getByTestId('limit')).toHaveTextContent(10);
    expect(screen.getByTestId('length')).toHaveTextContent(1);
  });
});

describe('Override mutation tests', () => {
  test('should create a override', async () => {
    const [
      createOverrideMock,
      createOverrideResult,
    ] = createCreateOverrideQueryMock();
    const {render} = rendererWith({queryMocks: [createOverrideMock]});

    const {element} = render(<CreateModifyOverrideComponent />);

    const buttons = element.querySelectorAll('button');

    fireEvent.click(buttons[0]);

    await wait();

    expect(createOverrideResult).toHaveBeenCalled();
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Override created with id 6d00d22f-551b-4fbe-8215-d8615eff73ea.',
    );
  });

  test('should modify a override', async () => {
    const [
      modifyOverrideMock,
      modifyOverrideResult,
    ] = createModifyOverrideQueryMock();

    const {render} = rendererWith({queryMocks: [modifyOverrideMock]});

    const {element} = render(<CreateModifyOverrideComponent />);

    const buttons = element.querySelectorAll('button');

    fireEvent.click(buttons[1]);

    await wait();

    expect(modifyOverrideResult).toHaveBeenCalled();
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Override modified with ok=true.',
    );
  });
});

describe('useDeleteOverridesByIds tests', () => {
  test('should delete a list of overrides after user interaction', async () => {
    const [mock, resultFunc] = createDeleteOverridesByIdsQueryMock([
      'foo',
      'bar',
    ]);
    const {render} = rendererWith({queryMocks: [mock]});

    render(<DeleteOverridesByIdsComponent />);
    const button = screen.getByTestId('bulk-delete');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

describe('useDeleteOverridesByFilter tests', () => {
  test('should delete a list of overrides by filter string after user interaction', async () => {
    const [mock, resultFunc] = createDeleteOverridesByFilterQueryMock('foo');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<DeleteOverridesByFilterComponent />);
    const button = screen.getByTestId('filter-delete');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

describe('useExportOverridesByIds tests', () => {
  test('should export a list of overrides after user interaction', async () => {
    const [mock, resultFunc] = createExportOverridesByIdsQueryMock(['123']);
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ExportOverridesByIdsComponent />);
    const button = screen.getByTestId('bulk-export');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

describe('useExportOverridesByFilter tests', () => {
  test('should export a list of overrides by filter string after user interaction', async () => {
    const [mock, resultFunc] = createExportOverridesByFilterQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ExportOverridesByFilterComponent />);
    const button = screen.getByTestId('filter-export');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

describe('useCloneOverride tests', () => {
  test('should clone a override after user interaction', async () => {
    const [mock, resultFunc] = createCloneOverrideQueryMock('123', '456');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<CloneOverrideComponent />);

    const button = screen.getByTestId('clone');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.getByTestId('cloned-override')).toHaveTextContent('456');
  });
});

describe('useDeleteOverride tests', () => {
  test('should delete a override after user interaction', async () => {
    const [mock, resultFunc] = createDeleteOverrideQueryMock('123');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<DeleteOverrideComponent />);

    const button = screen.getByTestId('delete');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

describe('useGetOverride tests', () => {
  test('should load override', async () => {
    const [queryMock, resultFunc] = createGetOverrideQueryMock();

    const {render} = rendererWith({queryMocks: [queryMock]});

    render(<GetOverrideComponent id="456" />);

    expect(screen.queryByTestId('loading')).toBeInTheDocument();

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();

    expect(screen.getByTestId('override')).toBeInTheDocument();

    expect(screen.getByTestId('id')).toHaveTextContent('456');
    expect(screen.getByTestId('active')).toHaveTextContent('1');
    expect(screen.getByTestId('creationTime')).toHaveTextContent(
      '2021-02-19T14:14:11Z',
    );
    expect(screen.getByTestId('endTime')).toHaveTextContent(
      '2021-12-23T14:14:11Z',
    );
    expect(screen.getByTestId('hosts')).toHaveTextContent('127.0.0.1127.0.0.2');
    expect(screen.getByTestId('modificationTime')).toHaveTextContent(
      '2021-01-04T11:54:12Z',
    );
    expect(screen.getByTestId('newSeverity')).toHaveTextContent('9.0');
    expect(screen.getByTestId('nvtId')).toHaveTextContent('123');
    expect(screen.getByTestId('nvtName')).toHaveTextContent('foo nvt');
    expect(screen.getByTestId('owner')).toHaveTextContent('admin');
    expect(screen.getByTestId('resultId')).toHaveTextContent('1337');
    expect(screen.getByTestId('resultName')).toHaveTextContent('result name');
    expect(screen.getByTestId('port')).toHaveTextContent('666/tcp');
    expect(screen.getByTestId('severity')).toHaveTextContent('5.0');
    expect(screen.getByTestId('taskId')).toHaveTextContent('42');
    expect(screen.getByTestId('taskName')).toHaveTextContent('task x');
    expect(screen.getByTestId('text')).toHaveTextContent('override text');
    expect(screen.getByTestId('writable')).toHaveTextContent('1');
  });
});
