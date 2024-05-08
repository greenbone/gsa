/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import {changeInputValue, getRadioInputs} from 'web/components/testing';

import {
  AUTO_DELETE_KEEP,
  AUTO_DELETE_KEEP_DEFAULT_VALUE,
  AUTO_DELETE_NO,
} from 'gmp/models/task';

import AutoDeleteReportsGroup from '../autodeletereportsgroup';

describe('AutoDeleteReportsGroup tests', () => {
  test('should render dialog group', () => {
    const handleChange = testing.fn();

    const {element} = render(
      <AutoDeleteReportsGroup
        autoDelete={AUTO_DELETE_KEEP}
        autoDeleteData={AUTO_DELETE_KEEP_DEFAULT_VALUE}
        onChange={handleChange}
      />,
    );

    expect(element).toBeInTheDocument();
  });

  test('should allow to change auto delete no', () => {
    const handleChange = testing.fn();

    render(
      <AutoDeleteReportsGroup
        autoDelete={AUTO_DELETE_KEEP}
        autoDeleteData={AUTO_DELETE_KEEP_DEFAULT_VALUE}
        onChange={handleChange}
      />,
    );

    const [autoDeleteNoRadio] = getRadioInputs();
    fireEvent.click(autoDeleteNoRadio);
    expect(handleChange).toHaveBeenCalledWith(AUTO_DELETE_NO, 'auto_delete');
  });

  test('should allow to change auto delete keep', () => {
    const handleChange = testing.fn();

    render(
      <AutoDeleteReportsGroup
        autoDelete={AUTO_DELETE_NO}
        autoDeleteData={AUTO_DELETE_KEEP_DEFAULT_VALUE}
        onChange={handleChange}
      />,
    );
    const [, autoDeleteKeepRadio] = getRadioInputs();
    fireEvent.click(autoDeleteKeepRadio);
    expect(handleChange).toHaveBeenCalledWith(AUTO_DELETE_KEEP, 'auto_delete');
  });

  test('should allow to change auto delete keep value', () => {
    const handleChange = testing.fn();

    const {getByName} = render(
      <AutoDeleteReportsGroup
        autoDelete={AUTO_DELETE_KEEP}
        autoDeleteData={AUTO_DELETE_KEEP_DEFAULT_VALUE}
        onChange={handleChange}
      />,
    );

    const autoDeleteKeepData = getByName('auto_delete_data');
    changeInputValue(autoDeleteKeepData, 10);
    expect(handleChange).toHaveBeenCalledWith(10, 'auto_delete_data');
  });

  test('should keep auto delete keep value in range 2-1200', () => {
    const handleChange = testing.fn();

    const {getByName} = render(
      <AutoDeleteReportsGroup
        autoDelete={AUTO_DELETE_KEEP}
        autoDeleteData={AUTO_DELETE_KEEP_DEFAULT_VALUE}
        onChange={handleChange}
      />,
    );
    const autoDeleteKeepData = getByName('auto_delete_data');

    changeInputValue(autoDeleteKeepData, 1);
    expect(handleChange).toHaveBeenCalledWith(2, 'auto_delete_data');

    changeInputValue(autoDeleteKeepData, 1201);
    expect(handleChange).toHaveBeenCalledWith(1200, 'auto_delete_data');

    changeInputValue(autoDeleteKeepData, 140);
    expect(handleChange).toHaveBeenCalledWith(140, 'auto_delete_data');
  });

  test('should not allow to change auto delete keep value', () => {
    const handleChange = testing.fn();

    const {getByName} = render(
      <AutoDeleteReportsGroup
        autoDelete={AUTO_DELETE_NO}
        autoDeleteData={AUTO_DELETE_KEEP_DEFAULT_VALUE}
        onChange={handleChange}
      />,
    );

    const autoDeleteKeepData = getByName('auto_delete_data');
    expect(autoDeleteKeepData).toBeDisabled();
    changeInputValue(autoDeleteKeepData, 10);
    expect(handleChange).not.toHaveBeenCalled();
  });
});
