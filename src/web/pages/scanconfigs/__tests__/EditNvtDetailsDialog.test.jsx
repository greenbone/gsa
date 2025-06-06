/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {changeInputValue, screen, rendererWith, fireEvent} from 'web/testing';
import date from 'gmp/models/date';
import {DEFAULT_SEVERITY_RATING} from 'gmp/utils/severity';
import EditNvtDetailsDialog from 'web/pages/scanconfigs/EditNvtDetailsDialog';
import {setTimezone} from 'web/store/usersettings/actions';

const preferences = [
  {name: 'pref 1', value: 'no', id: '1', type: 'checkbox'},
  {name: 'pref 2', value: '1', id: '2', type: 'radio', alt: ['2', '3']},
  {name: 'pref 3', value: 'foo', id: '3', type: 'entry'},
];
const modified = date('2019-09-09T12:00:00Z');
const gmp = {
  settings: {
    severityRating: DEFAULT_SEVERITY_RATING,
  },
};

describe('EditNvtDetailsDialog component tests', () => {
  test('should render dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('UTC'));

    render(
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

    expect(screen.queryDialogTitle()).toHaveTextContent('Edit Scan Config NVT');

    const content = screen.queryDialogContent();
    expect(content).toHaveTextContent('Config');
    expect(content).toHaveTextContent('foo');
  });

  test('should render loading indicator', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('UTC'));

    render(
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

    expect(screen.queryDialogTitle()).toHaveTextContent('Edit Scan Config NVT');

    const content = screen.queryDialogContent();
    expect(content).not.toHaveTextContent('Config');
    expect(content).not.toHaveTextContent('foo');
  });

  test('should save data', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    render(
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

    const saveButton = screen.getDialogSaveButton();
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
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    render(
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

    const closeButton = screen.getDialogCloseButton();
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
    expect(handleSave).not.toHaveBeenCalled();
  });

  test('should allow to change data', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    render(
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

    const radios = screen.getRadioInputs();
    fireEvent.click(radios[2]);
    fireEvent.click(radios[5]);

    const inputs = screen.queryTextInputs();

    changeInputValue(inputs[1], 'bar');
    const saveButton = screen.getDialogSaveButton();
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
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    render(
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

    const useDefaultTimeoutRadios = screen.getAllByName('useDefaultTimeout');
    expect(useDefaultTimeoutRadios.length).toEqual(2);
    fireEvent.click(useDefaultTimeoutRadios[1]);

    const timeoutField = screen.getByName('timeout');
    changeInputValue(timeoutField, '100');

    const saveButton = screen.getDialogSaveButton();
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
