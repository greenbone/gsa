/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import ReportConfig from 'gmp/models/reportconfig';
import ReportFormat from 'gmp/models/reportformat';
import {
  changeInputValue,
  clickElement,
  queryCheckBoxes,
  getDialogCloseButton,
  queryDialogContent,
  getDialogSaveButton,
  queryDialogTitle,
  getMultiSelectElements,
  queryAllSelectElements,
  getSelectItemElementsForMultiSelect,
  getSelectItemElementsForSelect,
  getSelectedItems,
  queryTableBody,
} from 'web/components/testing';
import {mockReportConfig} from 'web/pages/reportconfigs/__mocks__/MockReportConfig';
import {mockReportFormats} from 'web/pages/reportconfigs/__mocks__/MockReportFormats';
import ReportConfigDialog from 'web/pages/reportconfigs/Dialog';
import {
  rendererWith,
  fireEvent,
  getByName,
  getAllByName,
  screen,
  within,
} from 'web/utils/Testing';

const config = ReportConfig.fromElement(mockReportConfig);

describe('Edit Report Config Dialog component tests', () => {
  test('should render dialog with disabled report format selection', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const gmp = {};
    const formats = mockReportFormats;

    const {render} = rendererWith({capabilities: true, router: true, gmp});

    render(
      <ReportConfigDialog
        formats={formats}
        reportConfig={config}
        title="Edit Report Config"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    expect(queryDialogTitle()).toHaveTextContent('Edit Report Config');

    const content = queryDialogContent();
    const selects = queryAllSelectElements(content);
    expect(selects[0]).toHaveValue('example-configurable-1');
    expect(selects[0]).toBeDisabled();
  });

  test('should save data', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const gmp = {};
    const formats = mockReportFormats;

    const {render} = rendererWith({capabilities: true, router: true, gmp});
    render(
      <ReportConfigDialog
        formats={formats}
        reportConfig={config}
        title="Edit Report Config"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const saveButton = getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      id: '12345',
      name: 'foo',
      comment: 'bar',
      paramTypes: {
        BooleanParam: 'boolean',
        IntegerParam: 'integer',
        ReportFormatListParam: 'report_format_list',
        SelectionParam: 'selection',
        StringParam: 'string',
        TextParam: 'text',
      },
      params: {
        BooleanParam: true,
        IntegerParam: 12,
        ReportFormatListParam: ['654321', '7654321'],
        SelectionParam: 'OptionB',
        StringParam: 'StringValue',
        TextParam: 'TextValue',
      },
      paramsUsingDefault: {
        BooleanParam: false,
        IntegerParam: true,
        ReportFormatListParam: false,
        SelectionParam: false,
        StringParam: true,
        TextParam: false,
      },
      reportFormatId: '123456',
    });
  });

  test('should allow to close the dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const gmp = {};
    const formats = mockReportFormats;

    const {render} = rendererWith({capabilities: true, router: true, gmp});
    render(
      <ReportConfigDialog
        formats={formats}
        reportConfig={config}
        title="Edit Report Config"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const closeButton = getDialogCloseButton();
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
    expect(handleSave).not.toHaveBeenCalled();
  });

  test('should allow to change name, comment and params', async () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleValueChange = testing.fn();

    const gmp = {};
    const formats = mockReportFormats;

    const {render} = rendererWith({capabilities: true, router: true, gmp});
    render(
      <ReportConfigDialog
        formats={formats}
        reportConfig={config}
        title="Edit Report Config"
        onClose={handleClose}
        onSave={handleSave}
        onValueChange={handleValueChange}
      />,
    );

    const content = queryDialogContent();

    // Set name and comment
    const nameInput = getByName(content, 'name');
    changeInputValue(nameInput, 'lorem');

    const commentInput = getByName(content, 'comment');
    changeInputValue(commentInput, 'ipsum');

    // Set params
    const booleanParam = getAllByName(content, 'BooleanParam');
    fireEvent.click(booleanParam[1]);

    const integerParam = getByName(content, 'IntegerParam');
    changeInputValue(integerParam, '7');

    const stringParam = getByName(content, 'StringParam');
    changeInputValue(stringParam, 'NewString');

    const textParam = getByName(content, 'TextParam');
    changeInputValue(textParam, 'NewText');

    // Choose new SelectionParam
    const selects = queryAllSelectElements(content);
    const menuItems = await getSelectItemElementsForSelect(selects[1]);
    await clickElement(menuItems[0]);

    // Unselect report format from ReportFormatListParam
    const multiSelect = getMultiSelectElements(content)[0];
    await clickElement(multiSelect);

    let selectedItems = getSelectedItems(document);
    const deleteIcon = selectedItems[1].querySelector('button');
    await clickElement(deleteIcon);

    expect(handleValueChange).toHaveBeenCalledTimes(6);

    const saveButton = getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      id: '12345',
      name: 'lorem',
      comment: 'ipsum',
      paramTypes: {
        BooleanParam: 'boolean',
        IntegerParam: 'integer',
        ReportFormatListParam: 'report_format_list',
        SelectionParam: 'selection',
        StringParam: 'string',
        TextParam: 'text',
      },
      params: {
        BooleanParam: false,
        IntegerParam: 7,
        StringParam: 'NewString',
        ReportFormatListParam: ['654321'],
        SelectionParam: 'OptionA',
        TextParam: 'NewText',
      },
      paramsUsingDefault: {
        BooleanParam: false,
        IntegerParam: false,
        StringParam: false,
        ReportFormatListParam: false,
        SelectionParam: false,
        TextParam: false,
      },
      reportFormatId: '123456',
    });
  });

  test('should be able to toggle which params use default value', async () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleValueChange = testing.fn();

    const gmp = {};
    const formats = mockReportFormats;

    const {render} = rendererWith({capabilities: true, router: true, gmp});
    render(
      <ReportConfigDialog
        formats={formats}
        reportConfig={config}
        title="Edit Report Config"
        onClose={handleClose}
        onSave={handleSave}
        onValueChange={handleValueChange}
      />,
    );

    const content = queryDialogContent();
    const tableBody = queryTableBody(content);
    const tableRows = tableBody.querySelectorAll('tr');

    const stringParamRow = tableRows[0];
    await clickElement(queryCheckBoxes(stringParamRow)[0]);

    const textParamRow = tableRows[1];
    await clickElement(queryCheckBoxes(textParamRow)[0]);

    const integerParamRow = tableRows[2];
    await clickElement(queryCheckBoxes(integerParamRow)[0]);

    const booleanParaRow = tableRows[3];
    await clickElement(queryCheckBoxes(booleanParaRow)[0]);

    const selectionParamRow = tableRows[4];
    await clickElement(queryCheckBoxes(selectionParamRow)[0]);

    const reportFormatListParamRow = tableRows[5];
    await clickElement(queryCheckBoxes(reportFormatListParamRow)[0]);

    expect(handleValueChange).toHaveBeenCalledTimes(6);

    const saveButton = getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      id: '12345',
      name: 'foo',
      comment: 'bar',
      paramTypes: {
        BooleanParam: 'boolean',
        IntegerParam: 'integer',
        ReportFormatListParam: 'report_format_list',
        SelectionParam: 'selection',
        StringParam: 'string',
        TextParam: 'text',
      },
      params: {
        BooleanParam: true,
        IntegerParam: 12,
        ReportFormatListParam: ['654321', '7654321'],
        SelectionParam: 'OptionB',
        StringParam: 'StringValue',
        TextParam: 'TextValue',
      },
      // Should be reverse of "should save data" case
      paramsUsingDefault: {
        BooleanParam: true,
        IntegerParam: false,
        ReportFormatListParam: true,
        SelectionParam: true,
        StringParam: false,
        TextParam: true,
      },
      reportFormatId: '123456',
    });
  });
});

