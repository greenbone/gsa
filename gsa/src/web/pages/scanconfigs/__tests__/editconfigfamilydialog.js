/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import _ from 'gmp/locale';

import ScanConfig from 'gmp/models/scanconfig';
import Policy from 'gmp/models/policy';
import Nvt from 'gmp/models/nvt';

import {rendererWith, fireEvent} from 'web/utils/testing';

import EditConfigFamilyDialog from '../editconfigfamilydialog';

const config = new ScanConfig({
  name: 'foo',
  family: 'bar',
});

const policy = new Policy({
  name: 'foo policy',
  family: 'bar',
});

const nvt = new Nvt({
  _oid: '1234',
  name: 'nvt',
  family: 'family',
  cvss_base: 1,
  preference_count: 3,
});

const nvt2 = new Nvt({
  _oid: '5678',
  name: 'nvt2',
  family: 'family',
  cvss_base: 10,
  timeout: 1,
  preference_count: 4,
});

const nvt3 = new Nvt({
  _oid: '2345',
  name: 'nvt3',
  family: 'family',
  timeout: 2,
  preference_count: 2,
});

const selected = {
  1234: 0,
  5678: 0,
};

describe('EditConfigFamilyDialog component tests', () => {
  test('should render dialog', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();
    const handleOpenEditNvtDetailsDialog = jest.fn();

    const {render} = rendererWith({capabilities: true});
    const {baseElement} = render(
      <EditConfigFamilyDialog
        config={config}
        config_name="foo"
        family_name="family"
        id="0"
        nvts={[nvt, nvt2]}
        selected={selected}
        configNameLabel={_('Config')}
        timeout=""
        title={_('Edit Scan Config NVT {{name}}', {
          name: nvt.name,
        })}
        onClose={handleClose}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    expect(baseElement).toMatchSnapshot();
    expect(baseElement).toHaveTextContent('Config');
    expect(baseElement).toHaveTextContent('foo');
    expect(baseElement).not.toHaveTextContent('Policy');
  });

  test('should render dialog for policies', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();
    const handleOpenEditNvtDetailsDialog = jest.fn();

    const {render} = rendererWith({capabilities: true});
    const {baseElement} = render(
      <EditConfigFamilyDialog
        config={policy}
        config_name="foo policy"
        family_name="family"
        id="0"
        nvts={[nvt, nvt2]}
        selected={selected}
        configNameLabel={_('Policy')}
        timeout=""
        title={_('Edit Policy NVT {{name}}', {
          name: nvt.name,
        })}
        onClose={handleClose}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    expect(baseElement).toHaveTextContent('Policy');
    expect(baseElement).toHaveTextContent('foo policy');
    expect(baseElement).not.toHaveTextContent('Config');
  });

  test('should save data', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();
    const handleOpenEditNvtDetailsDialog = jest.fn();

    const {render} = rendererWith({capabilities: true});
    const {getByTestId} = render(
      <EditConfigFamilyDialog
        config={config}
        config_name="foo"
        family_name="family"
        id="0"
        nvts={[nvt, nvt2]}
        selected={selected}
        configNameLabel={_('Config')}
        timeout=""
        title={_('Edit Config NVT {{name}}', {
          name: nvt.name,
        })}
        onClose={handleClose}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      config: config,
      config_name: 'foo',
      family_name: 'family',
      id: '0',
      selected: selected,
    });
  });

  test('should allow to close the dialog', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();
    const handleOpenEditNvtDetailsDialog = jest.fn();

    const {render} = rendererWith({capabilities: true});
    const {getByTestId} = render(
      <EditConfigFamilyDialog
        config={config}
        config_name="foo"
        family_name="family"
        id="0"
        nvts={[nvt, nvt2]}
        selected={selected}
        configNameLabel={_('Config')}
        timeout=""
        title={_('Edit Config NVT {{name}}', {
          name: nvt.name,
        })}
        onClose={handleClose}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
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
    const handleOpenEditNvtDetailsDialog = jest.fn();

    const {render} = rendererWith({capabilities: true});
    const {baseElement, getByTestId} = render(
      <EditConfigFamilyDialog
        config={config}
        config_name="foo"
        family_name="family"
        id="0"
        nvts={[nvt, nvt2]}
        selected={selected}
        configNameLabel={_('Config')}
        timeout=""
        title={_('Edit Config NVT {{name}}', {
          name: nvt.name,
        })}
        onClose={handleClose}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    const inputs = baseElement.querySelectorAll('input');
    fireEvent.click(inputs[0]);

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    const newSelected = {
      1234: 1,
      5678: 0,
    };

    expect(handleSave).toHaveBeenCalledWith({
      config: config,
      config_name: 'foo',
      family_name: 'family',
      id: '0',
      selected: newSelected,
    });
  });

  test('should call click handler', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();
    const handleOpenEditNvtDetailsDialog = jest.fn();

    const {render} = rendererWith({capabilities: true});
    const {getAllByTestId} = render(
      <EditConfigFamilyDialog
        config={config}
        config_name="foo"
        family_name="family"
        id="0"
        nvts={[nvt, nvt2]}
        selected={selected}
        configNameLabel={_('Config')}
        timeout=""
        title={_('Edit Config NVT {{name}}', {
          name: nvt.name,
        })}
        onClose={handleClose}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    const editButtons = getAllByTestId('svg-icon');
    fireEvent.click(editButtons[0]);

    expect(handleOpenEditNvtDetailsDialog).toHaveBeenCalledWith({
      config: config,
      nvt: nvt,
    });
  });

  test('should sort table', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();
    const handleOpenEditNvtDetailsDialog = jest.fn();

    const newSelected = {
      1234: 0,
      5678: 1,
      2345: 0,
    };

    const {render} = rendererWith({capabilities: true});
    const {baseElement} = render(
      <EditConfigFamilyDialog
        config={config}
        config_name="foo"
        family_name="family"
        id="0"
        nvts={[nvt, nvt2, nvt3]}
        selected={newSelected}
        configNameLabel={_('Config')}
        timeout=""
        title={_('Edit Config NVT {{name}}', {
          name: nvt.name,
        })}
        onClose={handleClose}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    let inputs = baseElement.querySelectorAll('input');

    expect(inputs[0]).toHaveAttribute('name', '1234');
    expect(inputs[1]).toHaveAttribute('name', '5678');
    expect(inputs[2]).toHaveAttribute('name', '2345');

    const columns = baseElement.querySelectorAll('a');
    fireEvent.click(columns[0]);

    inputs = baseElement.querySelectorAll('input');

    expect(inputs[0]).toHaveAttribute('name', '2345');
    expect(inputs[1]).toHaveAttribute('name', '5678');
    expect(inputs[2]).toHaveAttribute('name', '1234');

    fireEvent.click(columns[1]);

    inputs = baseElement.querySelectorAll('input');

    expect(inputs[0]).toHaveAttribute('name', '1234');
    expect(inputs[1]).toHaveAttribute('name', '2345');
    expect(inputs[2]).toHaveAttribute('name', '5678');

    fireEvent.click(columns[2]);

    inputs = baseElement.querySelectorAll('input');

    expect(inputs[0]).toHaveAttribute('name', '2345');
    expect(inputs[1]).toHaveAttribute('name', '1234');
    expect(inputs[2]).toHaveAttribute('name', '5678');

    fireEvent.click(columns[3]);

    inputs = baseElement.querySelectorAll('input');

    expect(inputs[0]).toHaveAttribute('name', '5678');
    expect(inputs[1]).toHaveAttribute('name', '2345');
    expect(inputs[2]).toHaveAttribute('name', '1234');

    fireEvent.click(columns[4]);

    inputs = baseElement.querySelectorAll('input');

    expect(inputs[0]).toHaveAttribute('name', '5678');
    expect(inputs[1]).toHaveAttribute('name', '1234');
    expect(inputs[2]).toHaveAttribute('name', '2345');
  });
});
