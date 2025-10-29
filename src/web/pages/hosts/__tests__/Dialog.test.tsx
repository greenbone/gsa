/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {describe, test, expect, testing} from '@gsa/testing';
import {screen, fireEvent, rendererWith, changeInputValue} from 'web/testing';
import Host from 'gmp/models/host';
import {type ModelElement} from 'gmp/models/model';
import HostsDialog from 'web/pages/hosts/Dialog.jsx';

const host = Host.fromElement({
  _id: '12345',
  name: 'Foo',
  comment: 'bar',
  owner: {name: 'admin'},
  creation_time: '2019-06-02T12:00:22Z',
  modification_time: '2019-06-03T11:00:22Z',
  writable: 1,
  in_use: 0,
  permissions: {permission: [{name: 'everything'}]},
  host: {
    severity: {
      value: 10.0,
    },
    detail: [
      {
        name: 'best_os_cpe',
        value: 'cpe:/o:linux:kernel',
        source: {
          _id: '910',
          type: 'Report',
        },
      },
      {
        name: 'best_os_txt',
        value: 'Linux/Unix',
        source: {
          _id: '910',
          type: 'Report',
        },
      },
      {
        name: 'traceroute',
        value: '123.456.789.10,123.456.789.11',
        source: {
          _id: '910',
          type: 'Report',
        },
      },
    ],
    routes: {
      route: [
        {
          host: [
            {
              _id: '10',
              ip: '123.456.789.10',
            },
            {
              _id: '01',
              ip: '123.456.789.11',
            },
          ],
        },
      ],
    },
  },
  identifiers: {
    identifier: [
      {
        _id: '5678',
        name: 'hostname',
        value: 'foo',
        creation_time: '2019-06-02T12:00:22Z',
        modification_time: '2019-06-03T11:00:22Z',
        source: {
          _id: '910',
          type: 'Report Host Detail',
          data: '1.2.3.4.5',
        },
      },
      {
        _id: '1112',
        name: 'ip',
        value: '123.456.789.10',
        creation_time: '2019-06-02T12:00:22Z',
        modification_time: '2019-06-03T11:00:22Z',
        source: {
          _id: '910',
          type: 'Report Host Detail',
          data: '1.2.3.4.5',
        },
      },
      {
        _id: '1314',
        name: 'OS',
        value: 'cpe:/o:linux:kernel',
        creation_time: '2019-06-02T12:00:22Z',
        modification_time: '2019-06-03T11:00:22Z',
        source: {
          _id: '910',
          type: 'Report Host Detail',
          data: '1.2.3.4.5',
        },
        os: {
          _id: '1314',
          title: 'TestOs',
        },
      },
    ],
  },
} as ModelElement) as Host;

describe('HostsDialog component tests', () => {
  test('should render with default values when no host is provided', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith();

    render(<HostsDialog onClose={handleClose} onSave={handleSave} />);

    const inputs = screen.queryTextInputs();
    expect(inputs[0]).toHaveAttribute('name', 'name');
    expect(inputs[0]).toHaveValue('127.0.0.1');
    expect(inputs[0]).not.toBeDisabled();

    expect(inputs[1]).toHaveAttribute('name', 'comment');
    expect(inputs[1]).toHaveValue('');
  });

  test('should render with values from props and disable hostname field', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith();
    render(
      <HostsDialog
        host={host}
        title="test title"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const inputs = screen.queryTextInputs();
    expect(inputs[0]).toHaveValue('Foo');
    expect(inputs[0]).toBeDisabled();

    expect(inputs[1]).toHaveValue('bar');
  });

  test('should allow editing comment and saving', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith();
    render(<HostsDialog onClose={handleClose} onSave={handleSave} />);

    const commentInput = screen.getByName('comment');
    changeInputValue(commentInput, 'test comment');

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      name: '127.0.0.1',
      comment: 'test comment',
    });
  });

  test('should call onClose when close button is clicked', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith();
    render(<HostsDialog onClose={handleClose} onSave={handleSave} />);

    const closeButton = screen.getDialogCloseButton();
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
    expect(handleSave).not.toHaveBeenCalled();
  });
});
