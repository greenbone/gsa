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
import {fireEvent, rendererWith, screen, wait} from 'web/utils/testing';

import {
  createCreateAuditQueryMock,
  createAuditInput,
  modifyAuditInput,
  createModifyAuditQueryMock,
  createStartAuditQueryMock,
  createStopAuditQueryMock,
  createResumeAuditQueryMock,
  createGetAuditQueryMock,
  createCloneAuditQueryMock,
  createDeleteAuditQueryMock,
  createExportAuditsByIdsQueryMock,
} from '../__mocks__/audits';
import {
  useCloneAudit,
  useCreateAudit,
  useDeleteAudit,
  useExportAuditsByIds,
  useGetAudit,
  useModifyAudit,
  useResumeAudit,
  useStartAudit,
  useStopAudit,
} from '../audits';

const StartAuditComponent = ({auditId}) => {
  const [startAudit, {reportId}] = useStartAudit();
  return (
    <div>
      {reportId && <span data-testid="report">{reportId}</span>}
      <button data-testid="start" onClick={() => startAudit(auditId)} />
    </div>
  );
};

describe('useStartAudit tests', () => {
  test('should start a audit after user interaction', async () => {
    const [mock, resultFunc] = createStartAuditQueryMock('657', 'r1');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<StartAuditComponent auditId="657" />);

    const button = screen.getByTestId('start');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.getByTestId('report')).toHaveTextContent('r1');
  });
});

const StopAuditComponent = ({auditId}) => {
  const [stopAudit] = useStopAudit();
  return (
    <div>
      <button data-testid="stop" onClick={() => stopAudit(auditId)} />
    </div>
  );
};

describe('useStopAudit tests', () => {
  test('should stop a audit after user interaction', async () => {
    const [mock, resultFunc] = createStopAuditQueryMock('657');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<StopAuditComponent auditId="657" />);

    const button = screen.getByTestId('stop');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const ResumeAuditComponent = ({auditId}) => {
  const [resumeAudit] = useResumeAudit();
  return (
    <div>
      <button data-testid="resume" onClick={() => resumeAudit(auditId)} />
    </div>
  );
};

describe('useResumeAudit tests', () => {
  test('should resume a audit after user interaction', async () => {
    const [mock, resultFunc] = createResumeAuditQueryMock('657');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ResumeAuditComponent auditId="657" />);

    const button = screen.getByTestId('resume');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const ModifyAuditComponent = ({data}) => {
  const [modifyAudit] = useModifyAudit();
  return (
    <div>
      <button data-testid="modify" onClick={() => modifyAudit(data)} />
    </div>
  );
};

describe('useModifyAudit tests', () => {
  test('should modify a audit after user interaction', async () => {
    const [mock, resultFunc] = createModifyAuditQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ModifyAuditComponent data={modifyAuditInput} />);

    const button = screen.getByTestId('modify');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const CreateAuditComponent = ({data}) => {
  const [createAudit] = useCreateAudit();

  return (
    <div>
      <button data-testid="create" onClick={() => createAudit(data)} />
    </div>
  );
};

describe('useCreateAudit tests', () => {
  test('should create a audit after user interaction', async () => {
    const [mock, resultFunc] = createCreateAuditQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<CreateAuditComponent data={createAuditInput} />);

    const button = screen.getByTestId('create');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const GetAuditComponent = ({id}) => {
  const {loading, audit, error} = useGetAudit(id);
  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      {error && <div data-testid="error">{error.message}</div>}
      {audit && (
        <div data-testid="audit">
          <span data-testid="id">{audit.id}</span>
          <span data-testid="name">{audit.name}</span>
        </div>
      )}
    </div>
  );
};

describe('useGetAudit tests', () => {
  test('should load audit', async () => {
    const [queryMock, resultFunc] = createGetAuditQueryMock();

    const {render} = rendererWith({queryMocks: [queryMock]});

    render(<GetAuditComponent id="657" />);

    expect(screen.queryByTestId('loading')).toBeInTheDocument();

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();

    expect(screen.getByTestId('audit')).toBeInTheDocument();

    expect(screen.getByTestId('id')).toHaveTextContent('657');
    expect(screen.getByTestId('name')).toHaveTextContent('foo');
  });
});

const CloneAuditComponent = () => {
  const [cloneAudit, {id: auditId}] = useCloneAudit();
  return (
    <div>
      {auditId && <span data-testid="cloned-audit">{auditId}</span>}
      <button data-testid="clone" onClick={() => cloneAudit('657')} />
    </div>
  );
};

describe('useCloneAudit tests', () => {
  test('should clone a audit after user interaction', async () => {
    const [mock, resultFunc] = createCloneAuditQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<CloneAuditComponent />);

    const button = screen.getByTestId('clone');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.getByTestId('cloned-audit')).toHaveTextContent('567');
  });
});

const DeleteAuditComponent = () => {
  const [deleteAudit] = useDeleteAudit();
  return <button data-testid="delete" onClick={() => deleteAudit('657')} />;
};

describe('useDeleteAudit tests', () => {
  test('should delete an audit after user interaction', async () => {
    const [mock, resultFunc] = createDeleteAuditQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<DeleteAuditComponent />);

    const button = screen.getByTestId('delete');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const ExportAuditsByIdsComponent = () => {
  const exportAuditsByIds = useExportAuditsByIds();
  return (
    <button
      data-testid="bulk-export"
      onClick={() => exportAuditsByIds(['657'])}
    />
  );
};

describe('useExportAuditsByIds tests', () => {
  test('should export a list of audits after user interaction', async () => {
    const [mock, resultFunc] = createExportAuditsByIdsQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ExportAuditsByIdsComponent />);
    const button = screen.getByTestId('bulk-export');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});
