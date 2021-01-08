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
import {GraphQLError} from 'graphql';

import {isDefined} from 'gmp/utils/identity';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';
import {
  useLazyGetScanConfigs,
  useLazyGetScanConfig,
  useCreateScanConfig,
  useImportScanConfig,
  useGetScanConfig,
  useExportScanConfigsByIds,
  useDeleteScanConfig,
  useCloneScanConfig,
  useLoadScanConfigPromise,
  useExportScanConfigsByFilter,
  useDeleteScanConfigsByIds,
  useDeleteScanConfigsByFilter,
  useModifyScanConfig,
  useModifyScanConfigSetNvtPreference,
} from '../scanconfigs';
import {
  createGetScanConfigsQueryMock,
  createGetScanConfigQueryMock,
  createCreateScanConfigQueryMock,
  createScanConfigInput,
  createImportScanConfigQueryMock,
  createExportScanConfigsByIdsQueryMock,
  createCloneScanConfigQueryMock,
  createDeleteScanConfigsByFilterQueryMock,
  createExportScanConfigsByFilterQueryMock,
  createDeleteScanConfigsByIdsQueryMock,
  createModifyScanConfigSetCommentQueryMock,
  createModifyScanConfigSetNameQueryMock,
  createModifyScanConfigSetScannerPreferenceQueryMock,
  createModifyScanConfigSetFamilySelectionQueryMock,
  createModifyScanConfigSetNvtPreferenceQueryMock,
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
  test('should import a scan config', async () => {
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

const GetScanConfigComponent = ({id}) => {
  const {loading, scanConfig, error} = useGetScanConfig(id);
  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      {error && <div data-testid="error">{error.message}</div>}
      {scanConfig && (
        <div data-testid="scanConfig">
          <span data-testid="id">{scanConfig.id}</span>
          <span data-testid="name">{scanConfig.name}</span>
        </div>
      )}
    </div>
  );
};

describe('useGetScanConfig tests', () => {
  test('should load scanConfig', async () => {
    const [queryMock, resultFunc] = createGetScanConfigQueryMock();

    const {render} = rendererWith({queryMocks: [queryMock]});

    render(<GetScanConfigComponent id="314" />);

    expect(screen.queryByTestId('loading')).toBeInTheDocument();

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();

    expect(screen.getByTestId('scanConfig')).toBeInTheDocument();

    expect(screen.getByTestId('id')).toHaveTextContent('314');
    expect(screen.getByTestId('name')).toHaveTextContent('Half empty and slow');
  });
});

const ExportScanConfigsByIdsComponent = () => {
  const exportScanConfigsByIds = useExportScanConfigsByIds();
  return (
    <button
      data-testid="bulk-export"
      onClick={() => exportScanConfigsByIds(['314'])}
    />
  );
};

describe('useExportScanConfigsByIds tests', () => {
  test('should export a list of scanConfigs after user interaction', async () => {
    const [mock, resultFunc] = createExportScanConfigsByIdsQueryMock(['314']);
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ExportScanConfigsByIdsComponent />);
    const button = screen.getByTestId('bulk-export');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const DeleteScanConfigComponent = () => {
  const [deleteScanConfig] = useDeleteScanConfig();
  return (
    <button data-testid="delete" onClick={() => deleteScanConfig('314')} />
  );
};

describe('useDeleteScanConfigsByIds tests', () => {
  test('should delete a list of scanConfigs after user interaction', async () => {
    const [mock, resultFunc] = createDeleteScanConfigsByIdsQueryMock(['314']);
    const {render} = rendererWith({queryMocks: [mock]});

    render(<DeleteScanConfigComponent />);
    const button = screen.getByTestId('delete');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const CloneScanConfigComponent = () => {
  const [cloneScanConfig, {id: scanConfigId}] = useCloneScanConfig();
  return (
    <div>
      {scanConfigId && (
        <span data-testid="cloned-scanConfig">{scanConfigId}</span>
      )}
      <button data-testid="clone" onClick={() => cloneScanConfig('314')} />
    </div>
  );
};

describe('useCloneScanConfig tests', () => {
  test('should clone a scanConfig after user interaction', async () => {
    const [mock, resultFunc] = createCloneScanConfigQueryMock('314', '354');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<CloneScanConfigComponent />);

    const button = screen.getByTestId('clone');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.getByTestId('cloned-scanConfig')).toHaveTextContent('354');
  });
});

const GetPromisedScanConfigComponent = () => {
  const loadScanConfigPromise = useLoadScanConfigPromise();
  const [scanConfig, setScanConfig] = useState();

  const handleLoadScanConfig = configId => {
    return loadScanConfigPromise(configId).then(response =>
      setScanConfig(response),
    );
  };

  return (
    <div>
      <button data-testid="load" onClick={() => handleLoadScanConfig('314')} />
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

describe('useLoadScanConfigPromise tests', () => {
  test('should query scanConfig after user interaction', async () => {
    const [mock, resultFunc] = createGetScanConfigQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});
    render(<GetPromisedScanConfigComponent />);

    await wait();

    let scanConfigElement = screen.queryAllByTestId('scanConfig');
    expect(scanConfigElement).toHaveLength(0);

    expect(screen.queryByTestId('no-scanConfig')).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    scanConfigElement = screen.getByTestId('scanConfig');

    expect(scanConfigElement).toHaveTextContent('314');
  });
});

const DeleteScanConfigsByIdsComponent = () => {
  const [deleteScanConfigsByIds] = useDeleteScanConfigsByIds();
  return (
    <button
      data-testid="bulk-delete"
      onClick={() => deleteScanConfigsByIds(['foo', 'bar'])}
    />
  );
};

describe('useDeleteScanConfigsByIds tests', () => {
  test('should delete a list of tasks after user interaction', async () => {
    const [mock, resultFunc] = createDeleteScanConfigsByIdsQueryMock([
      'foo',
      'bar',
    ]);
    const {render} = rendererWith({queryMocks: [mock]});

    render(<DeleteScanConfigsByIdsComponent />);
    const button = screen.getByTestId('bulk-delete');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const DeleteScanConfigsByFilterComponent = () => {
  const [deleteScanConfigsByFilter] = useDeleteScanConfigsByFilter();
  return (
    <button
      data-testid="filter-delete"
      onClick={() => deleteScanConfigsByFilter('foo')}
    />
  );
};

describe('useDeleteScanConfigsByFilter tests', () => {
  test('should delete a list of tasks by filter string after user interaction', async () => {
    const [mock, resultFunc] = createDeleteScanConfigsByFilterQueryMock('foo');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<DeleteScanConfigsByFilterComponent />);
    const button = screen.getByTestId('filter-delete');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const ExportScanConfigsByFilterComponent = () => {
  const exportScanConfigsByFilter = useExportScanConfigsByFilter();
  return (
    <button
      data-testid="filter-export"
      onClick={() => exportScanConfigsByFilter('foo')}
    />
  );
};

describe('useExportScanConfigsByFilter tests', () => {
  test('should export a list of tasks by filter string after user interaction', async () => {
    const [mock, resultFunc] = createExportScanConfigsByFilterQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ExportScanConfigsByFilterComponent />);
    const button = screen.getByTestId('filter-export');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const ModifyScanConfigComponent = ({input}) => {
  const modifyScanConfig = useModifyScanConfig();
  const [notification, setNotification] = useState();
  const [error, setError] = useState();

  const handleModifyScanConfig = () =>
    modifyScanConfig(input)
      .then(() => setNotification('Scan Config modified.'))
      .catch(setError);

  return (
    <div>
      {notification && <span data-testid="notification">{notification}</span>}
      {error && (
        <span data-testid="error">{`There was an error in the request: ${error}`}</span>
      )}
      <button
        data-testid="modify-scan-config"
        onClick={handleModifyScanConfig}
      />
    </div>
  );
};
const ModifyScanConfigSetNvtPreferenceComponent = ({input}) => {
  const [notification, setNotification] = useState('');

  const modifyScanConfigSetNvtSelection = useModifyScanConfigSetNvtPreference();

  const handleModifyResult = () => {
    setNotification(`NVT preference modified.`);
  };

  return (
    <div>
      <button
        data-testid="modify-nvt-preference"
        onClick={() =>
          modifyScanConfigSetNvtSelection(input).then(handleModifyResult)
        }
      />
      <h3 data-testid="notification">{notification}</h3>
    </div>
  );
};

describe('useModifyScanConfig tests', () => {
  test('should modify scan config', async () => {
    const saveConfigInput = {
      id: '314',
      name: 'very fast',
      comment: 'foo',
      scannerPreferenceValues: {nomushrooms: 'absolutelynot'},
      select: {hello: 1},
      trend: {hello: 0},
    };

    const [
      setNameMock,
      setNameResult,
    ] = createModifyScanConfigSetNameQueryMock();
    const [
      setCommentMock,
      setCommentResult,
    ] = createModifyScanConfigSetCommentQueryMock();
    const [
      setScannerPreferenceMock,
      setScannerPreferenceResult,
    ] = createModifyScanConfigSetScannerPreferenceQueryMock();
    const [
      setFamilySelectionMock,
      setFamilySelectionResult,
    ] = createModifyScanConfigSetFamilySelectionQueryMock();

    const {render} = rendererWith({
      queryMocks: [
        setNameMock,
        setCommentMock,
        setScannerPreferenceMock,
        setFamilySelectionMock,
      ],
    });

    render(<ModifyScanConfigComponent input={saveConfigInput} />);

    await wait();

    const button = screen.getByTestId('modify-scan-config');
    fireEvent.click(button);

    await wait();

    expect(setNameResult).toHaveBeenCalled();
    expect(setCommentResult).toHaveBeenCalled();

    await wait();

    expect(setScannerPreferenceResult).toHaveBeenCalled();
    await wait();

    expect(setFamilySelectionResult).toHaveBeenCalled();

    await wait();

    expect(screen.queryByTestId('notification')).toHaveTextContent(
      'Scan Config modified.',
    );
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
  });

  test('should modify in use scan config', async () => {
    const saveConfigInput = {
      id: '314',
      name: 'very fast',
      comment: 'foo',
    }; // in use configs don't have all args

    const [
      setNameMock,
      setNameResult,
    ] = createModifyScanConfigSetNameQueryMock();
    const [
      setCommentMock,
      setCommentResult,
    ] = createModifyScanConfigSetCommentQueryMock();
    const [
      setScannerPreferenceMock,
      setScannerPreferenceResult,
    ] = createModifyScanConfigSetScannerPreferenceQueryMock();
    const [
      setFamilySelectionMock,
      setFamilySelectionResult,
    ] = createModifyScanConfigSetFamilySelectionQueryMock();

    const {render} = rendererWith({
      queryMocks: [
        setNameMock,
        setCommentMock,
        setScannerPreferenceMock,
        setFamilySelectionMock,
      ],
    });

    render(<ModifyScanConfigComponent input={saveConfigInput} />);

    await wait();

    const button = screen.getByTestId('modify-scan-config');
    fireEvent.click(button);

    await wait();

    expect(setNameResult).toHaveBeenCalled();
    expect(setCommentResult).toHaveBeenCalled();

    await wait();

    expect(setScannerPreferenceResult).not.toHaveBeenCalled();
    await wait();

    expect(setFamilySelectionResult).not.toHaveBeenCalled();

    await wait();

    expect(screen.queryByTestId('notification')).toHaveTextContent(
      'Scan Config modified.',
    );
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
  });

  test('should catch error state', async () => {
    const saveConfigInput = {
      id: '314',
      name: 'very fast',
      comment: 'foo',
      scannerPreferenceValues: {nomushrooms: 'absolutelynot'},
      select: {hello: 1},
      trend: {hello: 0},
    };
    const error = new GraphQLError('Oops. Something went wrong :(');

    const [
      setNameMock,
      setNameResult,
    ] = createModifyScanConfigSetNameQueryMock();
    const [
      setCommentMock,
      setCommentResult,
    ] = createModifyScanConfigSetCommentQueryMock();
    const [
      setScannerPreferenceMock,
      setScannerPreferenceResult,
    ] = createModifyScanConfigSetScannerPreferenceQueryMock([error]);
    const [
      setFamilySelectionMock,
      setFamilySelectionResult,
    ] = createModifyScanConfigSetFamilySelectionQueryMock();

    const {render} = rendererWith({
      queryMocks: [
        setNameMock,
        setCommentMock,
        setScannerPreferenceMock,
        setFamilySelectionMock,
      ],
    });

    render(<ModifyScanConfigComponent input={saveConfigInput} />);

    await wait();

    const button = screen.getByTestId('modify-scan-config');
    fireEvent.click(button);

    await wait();

    expect(setNameResult).toHaveBeenCalled();
    expect(setCommentResult).toHaveBeenCalled();

    await wait();

    expect(setScannerPreferenceResult).toHaveBeenCalled();
    await wait();

    expect(setFamilySelectionResult).not.toHaveBeenCalled();

    await wait();

    expect(screen.queryByTestId('notification')).not.toBeInTheDocument();

    const gqlError = screen.queryByTestId('error');
    expect(gqlError).toBeInTheDocument();
    expect(gqlError).toHaveTextContent(
      'There was an error in the request: Error: Oops. Something went wrong :(',
    );
  });
  test('should modify nvt preferences', async () => {
    const input = {
      id: '314',
      oid: '1.2.3.4',
      preferenceValues: {'username:': {id: 1, value: 'admin', type: 'entry'}},
    };
    const [
      queryMock,
      resultFunc,
    ] = createModifyScanConfigSetNvtPreferenceQueryMock();

    const {render} = rendererWith({queryMocks: [queryMock]});

    render(<ModifyScanConfigSetNvtPreferenceComponent input={input} />);

    await wait();

    const button = screen.queryByTestId('modify-nvt-preference');

    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    await wait();

    expect(screen.getByTestId('notification')).toHaveTextContent(
      'NVT preference modified.',
    );
  });
});
