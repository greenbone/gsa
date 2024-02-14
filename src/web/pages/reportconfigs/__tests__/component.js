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

import ReportFormatComponent from '../component';
import {rendererWith, wait} from 'web/utils/testing';
import ReportConfig from 'gmp/models/reportconfig';
import {
  fireEvent,
  getAllByRole,
  getAllByTestId,
  getByTestId,
} from '@testing-library/react';
import Capabilities from 'gmp/capabilities/capabilities';

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
    const children = jest.fn(({edit}) => {
      editClick = edit;
    });

    const handleInteraction = jest.fn();
    const getReportConfig = jest.fn().mockResolvedValue({
      data: mockReportConfig,
    });
    const getAllReportFormats = jest.fn().mockResolvedValue({
      data: [mockReportFormat],
    });
    const saveReportConfig = jest.fn().mockResolvedValue({
      data: {},
    });

    const gmp = {
      user: {
        currentSettings: jest.fn().mockResolvedValue({
          data: {},
        }),
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

    const {baseElement} = render(
      <ReportFormatComponent onInteraction={handleInteraction}>
        {children}
      </ReportFormatComponent>,
    );
    editClick({id: 'rc123'});

    await wait();
    expect(baseElement).toMatchSnapshot();

    expect(getReportConfig).toHaveBeenCalledWith({
      id: 'rc123',
    });
    expect(getAllReportFormats).toHaveBeenCalledWith();

    const titleBar = getByTestId(baseElement, 'dialog-title-bar');
    expect(titleBar).toHaveTextContent('Edit Report Config test report config');
    const content = getByTestId(baseElement, 'save-dialog-content');
    expect(content).toHaveTextContent('test report format');
    expect(content).toHaveTextContent('test param');

    const saveButton = getByTestId(baseElement, 'dialog-save-button');
    fireEvent.click(saveButton);

    expect(saveReportConfig).toHaveBeenCalledWith({
      alerts: [],
      comment: '',
      entityType: 'reportconfig',
      id: 'rc123',
      name: 'test report config',
      params: {
        'test param': 'ABC',
      },
      params_using_default: {
        'test param': false,
      },
      report_format: 'rf456',
      report_format_id: undefined,
      userCapabilities: new Capabilities(),
      userTags: [],
    });
  });

  test('should open create dialog and call GMP create', async () => {
    let createClick;
    const children = jest.fn(({edit, create}) => {
      createClick = create;
    });
    const handleInteraction = jest.fn();
    const getAllReportFormats = jest.fn().mockResolvedValue({
      data: [mockReportFormat],
    });
    const getReportFormat = jest.fn().mockResolvedValue({
      data: mockReportFormat,
    });
    const createReportConfig = jest.fn().mockResolvedValue({
      data: {},
    });

    const gmp = {
      user: {
        currentSettings: jest.fn().mockResolvedValue({
          data: {},
        }),
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

    const {baseElement} = render(
      <ReportFormatComponent onInteraction={handleInteraction}>
        {children}
      </ReportFormatComponent>,
    );
    createClick();

    await wait();
    expect(baseElement).toMatchSnapshot();

    expect(getAllReportFormats).toHaveBeenCalledWith();

    const titleBar = getByTestId(baseElement, 'dialog-title-bar');
    expect(titleBar).toHaveTextContent('New Report Config');
    const content = getByTestId(baseElement, 'save-dialog-content');

    // No report format selected at start
    expect(content).not.toHaveTextContent('test report format');
    // No params before report format has been selected
    expect(content).not.toHaveTextContent('test param');

    // Choose report format
    const comboBoxes = getAllByRole(content, 'combobox');
    fireEvent.click(getByTestId(comboBoxes[0], 'select-open-button'));
    const menuId = comboBoxes[0].getAttribute('aria-owns');
    const menuItems = getAllByTestId(
      baseElement.querySelector('#' + menuId),
      'select-item',
    );
    fireEvent.click(menuItems[0]);
    await wait();

    const saveButton = getByTestId(baseElement, 'dialog-save-button');
    fireEvent.click(saveButton);

    expect(createReportConfig).toHaveBeenCalledWith({
      name: 'Unnamed',
      comment: '',
      params: {
        'test param': 'ABC',
      },
      params_using_default: {
        'test param': true,
      },
      report_format_id: 'rf456',
    });
  });

  test('should open and close create dialog', async () => {
    let createClick;
    const children = jest.fn(({edit, create}) => {
      createClick = create;
    });
    const handleInteraction = jest.fn();
    const getAllReportFormats = jest.fn().mockResolvedValue({
      data: [mockReportFormat],
    });

    const gmp = {
      user: {
        currentSettings: jest.fn().mockResolvedValue({
          data: {},
        }),
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

    const closeButton = getByTestId(baseElement, 'dialog-close-button');
    fireEvent.click(closeButton);
    await wait();

    expect(baseElement).not.toHaveTextContent('New Report Config');
  });
});
