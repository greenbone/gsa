/* Copyright (C) 2024 Greenbone AG
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
import {describe, test, expect, testing} from '@gsa/testing';

import ReportConfig from 'gmp/models/reportconfig';
import ReportFormat from 'gmp/models/reportformat';

import {
  rendererWith,
  fireEvent,
  getAllByTestId,
  wait,
  getAllByRole,
  getByRole,
  getByTestId,
} from 'web/utils/testing';

import {mockReportConfig} from 'web/pages/reportconfigs/__mocks__/mockreportconfig';
import {mockReportFormats} from '../__mocks__/mockreportformats';

import ReportConfigDialog from '../dialog';

const config = ReportConfig.fromElement(mockReportConfig);

describe('Edit Report Config Dialog component tests', () => {
  test('should render dialog with disabled report format selection', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const gmp = {};
    const formats = mockReportFormats;

    const {render} = rendererWith({capabilities: true, router: true, gmp});

    const {baseElement} = render(
      <ReportConfigDialog
        reportconfig={config}
        formats={formats}
        title="Edit Report Config"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    expect(baseElement).toMatchSnapshot();

    const titleBar = getByTestId(baseElement, 'dialog-title-bar');
    expect(titleBar).toHaveTextContent('Edit Report Config');

    const content = getByTestId(baseElement, 'save-dialog-content');

    const comboBoxes = getAllByRole(content, 'combobox');
    expect(comboBoxes[0]).toHaveTextContent('example-configurable-1');
    expect(getByTestId(comboBoxes[0], 'select-selected-value')).toHaveAttribute(
      'disabled',
    );
  });

  test('should save data', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const gmp = {};
    const formats = mockReportFormats;

    const {render} = rendererWith({capabilities: true, router: true, gmp});
    const {baseElement} = render(
      <ReportConfigDialog
        reportconfig={config}
        formats={formats}
        title="Edit Report Config"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const saveButton = getByTestId(baseElement, 'dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      ...config,
      params: {
        BooleanParam: true,
        IntegerParam: 12,
        ReportFormatListParam: ['654321', '7654321'],
        SelectionParam: 'OptionB',
        StringParam: 'StringValue',
        TextParam: 'TextValue',
      },
      params_using_default: {
        BooleanParam: false,
        IntegerParam: true,
        ReportFormatListParam: false,
        SelectionParam: false,
        StringParam: true,
        TextParam: false,
      },
      report_format: config.report_format.id,
      report_format_id: undefined,
    });
  });

  test('should allow to close the dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const gmp = {};
    const formats = mockReportFormats;

    const {render} = rendererWith({capabilities: true, router: true, gmp});
    const {baseElement} = render(
      <ReportConfigDialog
        reportconfig={config}
        formats={formats}
        title="Edit Report Config"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const closeButton = getByTestId(baseElement, 'dialog-close-button');

    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
    expect(handleSave).not.toHaveBeenCalled();
  });

  test('should allow to change name, comment and params', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleValueChange = testing.fn();

    const gmp = {};
    const formats = mockReportFormats;

    const {render} = rendererWith({capabilities: true, router: true, gmp});
    const {baseElement} = render(
      <ReportConfigDialog
        reportconfig={config}
        formats={formats}
        title="Edit Report Config"
        onClose={handleClose}
        onSave={handleSave}
        onValueChange={handleValueChange}
      />,
    );

    const content = getByTestId(baseElement, 'save-dialog-content');
    const comboBoxes = getAllByRole(content, 'combobox');
    let inputs;

    // Set name and comment
    inputs = content.querySelectorAll('input[name="name"]');
    fireEvent.change(inputs[0], {target: {value: 'lorem'}});

    inputs = content.querySelectorAll('input[name="comment"]');
    fireEvent.change(inputs[0], {target: {value: 'ipsum'}});

    // Set params
    inputs = content.querySelectorAll('input[name="BooleanParam"]');
    fireEvent.click(inputs[1]);

    inputs = content.querySelectorAll('input[name="IntegerParam"]');
    fireEvent.change(inputs[0], {target: {value: '7'}});

    inputs = content.querySelectorAll('input[name="StringParam"]');
    fireEvent.change(inputs[0], {target: {value: 'NewString'}});

    inputs = content.querySelectorAll('textarea[name="TextParam"]');
    fireEvent.change(inputs[0], {target: {value: 'NewText'}});

    // Choose new SelectionParam
    fireEvent.click(getByTestId(comboBoxes[1], 'select-open-button'));
    const menuId = comboBoxes[1].getAttribute('aria-owns');
    const menuItems = getAllByTestId(
      baseElement.querySelector('#' + menuId),
      'select-item',
    );
    fireEvent.click(menuItems[0]);

    // Unselect report format from ReportFormatListParam
    const multiselectDeleteButtons = getAllByTestId(
      comboBoxes[2],
      'multiselect-selected-delete',
    );
    fireEvent.click(multiselectDeleteButtons[1]);

    expect(handleValueChange).toHaveBeenCalledTimes(6);

    const saveButton = getByTestId(baseElement, 'dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      ...config,
      name: 'lorem',
      comment: 'ipsum',
      params: {
        BooleanParam: false,
        IntegerParam: 7,
        StringParam: 'NewString',
        ReportFormatListParam: ['654321'],
        SelectionParam: 'OptionA',
        TextParam: 'NewText',
      },
      params_using_default: {
        BooleanParam: false,
        IntegerParam: false,
        StringParam: false,
        ReportFormatListParam: false,
        SelectionParam: false,
        TextParam: false,
      },
      report_format: config.report_format.id,
      report_format_id: undefined,
    });
  });

  test('should be able to toggle which params use default value', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleValueChange = testing.fn();

    const gmp = {};
    const formats = mockReportFormats;

    const {render} = rendererWith({capabilities: true, router: true, gmp});
    const {baseElement} = render(
      <ReportConfigDialog
        reportconfig={config}
        formats={formats}
        title="Edit Report Config"
        onClose={handleClose}
        onSave={handleSave}
        onValueChange={handleValueChange}
      />,
    );

    const content = getByTestId(baseElement, 'save-dialog-content');
    let inputs;

    inputs = content.querySelectorAll('input[name="BooleanParam"]');
    fireEvent.click(inputs[2]);

    inputs = content.querySelectorAll('input[name="IntegerParam"]');
    fireEvent.click(inputs[1]);

    inputs = content.querySelectorAll('input[name="StringParam"]');
    fireEvent.click(inputs[1]);

    inputs = content.querySelectorAll('input[name="TextParam"]');
    fireEvent.click(inputs[0]);

    inputs = content.querySelectorAll('input[name="ReportFormatListParam"]');
    fireEvent.click(inputs[0]);

    inputs = content.querySelectorAll('input[name="SelectionParam"]');
    fireEvent.click(inputs[0]);

    expect(handleValueChange).toHaveBeenCalledTimes(6);

    const saveButton = getByTestId(baseElement, 'dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      ...config,
      params: {
        BooleanParam: true,
        IntegerParam: 12,
        ReportFormatListParam: ['654321', '7654321'],
        SelectionParam: 'OptionB',
        StringParam: 'StringValue',
        TextParam: 'TextValue',
      },
      // Should be reverse of "shpuld save data" case
      params_using_default: {
        BooleanParam: true,
        IntegerParam: false,
        ReportFormatListParam: true,
        SelectionParam: true,
        StringParam: false,
        TextParam: true,
      },
      report_format: config.report_format.id,
      report_format_id: undefined,
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
        reportconfig={undefined}
        formats={formats}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    expect(baseElement).toMatchSnapshot();

    const titleBar = getByTestId(baseElement, 'dialog-title-bar');
    expect(titleBar).toHaveTextContent('New Report Config');

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
          value: 'DEF',
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

    const {baseElement} = render(
      <ReportConfigDialog
        reportconfig={undefined}
        formats={formats}
        onClose={handleClose}
        onSave={handleSave}
        onValueChange={handleValueChange}
      />,
    );

    const content = getByTestId(baseElement, 'save-dialog-content');
    let comboBoxes = getAllByRole(content, 'combobox');
    let inputs;
    let menuId;
    let menuItems;

    inputs = content.querySelectorAll('input[name="name"]');
    fireEvent.change(inputs[0], {target: {value: 'lorem'}});

    inputs = content.querySelectorAll('input[name="comment"]');
    fireEvent.change(inputs[0], {target: {value: 'ipsum'}});

    // Choose new report format
    fireEvent.click(getByTestId(comboBoxes[0], 'select-open-button'));
    menuId = comboBoxes[0].getAttribute('aria-owns');
    menuItems = getAllByTestId(
      baseElement.querySelector('#' + menuId),
      'select-item',
    );
    fireEvent.click(menuItems[1]);
    await wait();

    // Set params
    expect(getReportFormat).toHaveBeenCalledWith({id: '1234567'});
    inputs = content.querySelectorAll('input[name="Param2"]');
    fireEvent.change(inputs[0], {target: {value: 'XYZ'}});

    comboBoxes = getAllByRole(content, 'combobox');
    fireEvent.click(getByRole(comboBoxes[1], 'button'));
    menuId = comboBoxes[1].getAttribute('aria-owns');
    menuItems = getAllByTestId(
      baseElement.querySelector('#' + menuId),
      'multiselect-item-label',
    );
    fireEvent.click(menuItems[1]);

    const saveButton = getByTestId(baseElement, 'dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      name: 'lorem',
      comment: 'ipsum',
      report_format_id: '1234567',
      params: {
        Param1: 'ABC',
        Param2: 'XYZ',
        ReportFormatListParam: ['654321'],
      },
      params_using_default: {
        Param1: true,
        Param2: false,
        ReportFormatListParam: false,
      },
    });
  });
});
