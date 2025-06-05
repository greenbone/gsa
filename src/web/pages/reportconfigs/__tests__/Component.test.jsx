/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import ReportConfig from 'gmp/models/reportconfig';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import ReportFormatComponent from 'web/pages/reportconfigs/ReportConfigsComponent';
import {
  getSelectItemElementsForSelect,
  screen,
  within,
  fireEvent,
  rendererWith,
  wait,
} from 'web/testing';

describe('Report Config Component tests', () => {
  const mockReportConfig = ReportConfig.fromElement({
    _id: 'rc123',
    name: 'test report config',
    report_format: {
      _id: 'rf456',
      name: 'test report format',
    },
    param: [
      {
        name: 'test param',
        value: 'ABC',
        type: {
          __text: 'string',
          min: '0',
          max: '1',
        },
      },
    ],
  });

  const mockReportFormat = {
    id: 'rf456',
    name: 'test report format',
    configurable: true,
    params: [
      {
        name: 'test param',
        value: 'ABC',
        type: 'string',
      },
    ],
  };

  test('should open edit dialog and call GMP save', async () => {
    let editClick;
    const children = testing.fn(({edit}) => {
      editClick = edit;
    });

    const handleInteraction = testing.fn();
    const getReportConfig = testing.fn().mockResolvedValue({
      data: mockReportConfig,
    });
    const getAllReportFormats = testing.fn().mockResolvedValue({
      data: [mockReportFormat],
    });
    const saveReportConfig = testing.fn().mockResolvedValue({
      data: {},
    });

    const gmp = {
      user: {
        currentSettings: testing
          .fn()
          .mockResolvedValue(currentSettingsDefaultResponse),
      },
      reportconfig: {
        get: getReportConfig,
        save: saveReportConfig,
      },
      reportformats: {
        getAll: getAllReportFormats,
      },
    };

    const {render} = rendererWith({
      gmp,
      router: true,
      store: true,
    });

    render(
      <ReportFormatComponent onInteraction={handleInteraction}>
        {children}
      </ReportFormatComponent>,
    );
    editClick({id: 'rc123'});

    await wait();

    expect(getReportConfig).toHaveBeenCalledWith({
      id: 'rc123',
    });
    expect(getAllReportFormats).toHaveBeenCalledWith();

    expect(screen.queryDialogTitle()).toHaveTextContent(
      'Edit Report Config test report config',
    );
    const content = within(screen.queryDialogContent());
    const inputs = content.queryTextInputs();
    expect(inputs[0]).toHaveValue('test report config');

    const select = content.queryAllSelectElements();
    expect(select[0]).toHaveValue('test report format');

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(saveReportConfig).toHaveBeenCalledWith({
      comment: '',
      id: 'rc123',
      name: 'test report config',
      paramTypes: {
        'test param': 'string',
      },
      params: {
        'test param': 'ABC',
      },
      paramsUsingDefault: {
        'test param': false,
      },
      reportFormatId: 'rf456',
    });
  });

  test('should open create dialog and call GMP create', async () => {
    let createClick;
    const children = testing.fn(({create}) => {
      createClick = create;
    });
    const handleInteraction = testing.fn();
    const getAllReportFormats = testing.fn().mockResolvedValue({
      data: [mockReportFormat],
    });
    const getReportFormat = testing.fn().mockResolvedValue({
      data: mockReportFormat,
    });
    const createReportConfig = testing.fn().mockResolvedValue({
      data: {},
    });

    const gmp = {
      user: {
        currentSettings: testing
          .fn()
          .mockResolvedValue(currentSettingsDefaultResponse),
      },
      reportconfig: {
        create: createReportConfig,
      },
      reportformat: {
        get: getReportFormat,
      },
      reportformats: {
        getAll: getAllReportFormats,
      },
    };

    const {render} = rendererWith({
      gmp,
      router: true,
      store: true,
    });

    render(
      <ReportFormatComponent onInteraction={handleInteraction}>
        {children}
      </ReportFormatComponent>,
    );
    createClick();

    await wait();

    expect(getAllReportFormats).toHaveBeenCalledWith();

    expect(screen.queryDialogTitle()).toHaveTextContent('New Report Config');
    const content = within(screen.queryDialogContent());
    const selects = content.queryAllSelectElements();

    // No report format selected at start
    expect(selects[0]).not.toHaveTextContent('test report format');
    // No params before report format has been selected
    expect(screen.queryDialogContent()).not.toHaveTextContent('test param');

    // Choose report format
    const items = await getSelectItemElementsForSelect(selects[0]);
    fireEvent.click(items[0]);
    await wait();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(createReportConfig).toHaveBeenCalledWith({
      name: 'Unnamed',
      comment: '',
      paramTypes: {
        'test param': 'string',
      },
      params: {
        'test param': 'ABC',
      },
      paramsUsingDefault: {
        'test param': true,
      },
      reportFormatId: 'rf456',
    });
  });

  test('should open and close create dialog', async () => {
    let createClick;
    const children = testing.fn(({create}) => {
      createClick = create;
    });
    const handleInteraction = testing.fn();
    const getAllReportFormats = testing.fn().mockResolvedValue({
      data: [mockReportFormat],
    });

    const gmp = {
      user: {
        currentSettings: testing
          .fn()
          .mockResolvedValue(currentSettingsDefaultResponse),
      },
      reportformats: {
        getAll: getAllReportFormats,
      },
    };

    const {render} = rendererWith({
      gmp,
      router: true,
      store: true,
    });

    const {baseElement} = render(
      <ReportFormatComponent onInteraction={handleInteraction}>
        {children}
      </ReportFormatComponent>,
    );
    createClick();
    await wait();

    expect(baseElement).toHaveTextContent('New Report Config');

    const closeButton = screen.getDialogCloseButton();
    fireEvent.click(closeButton);
    await wait();

    expect(baseElement).not.toHaveTextContent('New Report Config');
  });
});
