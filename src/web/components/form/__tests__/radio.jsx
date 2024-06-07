/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import Radio, {StyledElement, StyledInput, StyledTitle} from '../radio';

describe('StyledElement tests', () => {
  test('should render', () => {
    const {element} = render(<StyledElement />);
    expect(element).toHaveStyleRule('cursor', 'pointer');
  });

  test('should render in disabled state', () => {
    const {element} = render(<StyledElement disabled={true} />);
    expect(element).toHaveStyleRule('cursor', 'not-allowed');
  });
});

describe('StyledInput tests', () => {
  test('should render', () => {
    const {element} = render(<StyledInput />);
    expect(element).not.toHaveStyleRule('cursor');
    expect(element).not.toHaveStyleRule('opacity');
  });

  test('should render in disabled state', () => {
    const {element} = render(<StyledInput disabled={true} />);
    expect(element).toHaveStyleRule('cursor', 'not-allowed');
    expect(element).toHaveStyleRule('opacity', '0.7');
  });
});

describe('StyledTitle tests', () => {
  test('should render', () => {
    const {element} = render(<StyledTitle />);
    expect(element).not.toHaveStyleRule('cursor');
    expect(element).toHaveStyleRule('opacity', '1');
  });

  test('should render in disabled state', () => {
    const {element} = render(<StyledTitle disabled={true} />);
    expect(element).toHaveStyleRule('cursor', 'not-allowed');
    expect(element).toHaveStyleRule('opacity', '0.5');
  });
});

describe('Radio tests', () => {
  test('should render radio', () => {
    const {element} = render(<Radio />);
    expect(element).toMatchSnapshot();
  });

  test('should render radio with children', () => {
    const {element} = render(
      <Radio>
        <span>child1</span>
        <span>child2</span>
      </Radio>,
    );
    expect(element).toMatchSnapshot();
  });

  test('should call change handler', () => {
    const onChange = testing.fn();

    const {element} = render(<Radio onChange={onChange} />);

    fireEvent.click(element);

    expect(onChange).toHaveBeenCalled();
  });

  test('should call change handler with value', () => {
    const onChange = testing.fn();

    const {element} = render(<Radio value="foo" onChange={onChange} />);

    fireEvent.click(element);

    expect(onChange).toHaveBeenCalledWith('foo', undefined);
  });

  test('should call change handler with value and name', () => {
    const onChange = testing.fn();

    const {element} = render(
      <Radio name="bar" value="foo" onChange={onChange} />,
    );

    fireEvent.click(element);

    expect(onChange).toHaveBeenCalledWith('foo', 'bar');
  });

  test('should not call change handler if disabled', () => {
    const onChange = testing.fn();

    const {element} = render(<Radio disabled={true} onChange={onChange} />);

    fireEvent.click(element);

    expect(onChange).not.toHaveBeenCalled();
  });

  test('should render title', () => {
    const {getByTestId} = render(<Radio title="foo" />);

    const titleElement = getByTestId('radio-title');
    expect(titleElement).toHaveTextContent('foo');
  });

  test('should not call change handler if already checked', () => {
    const onChange = testing.fn();

    const {element} = render(
      <Radio checked={true} value="foo" onChange={onChange} />,
    );

    fireEvent.click(element);

    expect(onChange).not.toHaveBeenCalled();
  });
});

// vim: set ts=2 sw=2 tw=80:
