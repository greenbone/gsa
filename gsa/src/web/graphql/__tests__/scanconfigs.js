/* Copyright (C) 2020 Greenbone Networks GmbH
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
  useLazyGetScanConfigs,
  useLazyGetScanConfig,
  useCreateScanConfig,
  useImportScanConfig,
} from '../scanconfigs';
import {
  createGetScanConfigsQueryMock,
  createGetScanConfigQueryMock,
  createCreateScanConfigQueryMock,
  createScanConfigInput,
  createImportScanConfigQueryMock,
  importScanConfigInput,
} from '../__mocks__/scanconfigs';

const GetLazyScanConfigsComponent = () => {
  const [
    getScanConfigs,
    {counts, loading, scanConfigs},
  ] = useLazyGetScanConfigs();

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getScanConfigs()} />
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
      {isDefined(scanConfigs) ? (
        scanConfigs.map(scanConfig => {
          return (
            <div key={scanConfig.id} data-testid="scanConfig">
              {scanConfig.id}
            </div>
          );
        })
      ) : (
        <div data-testid="no-scanConfigs" />
      )}
    </div>
  );
};

describe('useLazyGetScanConfigs tests', () => {
  test('should query scanConfigs after user interaction', async () => {
    const [mock, resultFunc] = createGetScanConfigsQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});
    render(<GetLazyScanConfigsComponent />);

    let scanConfigElements = screen.queryAllByTestId('scanConfig');
    expect(scanConfigElements).toHaveLength(0);

    expect(screen.queryByTestId('no-scanConfigs')).toBeInTheDocument();
    expect(screen.queryByTestId('no-counts')).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    scanConfigElements = screen.getAllByTestId('scanConfig');
    expect(scanConfigElements).toHaveLength(1);

    expect(scanConfigElements[0]).toHaveTextContent('314');

    expect(screen.queryByTestId('no-scanConfigs')).not.toBeInTheDocument();

    await wait();

    expect(screen.getByTestId('total')).toHaveTextContent(1);
    expect(screen.getByTestId('filtered')).toHaveTextContent(1);
    expect(screen.getByTestId('first')).toHaveTextContent(1);
    expect(screen.getByTestId('limit')).toHaveTextContent(10);
    expect(screen.getByTestId('length')).toHaveTextContent(1);
  });
});

const GetLazyScanConfigComponent = () => {
  const [getScanConfig, {scanConfig, loading}] = useLazyGetScanConfig();

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getScanConfig('314')} />
      {isDefined(scanConfig) ? (
        <div key={scanConfig.id} data-testid="scanConfig">
          {scanConfig.id}
        </div>
      ) : (
        <div data-testid="no-scanConfig" />
      )}
    </div>
  );
};

describe('useLazyGetScanConfig tests', () => {
  test('should query scanConfig after user interaction', async () => {
    const [mock, resultFunc] = createGetScanConfigQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});
    render(<GetLazyScanConfigComponent />);

    let scanConfigElement = screen.queryAllByTestId('scanConfig');
    expect(scanConfigElement).toHaveLength(0);

    expect(screen.queryByTestId('no-scanConfig')).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    scanConfigElement = screen.getByTestId('scanConfig');

    expect(scanConfigElement).toHaveTextContent('314');

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });
});

const CreateScanConfigComponent = () => {
  const [notification, setNotification] = useState('');

  const [createScanConfig] = useCreateScanConfig();

  const handleCreateResult = id => {
    setNotification(`ScanConfig created with id ${id}.`);
  };

  return (
    <div>
      <button
        title={'Create ScanConfig'}
        onClick={() =>
          createScanConfig(createScanConfigInput).then(handleCreateResult)
        }
      />
      <h3 data-testid="notification">{notification}</h3>
    </div>
  );
};

describe('ScanConfig mutation tests', () => {
  test('should create a scan config', async () => {
    const [
      createScanConfigMock,
      createScanConfigResult,
    ] = createCreateScanConfigQueryMock();
    const {render} = rendererWith({queryMocks: [createScanConfigMock]});

    const {element} = render(<CreateScanConfigComponent />);

    const buttons = element.querySelectorAll('button');

    fireEvent.click(buttons[0]);

    await wait();

    expect(createScanConfigResult).toHaveBeenCalled();
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'ScanConfig created with id 12345.',
    );
  });
});

const ImportScanConfigComponent = () => {
  const [notification, setNotification] = useState('');

  const [importScanConfig] = useImportScanConfig();

  const handleCreateResult = id => {
    setNotification(`ScanConfig imported with id ${id}.`);
  };

  return (
    <div>
      <button
        title={'Import ScanConfig'}
        onClick={() =>
          importScanConfig('<get_configs_response />').then(handleCreateResult)
        }
      />
      <h3 data-testid="notification">{notification}</h3>
    </div>
  );
};

describe('Import Scan Config tests', () => {
  test.only('should import a scan config', async () => {
    const [
      importScanConfigQueryMock,
      importScanConfigQueryResult,
    ] = createImportScanConfigQueryMock();
    const {render} = rendererWith({queryMocks: [importScanConfigQueryMock]});

    const {element} = render(<ImportScanConfigComponent />);

    const buttons = element.querySelectorAll('button');

    fireEvent.click(buttons[0]);

    await wait();

    expect(importScanConfigQueryResult).toHaveBeenCalled();
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'ScanConfig imported with id 13245.',
    );
  });
});
