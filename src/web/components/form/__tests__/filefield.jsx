/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import FileField from '../filefield';

describe('FileField tests', () => {
  test('should render', () => {
    const {element} = render(<FileField />);
    expect(element).toMatchSnapshot();
  });

  test('should render in disabled state', () => {
    const {element} = render(<FileField disabled={true} />);
    expect(element).toMatchSnapshot();
  });

  test('should call change handler with file', () => {
    const onChange = testing.fn();

    const {element} = render(<FileField onChange={onChange} />);

    fireEvent.change(element, {target: {files: ['bar']}});

    expect(onChange).toHaveBeenCalledWith('bar', undefined);
  });

  test('should call change handler with file and name', () => {
    const onChange = testing.fn();

    const {element} = render(<FileField name="foo" onChange={onChange} />);

    fireEvent.change(element, {target: {files: ['bar']}});

    expect(onChange).toHaveBeenCalledWith('bar', 'foo');
  });

  test('should not call change handler if disabled', () => {
    const onChange = testing.fn();

    const {element} = render(<FileField disabled={true} onChange={onChange} />);

    fireEvent.change(element, {target: {files: ['bar']}});

    expect(onChange).not.toHaveBeenCalled();
  });
});
