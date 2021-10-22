/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
import React from 'react';

import {setLocale} from 'gmp/locale/lang';

import date from 'gmp/models/date';

import {setTimezone} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from 'web/utils/testing';

import EditNvtDetailsDialog from '../editnvtdetailsdialog';

setLocale('en');

const preferences = [
  {name: 'pref 1', value: 'no', id: '1', type: 'checkbox'},
  {name: 'pref 2', value: '1', id: '2', type: 'radio', alt: ['2', '3']},
  {name: 'pref 3', value: 'foo', id: '3', type: 'entry'},
];

const modified = date('2019-09-09T12:00:00Z');

describe('EditNvtDetailsDialog component tests', () => {
  test('should render dialog', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {render, store} = rendererWith({
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('UTC'));

    const {getByTestId} = render(
      <EditNvtDetailsDialog
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        isLoadingNvt={false}
        nvtAffectedSoftware="Foo"
        nvtCvssVector="AV:N/AC:L/Au:N/C:N/I:N/A:N"
        nvtFamily="family"
        nvtLastModified={modified}
        nvtName="foo"
        nvtOid="1.2.3"
        nvtSeverity={7.0}
        nvtSummary="This is a test."
        preferences={preferences}
        title="Edit Scan Config NVT"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const titleBar = getByTestId('dialog-title-bar');
    expect(titleBar).toHaveTextContent('Edit Scan Config NVT');

    const content = getByTestId('save-dialog-content');

    expect(content).toHaveTextContent('Config');
    expect(content).toHaveTextContent('foo');
  });

  test('should render loading indicator', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {render, store} = rendererWith({
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('UTC'));

    const {getByTestId} = render(
      <EditNvtDetailsDialog
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        isLoadingNvt={true}
        nvtAffectedSoftware="Foo"
        nvtCvssVector="AV:N/AC:L/Au:N/C:N/I:N/A:N"
        nvtFamily="family"
        nvtLastModified={modified}
        nvtName="foo"
        nvtOid="1.2.3"
        nvtSeverity={7.0}
        nvtSummary="This is a test."
        preferences={preferences}
        title="Edit Scan Config NVT"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const titleBar = getByTestId('dialog-title-bar');
    expect(titleBar).toHaveTextContent('Edit Scan Config NVT');

    const content = getByTestId('save-dialog-content');

    expect(content).not.toHaveTextContent('Config');
    expect(content).not.toHaveTextContent('foo');
  });

  test('should save data', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {render} = rendererWith({
      capabilities: true,
      store: true,
      router: true,
    });

    const {getByTestId} = render(
      <EditNvtDetailsDialog
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        isLoadingNvt={false}
        nvtAffectedSoftware="Foo"
        nvtCvssVector="AV:N/AC:L/Au:N/C:N/I:N/A:N"
        nvtFamily="family"
        nvtLastModified={modified}
        nvtName="foo"
        nvtOid="1.2.3"
        nvtSeverity={7.0}
        nvtSummary="This is a test."
        preferences={preferences}
        title="Edit Scan Config NVT"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      configId: 'c1',
      nvtOid: '1.2.3',
      preferenceValues: {
        'pref 1': {
          id: '1',
          value: 'no',
          type: 'checkbox',
        },
        'pref 2': {
          id: '2',
          value: '1',
          type: 'radio',
        },
        'pref 3': {
          id: '3',
          value: 'foo',
          type: 'entry',
        },
      },
      timeout: undefined,
      useDefaultTimeout: '1',
    });
  });

  test('should allow to close the dialog', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {render} = rendererWith({
      capabilities: true,
      store: true,
      router: true,
    });

    const {getByTestId} = render(
      <EditNvtDetailsDialog
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        isLoadingNvt={false}
        nvtAffectedSoftware="Foo"
        nvtCvssVector="AV:N/AC:L/Au:N/C:N/I:N/A:N"
        nvtFamily="family"
        nvtLastModified={modified}
        nvtName="foo"
        nvtOid="1.2.3"
        nvtSeverity={7.0}
        nvtSummary="This is a test."
        preferences={preferences}
        title="Edit Scan Config NVT"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const closeButton = getByTestId('dialog-close-button');
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
    expect(handleSave).not.toHaveBeenCalled();
  });

  test('should allow to change data', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {render} = rendererWith({
      capabilities: true,
      store: true,
      router: true,
    });

    const {baseElement, getByTestId, getAllByTestId} = render(
      <EditNvtDetailsDialog
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        isLoadingNvt={false}
        nvtAffectedSoftware="Foo"
        nvtCvssVector="AV:N/AC:L/Au:N/C:N/I:N/A:N"
        nvtFamily="family"
        nvtLastModified={modified}
        nvtName="foo"
        nvtOid="1.2.3"
        nvtSeverity={7.0}
        nvtSummary="This is a test."
        preferences={preferences}
        title="Edit Scan Config NVT"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const radios = getAllByTestId('radio-input');
    fireEvent.click(radios[2]);
    fireEvent.click(radios[5]);

    const inputs = baseElement.querySelectorAll('input[type="text"]');
    fireEvent.change(inputs[1], {target: {value: 'bar'}});

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    const newPreferenceValues = {
      'pref 1': {id: '1', value: 'yes', type: 'checkbox'},
      'pref 2': {id: '2', value: '2', type: 'radio'},
      'pref 3': {id: '3', value: 'bar', type: 'entry'},
    };

    expect(handleSave).toHaveBeenCalledWith({
      configId: 'c1',
      timeout: undefined,
      nvtOid: '1.2.3',
      preferenceValues: newPreferenceValues,
      useDefaultTimeout: '1',
    });
  });

  test('should handle changing timeout', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {render} = rendererWith({
      capabilities: true,
      store: true,
      router: true,
    });

    const {getByTestId, getAllByName, getByName} = render(
      <EditNvtDetailsDialog
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        isLoadingNvt={false}
        nvtAffectedSoftware="Foo"
        nvtCvssVector="AV:N/AC:L/Au:N/C:N/I:N/A:N"
        nvtFamily="family"
        nvtLastModified={modified}
        nvtName="foo"
        nvtOid="1.2.3"
        nvtSeverity={7.0}
        nvtSummary="This is a test."
        preferences={preferences}
        title="Edit Scan Config NVT"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const useDefaultTimeoutRadios = getAllByName('useDefaultTimeout');
    expect(useDefaultTimeoutRadios.length).toEqual(2);
    fireEvent.click(useDefaultTimeoutRadios[1]);

    const timeoutField = getByName('timeout');
    fireEvent.change(timeoutField, {target: {value: '100'}});

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    const preferenceValues = {
      'pref 1': {id: '1', value: 'no', type: 'checkbox'},
      'pref 2': {id: '2', value: '1', type: 'radio'},
      'pref 3': {id: '3', value: 'foo', type: 'entry'},
    };

    expect(handleSave).toHaveBeenCalledWith({
      configId: 'c1',
      timeout: '100',
      nvtOid: '1.2.3',
      preferenceValues,
      useDefaultTimeout: '0',
    });
  });
});
