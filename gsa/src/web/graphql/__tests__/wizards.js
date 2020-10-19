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
import {v4 as uuid} from 'uuid';

import {GraphQLError} from 'graphql';

import date, {setLocale} from 'gmp/models/date';

import {rendererWith, screen, wait, fireEvent} from 'web/utils/testing';

import {useRunQuickFirstScan, useRunModifyTask} from '../wizards';

import {
  createWizardTargetQueryMock,
  createWizardStartTaskQueryMock,
  createWizardTaskQueryMock,
  createWizardScheduleQueryMock,
  createWizardAlertQueryMock,
  createWizardModifyTaskQueryMock,
} from '../__mocks__/wizards';

setLocale('en'); // Required for composing wizard entity name

jest.mock('uuid');

const RealDate = Date;

const mockDate = new Date(1554632430000);

uuid.mockImplementation(() => 'fakeUUID123');

beforeAll(() => {
  global.Date = jest.fn(() => mockDate);
  global.Date.now = jest.fn(() => mockDate.getTime());
});

afterEach(() => {
  // if not, then the call count of each function will persist between tests
  jest.clearAllMocks();
});

afterAll(() => {
  global.Date = RealDate;
  global.Date.now = RealDate.now;
});

const RunQuickFirstScanComponent = () => {
  const [runQuickFirstScan] = useRunQuickFirstScan();
  const [reportId, setReportId] = useState();
  const [error, setError] = useState();

  const handleRunQuickFirstScan = async () => {
    try {
      await runQuickFirstScan({hosts: '127.0.0.1, 192.168.0.1'}).then(id =>
        setReportId(id),
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      {reportId && (
        <span data-testid="started-task">{`Task started with report ${reportId}`}</span>
      )}
      {error && (
        <span data-testid="error">{`There was an error in the request: ${error}`}</span>
      )}
      <button data-testid="wizard" onClick={handleRunQuickFirstScan} />
    </div>
  );
};

describe('useRunQuickFirstScan tests', () => {
  test('Should create target, run and start task after user interaction', async () => {
    const [targetMock, targetResult] = createWizardTargetQueryMock();
    const [taskMock, taskResult] = createWizardTaskQueryMock();
    const [startTaskMock, startTaskResult] = createWizardStartTaskQueryMock();

    const {render} = rendererWith({
      queryMocks: [targetMock, taskMock, startTaskMock],
    });

    render(<RunQuickFirstScanComponent />);

    const button = screen.getByTestId('wizard');
    fireEvent.click(button);

    await wait();

    expect(targetResult).toHaveBeenCalled();

    await wait();

    expect(taskResult).toHaveBeenCalled();

    await wait();

    expect(startTaskResult).toHaveBeenCalled();

    const startTaskReportId = await screen.getByTestId('started-task');
    expect(startTaskReportId).toHaveTextContent(
      'Task started with report 13245',
    );
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
  });

  test('Should gracefully catch error in promise chain', async () => {
    const error = new GraphQLError('Oops. Something went wrong :(');
    const [targetMock, targetResult] = createWizardTargetQueryMock();
    const [taskMock, taskResult] = createWizardTaskQueryMock([error]);
    const [startTaskMock, startTaskResult] = createWizardStartTaskQueryMock();

    const {render} = rendererWith({
      queryMocks: [targetMock, taskMock, startTaskMock],
    });

    render(<RunQuickFirstScanComponent />);

    const button = screen.getByTestId('wizard');
    fireEvent.click(button);

    await wait();

    expect(targetResult).toHaveBeenCalled();

    await wait();

    expect(taskResult).toHaveBeenCalled();

    await wait();

    expect(startTaskResult).not.toHaveBeenCalled();

    expect(screen.queryByTestId('started-task')).not.toBeInTheDocument();

    const gqlError = screen.queryByTestId('error');

    expect(gqlError).toHaveTextContent(
      'There was an error in the request: Oops. Something went wrong :(',
    );
  });
});

const RunModifyTaskComponent = ({alertEmail, reschedule}) => {
  const [runModifyTask] = useRunModifyTask();
  const [ok, setOk] = useState(false);
  const [error, setError] = useState();

  const handleRunModifyTask = async () => {
    try {
      await runModifyTask({
        alert_email: alertEmail,
        start_date: date(),
        start_minute: 13,
        start_hour: 13,
        start_timezone: 'Europe/Berlin',
        reschedule,
        tasks: [
          {
            name: 'myFirstTask',
            id: '13579',
            alerts: [{id: '34567'}],
          },
        ],
      }).then(() => setOk(true));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      {ok && <span data-testid="modify-task">{'Task modified'}</span>}
      {error && (
        <span data-testid="error">{`There was an error in the request: ${error}`}</span>
      )}
      <button data-testid="wizard" onClick={handleRunModifyTask} />
    </div>
  );
};

describe('useRunModifyTask tests', () => {
  test('Should create schedule, alert, and modify task after user interaction', async () => {
    const [scheduleMock, scheduleResult] = createWizardScheduleQueryMock();
    const [alertMock, alertResult] = createWizardAlertQueryMock();
    const [modifyTaskMock, modifyTaskResult] = createWizardModifyTaskQueryMock(
      '12345',
      '23456',
    );

    const {render} = rendererWith({
      queryMocks: [scheduleMock, alertMock, modifyTaskMock],
    });

    render(
      <RunModifyTaskComponent alertEmail={'foo@bar.com'} reschedule={1} />,
    );

    const button = screen.getByTestId('wizard');
    fireEvent.click(button);

    await wait();

    expect(scheduleResult).toHaveBeenCalled();

    await wait();

    expect(alertResult).toHaveBeenCalled();

    await wait();

    expect(modifyTaskResult).toHaveBeenCalled();

    const taskModified = await screen.getByTestId('modify-task');
    expect(taskModified).toHaveTextContent('Task modified');
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
  });

  test('Should gracefully catch error in promise chain', async () => {
    const error = new GraphQLError('Oops. Something went wrong :(');
    const [scheduleMock, scheduleResult] = createWizardScheduleQueryMock([
      error,
    ]);
    const [alertMock, alertResult] = createWizardAlertQueryMock();
    const [
      modifyTaskMock,
      modifyTaskResult,
    ] = createWizardModifyTaskQueryMock();

    const {render} = rendererWith({
      queryMocks: [scheduleMock, alertMock, modifyTaskMock],
    });

    render(
      <RunModifyTaskComponent alertEmail={'foo@bar.com'} reschedule={1} />,
    );

    const button = screen.getByTestId('wizard');
    fireEvent.click(button);

    await wait();

    expect(scheduleResult).toHaveBeenCalled();

    await wait();

    expect(alertResult).not.toHaveBeenCalled();

    await wait();

    expect(modifyTaskResult).not.toHaveBeenCalled();

    expect(screen.queryByTestId('modify-task')).not.toBeInTheDocument();

    const gqlError = screen.queryByTestId('error');

    expect(gqlError).toHaveTextContent(
      'There was an error in the request: Oops. Something went wrong :(',
    );
  });

  test('Should not create a schedule if reschedule is 0', async () => {
    const [scheduleMock, scheduleResult] = createWizardScheduleQueryMock();
    const [alertMock, alertResult] = createWizardAlertQueryMock();
    const [modifyTaskMock, modifyTaskResult] = createWizardModifyTaskQueryMock(
      undefined,
      '23456',
    );

    const {render} = rendererWith({
      queryMocks: [scheduleMock, alertMock, modifyTaskMock],
    });

    render(
      <RunModifyTaskComponent alertEmail={'foo@bar.com'} reschedule={0} />,
    );

    const button = screen.getByTestId('wizard');
    fireEvent.click(button);

    await wait();

    expect(scheduleResult).not.toHaveBeenCalled();

    await wait();

    expect(alertResult).toHaveBeenCalled();

    await wait();

    expect(modifyTaskResult).toHaveBeenCalled();

    const taskModified = await screen.getByTestId('modify-task');
    expect(taskModified).toHaveTextContent('Task modified');
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
  });

  test('Should not create an alert if alert_email is empty string', async () => {
    const [scheduleMock, scheduleResult] = createWizardScheduleQueryMock();
    const [alertMock, alertResult] = createWizardAlertQueryMock();
    const [modifyTaskMock, modifyTaskResult] = createWizardModifyTaskQueryMock(
      '12345',
      undefined,
    );

    const {render} = rendererWith({
      queryMocks: [scheduleMock, alertMock, modifyTaskMock],
    });

    render(<RunModifyTaskComponent alertEmail={''} reschedule={1} />);

    const button = screen.getByTestId('wizard');
    fireEvent.click(button);

    await wait();

    expect(scheduleResult).toHaveBeenCalled();

    await wait();

    expect(alertResult).not.toHaveBeenCalled();

    await wait();

    expect(modifyTaskResult).toHaveBeenCalled();

    const taskModified = await screen.getByTestId('modify-task');
    expect(taskModified).toHaveTextContent('Task modified');
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
  });
});
