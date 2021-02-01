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
} from '../__mocks__/audits';
import {
  useCreateAudit,
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
