/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, fireEvent, screen} from 'web/testing';
import FileField from 'web/components/form/FileField';

const getFileInput = () => {
  const input = document.querySelector<HTMLElement>('input[type=file]');
  if (!input) {
    throw new Error('File input not found');
  }
  return input;
};

const changeFileInput = (input: HTMLElement, file: string) => {
  fireEvent.change(input, {
    target: {files: [file]},
  });
};

describe('FileField tests', () => {
  test('should render', () => {
    const {element} = render(<FileField />);

    expect(element).toBeInTheDocument();
  });

  test('should call change handler with file', () => {
    const onChange = testing.fn();

    render(<FileField name="foo" onChange={onChange} />);

    const input = getFileInput();
    changeFileInput(input, 'bar');
    expect(onChange).toHaveBeenCalledWith('bar', 'foo');
  });

  test('should call change handler with file and name', () => {
    const onChange = testing.fn();

    render(<FileField name="foo" onChange={onChange} />);

    const input = getFileInput();
    changeFileInput(input, 'bar');
    expect(onChange).toHaveBeenCalledWith('bar', 'foo');
  });

  test('should not call change handler if disabled', () => {
    const onChange = testing.fn();

    render(<FileField disabled={true} onChange={onChange} />);

    const input = getFileInput();
    changeFileInput(input, 'bar');
    expect(onChange).not.toHaveBeenCalled();
  });

  test('should allow to reset the field value', () => {
    const onChange = testing.fn();
    const file = new File(['content'], 'example.txt', {type: 'text/plain'});
    render(<FileField name="someFile" value={file} onChange={onChange} />);

    const removeButton = screen.getByRole('button', {name: 'Clear input'});
    fireEvent.click(removeButton);
    expect(onChange).toHaveBeenCalledWith(undefined, 'someFile');
  });
});
