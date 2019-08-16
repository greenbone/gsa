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

import EditNvtDetailsDialog from '../editnvtdetailsdialog';

const config = new ScanConfig({
  name: 'foo',
});

const policy = new Policy({
  name: 'foo policy',
});

const nvt = new Nvt({
  _oid: '1234',
  name: 'nvt',
  family: 'family',
  version: 0,
  notes_counts: '0',
  overrides_counts: '0',
  preferences: {
    preference: [
      {
        id: '0',
        hr_name: 'preference0',
        name: 'preference0',
        type: 'checkbox',
        value: 'no',
        default: 'no',
      },
      {
        id: '1',
        hr_name: 'preference1',
        name: 'preference1',
        type: 'radio',
        value: '1',
        alt: ['2', '3'],
        default: '1',
      },
      {
        id: '2',
        hr_name: 'preference2',
        name: 'preference2',
        type: 'entry',
        value: 'foo',
        default: 'foo',
      },
    ],
  },
  tags:
    'cvss_base_vector=AV:N/AC:L/Au:N/C:N/I:N/A:N|qod_type=general_note|summary=This is a test.|solution_type=',
});

const preferenceValues = {
  preference0: {id: 0, value: 'no', type: 'checkbox'},
  preference1: {id: 1, value: '1', type: 'radio'},
  preference2: {id: 2, value: 'foo', type: 'entry'},
};

describe('EditNvtDetailsDialog component tests', () => {
  test('should render dialog', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {render} = rendererWith({capabilities: true, router: true});
    const {baseElement} = render(
      <EditNvtDetailsDialog
        config={config}
        config_name="foo"
        family_name="family"
        manual_timeout=""
        nvt={nvt}
        preference_values={preferenceValues}
        text={_('Config')}
        timeout=""
        title={_('Edit Scan Config NVT {{name}}', {
          name: nvt.name,
        })}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    expect(baseElement).toMatchSnapshot();
    expect(baseElement).toHaveTextContent('Config');
    expect(baseElement).not.toHaveTextContent('Policy');
    expect(baseElement).toHaveTextContent('foo');
    expect(baseElement).toHaveTextContent('Edit Scan Config NVT nvt');
  });

  test('should render dialog for policies', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {render} = rendererWith({capabilities: true, router: true});
    const {baseElement} = render(
      <EditNvtDetailsDialog
        config={policy}
        config_name="foo policy"
        family_name="family"
        manual_timeout=""
        nvt={nvt}
        preference_values={preferenceValues}
        text={_('Policy')}
        timeout=""
        title={_('Edit Policy NVT {{name}}', {
          name: nvt.name,
        })}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    expect(baseElement).toHaveTextContent('Policy');
    expect(baseElement).not.toHaveTextContent('Config');
    expect(baseElement).toHaveTextContent('foo policy');
    expect(baseElement).toHaveTextContent('Edit Policy NVT nvt');
  });

  test('should save data', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {render} = rendererWith({capabilities: true, router: true});

    const {getByTestId} = render(
      <EditNvtDetailsDialog
        config={config}
        config_name="foo"
        family_name="family"
        manual_timeout=""
        nvt={nvt}
        preference_values={preferenceValues}
        text={_('Config')}
        timeout=""
        title={_('Edit Scan Config NVT {{name}}', {
          name: nvt.name,
        })}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      config: config,
      config_name: 'foo',
      family_name: 'family',
      id: undefined,
      manual_timeout: '',
      nvt_name: nvt.name,
      oid: '1234',
      preference_values: preferenceValues,
      timeout: '',
    });
  });

  test('should allow to close the dialog', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {render} = rendererWith({capabilities: true, router: true});

    const {getByTestId} = render(
      <EditNvtDetailsDialog
        config={config}
        config_name="foo"
        family_name="family"
        manual_timeout=""
        nvt={nvt}
        preference_values={preferenceValues}
        text={_('Config')}
        timeout=""
        title={_('Edit Scan Config NVT {{name}}', {
          name: nvt.name,
        })}
        onClose={handleClose}
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

    const {render} = rendererWith({capabilities: true, router: true});

    const {baseElement, getByTestId, getAllByTestId} = render(
      <EditNvtDetailsDialog
        config={config}
        config_name="foo"
        family_name="family"
        manual_timeout=""
        nvt={nvt}
        preference_values={preferenceValues}
        text={_('Config')}
        timeout=""
        title={_('Edit Scan Config NVT {{name}}', {
          name: nvt.name,
        })}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const radios = getAllByTestId('radio-input');
    fireEvent.click(radios[2]);
    fireEvent.click(radios[5]);

    const inputs = baseElement.querySelectorAll('input');
    fireEvent.change(inputs[8], {target: {value: 'bar'}});

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    const newPreferenceValues = {
      preference0: {id: 0, value: 'yes', type: 'checkbox'},
      preference1: {id: 1, value: '2', type: 'radio'},
      preference2: {id: 2, value: 'bar', type: 'entry'},
    };

    expect(handleSave).toHaveBeenCalledWith({
      config: config,
      config_name: 'foo',
      family_name: 'family',
      id: undefined,
      manual_timeout: '',
      nvt_name: nvt.name,
      oid: '1234',
      preference_values: newPreferenceValues,
      timeout: '',
    });
  });
});
