/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import FileField from 'web/components/form/FileField';
import {render, fireEvent} from 'web/utils/Testing';

describe('FileField tests', () => {
  test('should render', () => {
    const {element} = render(<FileField />);

    expect(element).toBeInTheDocument();
  });

  test('should call change handler with file', () => {
    const onChange = testing.fn();

    const {baseElement} = render(<FileField name="foo" onChange={onChange} />);

    const input = baseElement.querySelector('input[type=file]') as Element;
    fireEvent.change(input, {
      target: {files: ['bar']},
    });
    expect(onChange).toHaveBeenCalledWith('bar', 'foo');
  });

  test('should call change handler with file and name', () => {
    const onChange = testing.fn();

    const {baseElement} = render(<FileField name="foo" onChange={onChange} />);

    const input = baseElement.querySelector('input[type=file]') as Element;

    fireEvent.change(input, {target: {files: ['bar']}});

    expect(onChange).toHaveBeenCalledWith('bar', 'foo');
  });

  test('should not call change handler if disabled', () => {
    const onChange = testing.fn();

    const {baseElement} = render(
      <FileField disabled={true} onChange={onChange} />,
    );

    const input = baseElement.querySelector('input[type=file]') as Element;

    fireEvent.change(input, {target: {files: ['bar']}});

    expect(onChange).not.toHaveBeenCalled();
  });
});