describe('New Report Config Dialog component tests', () => {
  test('should render dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const gmp = {};
    const formats = mockReportFormats;

    const {render} = rendererWith({capabilities: true, router: true, gmp});

    const {baseElement} = render(
      <ReportConfigDialog
        formats={formats}
        reportConfig={undefined}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    expect(queryDialogTitle()).toHaveTextContent('New Report Config');

    expect(baseElement).not.toHaveTextContent('Param');
  });

  test('should allow to change name, comment, report_format and params', async () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const mockReportFormatDetails = ReportFormat.fromElement({
      _id: '1234567',
      name: 'example-configurable-2',
      configurable: '1',
      param: [
        {
          name: 'Param1',
          value: 'ABC',
          type: {
            __text: 'string',
            min: 0,
            max: 100,
          },
        },
        {
          name: 'Param2',
          value: 'DEF',
          type: {
            __text: 'string',
            min: 0,
            max: 100,
          },
        },
        {
          name: 'ReportFormatListParam',
          value: {
            __text: 'RF01',
            report_format: {
              _id: 'RF01',
              name: 'report format 1',
            },
          },
          default: {
            __text: 'RF01',
            report_format: {
              _id: 'RF01',
              name: 'report format 1',
            },
          },
          type: {
            __text: 'report_format_list',
            min: 0,
            max: 100,
          },
        },
      ],
    });

    const getReportFormat = testing.fn().mockResolvedValue({
      data: mockReportFormatDetails,
    });

    const gmp = {
      reportformat: {
        get: getReportFormat,
      },
    };
    const formats = mockReportFormats;

    const {render} = rendererWith({capabilities: true, router: true, gmp});

    const handleValueChange = testing.fn();

    render(
      <ReportConfigDialog
        formats={formats}
        reportConfig={undefined}
        onClose={handleClose}
        onSave={handleSave}
        onValueChange={handleValueChange}
      />,
    );

    const content = queryDialogContent();
    const nameInput = getByName(content, 'name');
    changeInputValue(nameInput, 'lorem');

    const commentInput = getByName(content, 'comment');
    changeInputValue(commentInput, 'ipsum');

    // Choose new report format
    const select = queryAllSelectElements(content);
    const menuItems = await getSelectItemElementsForSelect(select[0]);
    await clickElement(menuItems[1]);

    // Set params
    expect(getReportFormat).toHaveBeenCalledWith({id: '1234567'});

    const param2Input = getByName(content, 'Param2');
    changeInputValue(param2Input, 'XYZ');

    const multiSelect = getMultiSelectElements(content)[0];
    await clickElement(multiSelect);

    let selectedItems = getSelectedItems(document);

    const closeBtnElement = within(selectedItems[0]).getByRole('button', {
      hidden: true,
    });

    await clickElement(closeBtnElement);
    const multiSelectMenuItems =
      await getSelectItemElementsForMultiSelect(screen);
    await clickElement(multiSelectMenuItems[1]);

    const saveButton = getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      name: 'lorem',
      comment: 'ipsum',
      reportFormatId: '1234567',
      paramTypes: {
        Param1: 'string',
        Param2: 'string',
        ReportFormatListParam: 'report_format_list',
      },
      params: {
        Param1: 'ABC',
        Param2: 'XYZ',
        ReportFormatListParam: ['654321'],
      },
      paramsUsingDefault: {
        Param1: true,
        Param2: false,
        ReportFormatListParam: false,
      },
    });
  });
});
