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

import {GraphQLError} from 'graphql'; // ES6

import date, {setLocale} from 'gmp/models/date';

import {setUsername, setTimezone} from 'web/store/usersettings/actions';
import {rendererWith, screen, wait, fireEvent} from 'web/utils/testing';

import {useRunQuickFirstScan} from '../wizards';

import {
  createWizardTargetQueryMock,
  createWizardStartTaskQueryMock,
  createWizardTaskQueryMock,
} from '../__mocks__/wizards';

setLocale('en'); // Required for composing wizard target name

const RealDate = Date;

const mockDate = new Date(1554632430000);

beforeAll(() => {
  global.Date = jest.fn(() => mockDate);
  global.Date.now = jest.fn(() => mockDate.getTime());
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

    const gmp = {
      settings: {
        enableHyperionOnly: false,
      },
    };

    const {render, store} = rendererWith({
      queryMocks: [targetMock, taskMock, startTaskMock],
      store: true,
      gmp,
    });

    store.dispatch(setUsername('foo'));
    store.dispatch(setTimezone('UTC'));

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

    const gmp = {
      settings: {
        enableHyperionOnly: false,
      },
    };

    const {render, store} = rendererWith({
      queryMocks: [targetMock, taskMock, startTaskMock],
      store: true,
      gmp,
    });

    store.dispatch(setUsername('foo'));
    store.dispatch(setTimezone('UTC'));

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
