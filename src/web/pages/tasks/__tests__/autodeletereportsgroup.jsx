/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import AutoDeleteReportsGroup from '../autodeletereportsgroup';
import {
  AUTO_DELETE_KEEP,
  AUTO_DELETE_KEEP_DEFAULT_VALUE,
  AUTO_DELETE_NO,
} from 'gmp/models/task';

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

    expect(element).toMatchSnapshot();
  });

  test('should allow to change auto delete no', () => {
    const handleChange = testing.fn();

    const {queryAllByTestId} = render(
      <AutoDeleteReportsGroup
        autoDelete={AUTO_DELETE_KEEP}
        autoDeleteData={AUTO_DELETE_KEEP_DEFAULT_VALUE}
        onChange={handleChange}
      />,
    );

    const [autoDeleteNoRadio] = queryAllByTestId('radio-input');

    fireEvent.click(autoDeleteNoRadio);

    expect(handleChange).toHaveBeenCalledWith(AUTO_DELETE_NO, 'auto_delete');
  });

  test('should allow to change auto delete keep', () => {
    const handleChange = testing.fn();

    const {queryAllByTestId} = render(
      <AutoDeleteReportsGroup
        autoDelete={AUTO_DELETE_NO}
        autoDeleteData={AUTO_DELETE_KEEP_DEFAULT_VALUE}
        onChange={handleChange}
      />,
    );

    const [, autoDeleteKeepRadio] = queryAllByTestId('radio-input');

    fireEvent.click(autoDeleteKeepRadio);

    expect(handleChange).toHaveBeenCalledWith(AUTO_DELETE_KEEP, 'auto_delete');
  });

  test('should allow to change auto delete keep value', () => {
    const handleChange = testing.fn();

    const {getByTestId} = render(
      <AutoDeleteReportsGroup
        autoDelete={AUTO_DELETE_KEEP}
        autoDeleteData={AUTO_DELETE_KEEP_DEFAULT_VALUE}
        onChange={handleChange}
      />,
    );

    const autoDeleteKeepData = getByTestId('spinner-input');

    fireEvent.change(autoDeleteKeepData, {target: {value: 10}});

    expect(handleChange).toHaveBeenCalledWith(10, 'auto_delete_data');
  });

  test('should keep auto delete keep value in range 2-1200', () => {
    const handleChange = testing.fn();

    const {getByTestId} = render(
      <AutoDeleteReportsGroup
        autoDelete={AUTO_DELETE_KEEP}
        autoDeleteData={AUTO_DELETE_KEEP_DEFAULT_VALUE}
        onChange={handleChange}
      />,
    );

    const autoDeleteKeepData = getByTestId('spinner-input');

    fireEvent.change(autoDeleteKeepData, {target: {value: 1}});

    expect(handleChange).not.toHaveBeenCalled();

    fireEvent.change(autoDeleteKeepData, {target: {value: 1201}});

    expect(handleChange).not.toHaveBeenCalled();

    fireEvent.change(autoDeleteKeepData, {target: {value: 140}});

    expect(handleChange).toHaveBeenCalledWith(140, 'auto_delete_data');
  });

  test('should not allow to change auto delete keep value', () => {
    const handleChange = testing.fn();

    const {getByTestId} = render(
      <AutoDeleteReportsGroup
        autoDelete={AUTO_DELETE_NO}
        autoDeleteData={AUTO_DELETE_KEEP_DEFAULT_VALUE}
        onChange={handleChange}
      />,
    );

    const autoDeleteKeepData = getByTestId('spinner-input');

    fireEvent.change(autoDeleteKeepData, {target: {value: 10}});

    expect(handleChange).not.toHaveBeenCalled();

    expect(autoDeleteKeepData).toBeDisabled();
  });
});
