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

import {setLocale} from 'gmp/locale/lang';

import {rendererWith, fireEvent, queryAllByTestId} from 'web/utils/testing';

import Scanner from 'gmp/models/scanner';

import ScannerDialog from 'web/pages/scanners/dialog';

setLocale('en');

const ospScanner = {
  _id: '1234',
  name: 'john',
  ca_pub: 'foo',
  credential: {
    _id: '123abc',
  },
  comment: 'lorem ipsum',
  type: 1,
  host: 'mypc',
  port: '1357',
};

const gmpScanner = {
  _id: '1234',
  ca_pub: '',
  name: 'john',
  credential_id: '123abc',
  comment: 'lorem ipsum amet',
  type: 4,
  host: 'mypc',
  port: '2468',
};

const gmp = {settings: {enableGreenboneSensor: true}};

describe('ScannerDialog component tests', () => {
  test('should render', () => {
    const elem = {_id: 'foo'};
    const scanner = Scanner.fromElement(elem);
    const handleClose = jest.fn();
    const handleCredentialChange = jest.fn();
    const handleSave = jest.fn();
    const handleScannerTypeChange = jest.fn();

    const {render} = rendererWith({gmp});

    const {baseElement} = render(
      <ScannerDialog
        scanner={scanner}
        onClose={handleClose}
        onCredentialChange={handleCredentialChange}
        onSave={handleSave}
        onScannerTypeChange={handleScannerTypeChange}
      />,
    );

    expect(baseElement).toMatchSnapshot();
  });

  test('should display default info', () => {
    const handleClose = jest.fn();
    const handleCredentialChange = jest.fn();
    const handleSave = jest.fn();
    const handleScannerTypeChange = jest.fn();

    const {render} = rendererWith({gmp});

    const {baseElement} = render(
      <ScannerDialog // using OSP Scanner to render the most amount of fields
        type={1}
        onClose={handleClose}
        onCredentialChange={handleCredentialChange}
        onSave={handleSave}
        onScannerTypeChange={handleScannerTypeChange}
      />,
    );

    const inputs = baseElement.querySelectorAll('input');

    expect(inputs[0]).toHaveAttribute('value', 'Unnamed'); // name field
    expect(inputs[1]).toHaveAttribute('value', ''); // comment field

    const nextButton = baseElement.querySelector('button[title="🠮"]');

    fireEvent.click(nextButton);

    const pageTwoInputs = baseElement.querySelectorAll('input');

    expect(pageTwoInputs[0]).toHaveAttribute('name', 'host');
    expect(pageTwoInputs[0]).toHaveAttribute('value', 'localhost');

    expect(pageTwoInputs[1]).toHaveAttribute('name', 'port');
    expect(pageTwoInputs[1]).toHaveAttribute('value', '22');
  });

  test('should display value from props', () => {
    const scanner = Scanner.fromElement(ospScanner);

    const handleClose = jest.fn();
    const handleCredentialChange = jest.fn();
    const handleSave = jest.fn();
    const handleScannerTypeChange = jest.fn();

    const {render} = rendererWith({gmp});

    const {baseElement} = render(
      <ScannerDialog // using OSP Scanner to render the most amount of fields
        comment={scanner.comment}
        host={scanner.host}
        name={scanner.name}
        port={scanner.port}
        scanner={scanner}
        type={scanner.scannerType}
        onClose={handleClose}
        onCredentialChange={handleCredentialChange}
        onSave={handleSave}
        onScannerTypeChange={handleScannerTypeChange}
      />,
    );

    expect(baseElement).toMatchSnapshot();

    const inputs = baseElement.querySelectorAll('input');

    expect(inputs[0]).toHaveAttribute('value', 'john');
    expect(inputs[1]).toHaveAttribute('value', 'lorem ipsum');

    const nextButton = baseElement.querySelector('button[title="🠮"]');

    fireEvent.click(nextButton);

    const pageTwoInputs = baseElement.querySelectorAll('input');

    expect(pageTwoInputs[0]).toHaveAttribute('name', 'host');
    expect(pageTwoInputs[0]).toHaveAttribute('value', 'mypc');

    expect(pageTwoInputs[1]).toHaveAttribute('name', 'port');
    expect(pageTwoInputs[1]).toHaveAttribute('value', '1357');
  });

  test('should save valid form state', () => {
    const scanner = Scanner.fromElement(gmpScanner);

    const handleClose = jest.fn();
    const handleCredentialChange = jest.fn();
    const handleSave = jest.fn();
    const handleScannerTypeChange = jest.fn();

    const {render} = rendererWith({gmp});

    const {getByTestId} = render(
      <ScannerDialog // using OSP Scanner to render the most amount of fields
        comment={scanner.comment}
        credential_id={scanner.credential_id}
        host={scanner.host}
        id={scanner.id}
        name={scanner.name}
        scanner={scanner}
        type={scanner.scannerType}
        onClose={handleClose}
        onCredentialChange={handleCredentialChange}
        onSave={handleSave}
        onScannerTypeChange={handleScannerTypeChange}
      />,
    );

    const saveButton = getByTestId('dialog-save-button');

    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      ca_pub: undefined,
      host: 'mypc',
      name: 'john',
      comment: 'lorem ipsum amet',
      credential_id: '123abc',
      type: 4,
      id: '1234',
      port: '22',
      which_cert: undefined,
    });
  });

  test('should not save invalid form state', () => {
    const scanner = Scanner.fromElement(gmpScanner);

    const handleClose = jest.fn();
    const handleCredentialChange = jest.fn();
    const handleSave = jest.fn();
    const handleScannerTypeChange = jest.fn();

    const {render} = rendererWith({gmp});

    const {baseElement, getByTestId} = render(
      <ScannerDialog // using OSP Scanner to render the most amount of fields
        comment={scanner.comment}
        host=""
        id={scanner.id}
        name=""
        scanner={scanner}
        type={scanner.scannerType}
        onClose={handleClose}
        onCredentialChange={handleCredentialChange}
        onSave={handleSave}
        onScannerTypeChange={handleScannerTypeChange}
      />,
    );

    const saveButton = getByTestId('dialog-save-button');

    fireEvent.click(saveButton);

    expect(handleSave).not.toHaveBeenCalled();

    const errors = queryAllByTestId(baseElement, 'error-bubble');

    expect(errors[0]).toHaveTextContent('Missing name');

    const nextButton = baseElement.querySelector('button[title="🠮"]');

    fireEvent.click(nextButton);

    const moreErrors = queryAllByTestId(baseElement, 'error-bubble');

    expect(moreErrors[0]).toHaveTextContent('Missing or invalid host.');
    expect(moreErrors[1]).toHaveTextContent(
      'Missing credential id. Choose from the dropdown or create a new credential.',
    );
  });

  test('should render', () => {
    const elem = {_id: 'foo'};
    const scanner = Scanner.fromElement(elem);
    const handleClose = jest.fn();
    const handleCredentialChange = jest.fn();
    const handleSave = jest.fn();
    const handleScannerTypeChange = jest.fn();

    const {render} = rendererWith({gmp});

    const {getByTestId} = render(
      <ScannerDialog
        scanner={scanner}
        onClose={handleClose}
        onCredentialChange={handleCredentialChange}
        onSave={handleSave}
        onScannerTypeChange={handleScannerTypeChange}
      />,
    );

    const closeButton = getByTestId('dialog-close-button');

    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
  });
});
