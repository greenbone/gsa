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

import Nvt from 'gmp/models/nvt';

import {rendererWith, fireEvent} from 'web/utils/testing';

import EditConfigFamilyDialog from '../editconfigfamilydialog';

const nvt = Nvt.fromElement({
  _oid: '1234',
  name: 'nvt',
  family: 'family',
  cvss_base: 1,
  preference_count: 3,
});

const nvt2 = Nvt.fromElement({
  _oid: '5678',
  name: 'nvt2',
  family: 'family',
  cvss_base: 10,
  timeout: 1,
  preference_count: 4,
});

const nvt3 = Nvt.fromElement({
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
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        familyName="family"
        isLoadingFamily={false}
        nvts={[nvt, nvt2]}
        selected={selected}
        title="Foo title"
        onClose={handleClose}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    expect(baseElement).toMatchSnapshot();

    expect(baseElement).toHaveTextContent('Config');
    expect(baseElement).toHaveTextContent('foo');
  });

  test('should render loading indicator', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();
    const handleOpenEditNvtDetailsDialog = jest.fn();

    const {render} = rendererWith({capabilities: true});
    const {baseElement, getByTestId} = render(
      <EditConfigFamilyDialog
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        familyName="family"
        isLoadingFamily={true}
        nvts={[nvt, nvt2]}
        selected={selected}
        title="Foo title"
        onClose={handleClose}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    expect(baseElement).toMatchSnapshot();

    expect(getByTestId('loading')).toBeInTheDocument();

    expect(baseElement).not.toHaveTextContent('Config');
    expect(baseElement).not.toHaveTextContent('foo');
  });

  test('should save data', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();
    const handleOpenEditNvtDetailsDialog = jest.fn();

    const {render} = rendererWith({capabilities: true});
    const {getByTestId} = render(
      <EditConfigFamilyDialog
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        familyName="family"
        isLoadingFamily={false}
        nvts={[nvt, nvt2]}
        selected={selected}
        title="Foo title"
        onClose={handleClose}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      configId: 'c1',
      familyName: 'family',
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
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        familyName="family"
        isLoadingFamily={false}
        nvts={[nvt, nvt2]}
        selected={selected}
        title="Foo title"
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
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        familyName="family"
        isLoadingFamily={false}
        nvts={[nvt, nvt2]}
        selected={selected}
        title="Foo title"
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
      configId: 'c1',
      familyName: 'family',
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
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        familyName="family"
        isLoadingFamily={false}
        nvts={[nvt, nvt2]}
        selected={selected}
        title="Foo title"
        onClose={handleClose}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    const editButtons = getAllByTestId('svg-icon');
    fireEvent.click(editButtons[0]);

    expect(handleOpenEditNvtDetailsDialog).toHaveBeenCalledWith(nvt.id);
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
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        familyName="family"
        isLoadingFamily={false}
        nvts={[nvt, nvt2, nvt3]}
        selected={newSelected}
        title="Foo title"
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

    expect(inputs[0]).toHaveAttribute('name', '1234');
    expect(inputs[1]).toHaveAttribute('name', '5678');
    expect(inputs[2]).toHaveAttribute('name', '2345');

    fireEvent.click(columns[4]);

    inputs = baseElement.querySelectorAll('input');

    expect(inputs[0]).toHaveAttribute('name', '5678');
    expect(inputs[1]).toHaveAttribute('name', '1234');
    expect(inputs[2]).toHaveAttribute('name', '2345');
  });
});
