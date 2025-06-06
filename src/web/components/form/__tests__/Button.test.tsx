/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, fireEvent, screen} from 'web/testing';
import Button from 'web/components/form/Button';

describe('Button tests', () => {
  test('should call click handler', () => {
    const handler = testing.fn();

    render(<Button onClick={handler} />);

    const element = screen.getByRole('button');

    fireEvent.click(element);

    expect(handler).toHaveBeenCalled();
  });

  test('should call click handler with value', () => {
    const handler = testing.fn();

    render(<Button value="bar" onClick={handler} />);

    const element = screen.getByRole('button');

    fireEvent.click(element);

    expect(handler).toHaveBeenCalledWith('bar', undefined);
  });

  test('should call click handler with value and name', () => {
    const handler = testing.fn();

    render(<Button name="foo" value="bar" onClick={handler} />);

    const element = screen.getByRole('button');

    fireEvent.click(element);

    expect(handler).toHaveBeenCalledWith('bar', 'foo');
  });

  test('should render button', () => {
    const {element} = render(<Button />);

    expect(element).toBeInTheDocument();
  });

  test('should render title', () => {
    const {element} = render(<Button title="foo" />);

    expect(element).toHaveTextContent('foo');
  });

  test('should prefer children over title', () => {
    const {element} = render(<Button title="foo">bar</Button>);

    expect(element).toHaveTextContent('bar');
  });

  test('should render disabled', () => {
    const {element} = render(<Button disabled={true} />);

    expect(element).toBeDisabled();
  });

  test('should not call click handler when disabled', () => {
    const handler = testing.fn();

    render(<Button disabled={true} name="foo" value="bar" onClick={handler} />);

    const element = screen.getByRole('button');

    fireEvent.click(element);

    expect(handler).not.toHaveBeenCalled();
  });

  test('should render loading', () => {
    render(<Button isLoading={true} />);

    const element = screen.getByRole('button');
    expect(element).toHaveAttribute('data-loading', 'true');
  });
});
