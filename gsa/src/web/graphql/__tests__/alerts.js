/* Copyright (C) 2020-2021 Greenbone Networks GmbH
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
import Button from 'web/components/form/button';

import {rendererWith, screen, wait, fireEvent} from 'web/utils/testing';

import {
  useLazyGetAlerts,
  useCreateAlert,
  useModifyAlert,
  useCloneAlert,
  useDeleteAlert,
  useTestAlert,
  useDeleteAlertsByIds,
  useDeleteAlertsByFilter,
  useExportAlertsByIds,
  useExportAlertsByFilter,
  useGetAlert,
} from '../alerts';
import {
  createGetAlertsQueryMock,
  createModifyAlertQueryMock,
  createCreateAlertQueryMock,
  createAlertInput,
  modifyAlertInput,
  createDeleteAlertQueryMock,
  createTestAlertQueryMock,
  createCloneAlertQueryMock,
  createDeleteAlertsByFilterQueryMock,
  createExportAlertsByIdsQueryMock,
  createExportAlertsByFilterQueryMock,
  createDeleteAlertsByIdsQueryMock,
  createGetAlertQueryMock,
} from '../__mocks__/alerts';

const GetLazyAlertsComponent = () => {
  const [getAlerts, {counts, loading, alerts}] = useLazyGetAlerts();

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getAlerts()} />
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
      {isDefined(alerts) ? (
        alerts.map(alert => {
          return (
            <div key={alert.id} data-testid="alert">
              {alert.name}
            </div>
          );
        })
      ) : (
        <div data-testid="no-alert" />
      )}
    </div>
  );
};

describe('useLazyGetAlert tests', () => {
  test('should query alerts after user interaction', async () => {
    const [mock, resultFunc] = createGetAlertsQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<GetLazyAlertsComponent />);

    let alertElements = screen.queryAllByTestId('alert');
    expect(alertElements).toHaveLength(0);

    let noAlerts = screen.queryByTestId('no-alert');
    expect(noAlerts).toBeInTheDocument();
    const noCounts = screen.queryByTestId('no-counts');
    expect(noCounts).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    alertElements = screen.getAllByTestId('alert');
    expect(alertElements).toHaveLength(2);

    expect(alertElements[0]).toHaveTextContent('alert 1');
    expect(alertElements[1]).toHaveTextContent('alert 2');

    noAlerts = screen.queryByTestId('no-alert');
    expect(noAlerts).not.toBeInTheDocument();

    expect(screen.getByTestId('total')).toHaveTextContent(2);
    expect(screen.getByTestId('filtered')).toHaveTextContent(2);
    expect(screen.getByTestId('first')).toHaveTextContent(1);
    expect(screen.getByTestId('limit')).toHaveTextContent(10);
    expect(screen.getByTestId('length')).toHaveTextContent(2);
  });
});

const CreateModifyAlertComponent = () => {
  const [notification, setNotification] = useState('');

  const [createAlert] = useCreateAlert();
  const [modifyAlert] = useModifyAlert();

  const handleCreateResult = id => {
    setNotification(`Alert with id ${id} created.`);
  };

  const handleModifyResult = resp => {
    const {data} = resp;
    setNotification(`Alert modified with ok=${data.modifyAlert.ok}.`);
  };

  return (
    <div>
      <Button
        title={'Create alert'}
        onClick={() => createAlert(createAlertInput).then(handleCreateResult)}
      />
      <Button
        title={'Modify alert'}
        onClick={() => modifyAlert(modifyAlertInput).then(handleModifyResult)}
      />
      <h3 data-testid="notification">{notification}</h3>
    </div>
  );
};

describe('useCreateAlert test', () => {
  test('should create an alert', async () => {
    const [queryMock, resultFunc] = createCreateAlertQueryMock();

    const {render} = rendererWith({queryMocks: [queryMock]});

    const {element} = render(<CreateModifyAlertComponent />);

    const buttons = element.querySelectorAll('button');
    fireEvent.click(buttons[0]);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Alert with id 12345 created.',
    );
  });
});

describe('useModifyAlert test', () => {
  test('should modify an alert', async () => {
    const [queryMock, resultFunc] = createModifyAlertQueryMock();

    const {render} = rendererWith({queryMocks: [queryMock]});

    const {element} = render(<CreateModifyAlertComponent />);

    const buttons = element.querySelectorAll('button');
    fireEvent.click(buttons[1]);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Alert modified with ok=true.',
    );
  });
});

const DeleteAlertComponent = () => {
  const [deleteAlert] = useDeleteAlert();
  return <button data-testid="delete" onClick={() => deleteAlert('foo')} />;
};

describe('useDeleteAlert tests', () => {
  test('should delete an alert after user interaction', async () => {
    const [mock, resultFunc] = createDeleteAlertQueryMock('foo');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<DeleteAlertComponent />);

    const button = screen.getByTestId('delete');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const TestAlertComponent = () => {
  const [testAlert] = useTestAlert();
  return <button data-testid="test" onClick={() => testAlert('foo')} />;
};

describe('useTestAlert tests', () => {
  test('should test an alert after user interaction', async () => {
    const [mock, resultFunc] = createTestAlertQueryMock('foo');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<TestAlertComponent />);

    const button = screen.getByTestId('test');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const CloneAlertComponent = () => {
  const [cloneAlert, {id: alertId}] = useCloneAlert();
  return (
    <div>
      {alertId && <span data-testid="cloned-alert">{alertId}</span>}
      <button data-testid="clone" onClick={() => cloneAlert('foo')} />
    </div>
  );
};

describe('useCloneAlert tests', () => {
  test('should clone a alert after user interaction', async () => {
    const [mock, resultFunc] = createCloneAlertQueryMock('foo', 'foo2');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<CloneAlertComponent />);

    const button = screen.getByTestId('clone');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.getByTestId('cloned-alert')).toHaveTextContent('foo2');
  });
});

const DeleteAlertsByIdsComponent = () => {
  const [deleteAlertsByIds] = useDeleteAlertsByIds();
  return (
    <button
      data-testid="bulk-delete"
      onClick={() => deleteAlertsByIds(['foo', 'bar'])}
    />
  );
};

describe('useDeleteAlertsByIds tests', () => {
  test('should delete a list of alerts after user interaction', async () => {
    const [mock, resultFunc] = createDeleteAlertsByIdsQueryMock(['foo', 'bar']);
    const {render} = rendererWith({queryMocks: [mock]});

    render(<DeleteAlertsByIdsComponent />);
    const button = screen.getByTestId('bulk-delete');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const DeleteAlertsByFilterComponent = () => {
  const [deleteAlertsByFilter] = useDeleteAlertsByFilter();
  return (
    <button
      data-testid="filter-delete"
      onClick={() => deleteAlertsByFilter('foo')}
    />
  );
};

describe('useDeleteAlertsByFilter tests', () => {
  test('should delete a list of alerts by filter string after user interaction', async () => {
    const [mock, resultFunc] = createDeleteAlertsByFilterQueryMock('foo');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<DeleteAlertsByFilterComponent />);
    const button = screen.getByTestId('filter-delete');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const ExportAlertsByIdsComponent = () => {
  const exportAlertsByIds = useExportAlertsByIds();
  return (
    <button
      data-testid="bulk-export"
      onClick={() => exportAlertsByIds(['foo'])}
    />
  );
};

describe('useExportAlertsByIds tests', () => {
  test('should export a list of alerts after user interaction', async () => {
    const [mock, resultFunc] = createExportAlertsByIdsQueryMock(['foo']);
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ExportAlertsByIdsComponent />);
    const button = screen.getByTestId('bulk-export');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const ExportAlertsByFilterComponent = () => {
  const exportAlertsByFilter = useExportAlertsByFilter();
  return (
    <button
      data-testid="filter-export"
      onClick={() => exportAlertsByFilter('foo')}
    />
  );
};

describe('useExportAlertsByFilter tests', () => {
  test('should export a list of alerts by filter string after user interaction', async () => {
    const [mock, resultFunc] = createExportAlertsByFilterQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ExportAlertsByFilterComponent />);
    const button = screen.getByTestId('filter-export');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const GetAlertComponent = ({id}) => {
  const {loading, alert, error} = useGetAlert(id);
  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      {error && <div data-testid="error">{error.message}</div>}
      {alert && (
        <div data-testid="alert">
          <span data-testid="id">{alert.id}</span>
          <span data-testid="name">{alert.name}</span>
        </div>
      )}
    </div>
  );
};

describe('useGetAlert tests', () => {
  test('should load alert', async () => {
    const [queryMock, resultFunc] = createGetAlertQueryMock('1');

    const {render} = rendererWith({queryMocks: [queryMock]});

    render(<GetAlertComponent id="1" />);

    expect(screen.queryByTestId('loading')).toBeInTheDocument();

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();

    expect(screen.getByTestId('alert')).toBeInTheDocument();

    expect(screen.getByTestId('id')).toHaveTextContent('1');
    expect(screen.getByTestId('name')).toHaveTextContent('alert 1');
  });
});
