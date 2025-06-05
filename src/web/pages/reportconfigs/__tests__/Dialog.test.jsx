/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import ReportConfig from 'gmp/models/reportconfig';
import ReportFormat from 'gmp/models/reportformat';
import {mockReportConfig} from 'web/pages/reportconfigs/__mocks__/MockReportConfig';
import {mockReportFormats} from 'web/pages/reportconfigs/__mocks__/MockReportFormats';
import ReportConfigDialog from 'web/pages/reportconfigs/Dialog';
import {
  changeInputValue,
  getSelectItemElementsForMultiSelect,
  getSelectItemElementsForSelect,
  screen,
  within,
} from 'web/testing';
import {rendererWith, fireEvent, wait} from 'web/utils/Testing';

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

    expect(screen.queryDialogTitle()).toHaveTextContent('Edit Report Config');

    const content = screen.queryDialogContent();
    const selects = screen.queryAllSelectElements(content);
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

    const saveButton = screen.getDialogSaveButton();
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

    const closeButton = screen.getDialogCloseButton();
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

    const content = screen.queryDialogContent();

    // Set name and comment
    const nameInput = screen.getByName('name');
    changeInputValue(nameInput, 'lorem');

    const commentInput = screen.getByName('comment');
    changeInputValue(commentInput, 'ipsum');

    // Set params
    const booleanParam = screen.getAllByName('BooleanParam');
    fireEvent.click(booleanParam[1]);

    const integerParam = screen.getByName('IntegerParam');
    changeInputValue(integerParam, '7');

    const stringParam = screen.getByName('StringParam');
    changeInputValue(stringParam, 'NewString');

    const textParam = screen.getByName('TextParam');
    changeInputValue(textParam, 'NewText');

    // Choose new SelectionParam
    const selects = screen.queryAllSelectElements();
    const menuItems = await getSelectItemElementsForSelect(selects[1]);
    fireEvent.click(menuItems[0]);

    // Unselect report format from ReportFormatListParam
    const multiSelect = screen.getMultiSelectElements(content)[0];
    fireEvent.click(multiSelect);

    let selectedItems = screen.getSelectedItems(document);
    const deleteIcon = selectedItems[1].querySelector('button');
    fireEvent.click(deleteIcon);

    expect(handleValueChange).toHaveBeenCalledTimes(6);

    const saveButton = screen.getDialogSaveButton();
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

    const content = within(screen.queryDialogContent());
    const tableBody = content.queryTableBody();
    const tableRows = tableBody.querySelectorAll('tr');

    const stringParamRow = within(tableRows[0]);
    fireEvent.click(stringParamRow.getAllCheckBoxes()[0]);

    const textParamRow = within(tableRows[1]);
    fireEvent.click(textParamRow.getAllCheckBoxes()[0]);

    const integerParamRow = within(tableRows[2]);
    fireEvent.click(integerParamRow.getAllCheckBoxes()[0]);

    const booleanParaRow = within(tableRows[3]);
    fireEvent.click(booleanParaRow.getAllCheckBoxes()[0]);

    const selectionParamRow = within(tableRows[4]);
    fireEvent.click(selectionParamRow.getAllCheckBoxes()[0]);

    const reportFormatListParamRow = within(tableRows[5]);
    fireEvent.click(reportFormatListParamRow.getAllCheckBoxes()[0]);

    expect(handleValueChange).toHaveBeenCalledTimes(6);

    const saveButton = screen.getDialogSaveButton();
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

    expect(screen.queryDialogTitle()).toHaveTextContent('New Report Config');

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

    const content = within(screen.getDialogContent());
    const nameInput = screen.getByName('name');
    changeInputValue(nameInput, 'lorem');

    const commentInput = screen.getByName('comment');
    changeInputValue(commentInput, 'ipsum');

    // Choose new report format
    const select = screen.queryAllSelectElements();
    const menuItems = await getSelectItemElementsForSelect(select[0]);
    fireEvent.click(menuItems[1]);
    await wait();

    // Set params
    expect(getReportFormat).toHaveBeenCalledWith({id: '1234567'});
    const param2Input = content.getByName('Param2');
    changeInputValue(param2Input, 'XYZ');

    const multiSelect = content.getMultiSelectElements()[0];
    fireEvent.click(multiSelect);

    let selectedItems = screen.getSelectedItems();

    const closeBtnElement = within(selectedItems[0]).getByRole('button', {
      hidden: true,
    });

    fireEvent.click(closeBtnElement);
    const multiSelectMenuItems = getSelectItemElementsForMultiSelect();
    fireEvent.click(multiSelectMenuItems[1]);

    const saveButton = screen.getDialogSaveButton();
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
