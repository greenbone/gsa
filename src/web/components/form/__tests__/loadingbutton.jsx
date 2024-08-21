/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import Theme from 'web/utils/theme';
import {render, fireEvent} from 'web/utils/testing';

import LoadingButton from '../loadingbutton';

describe('LoadingButton tests', () => {
  test('should render non loading', () => {
    const {element} = render(<LoadingButton />);

    expect(element).toMatchSnapshot();
  });

  test('should render loading', () => {
    const {element} = render(<LoadingButton isLoading={true} />);

    expect(element).toMatchSnapshot();
  });

  test('should call click handler', () => {
    const handler = testing.fn();

    const {element} = render(<LoadingButton onClick={handler} />);

    fireEvent.click(element);

    expect(handler).toHaveBeenCalled();
  });

  test('should call click handler with value', () => {
    const handler = testing.fn();

    const {element} = render(<LoadingButton onClick={handler} value="bar" />);

    fireEvent.click(element);

    expect(handler).toHaveBeenCalledWith('bar', undefined);
  });

  test('should call click handler with value and name', () => {
    const handler = testing.fn();

    const {element} = render(
      <LoadingButton name="foo" value="bar" onClick={handler} />,
    );

    fireEvent.click(element);

    expect(handler).toHaveBeenCalledWith('bar', 'foo');
  });

  test('should render title', () => {
    const {element} = render(<LoadingButton title="foo" />);

    expect(element).toHaveAttribute('title', 'foo');
    expect(element).toHaveTextContent('foo');
  });

  test('should render title and children', () => {
    const {element} = render(<LoadingButton title="foo">bar</LoadingButton>);

    expect(element).toHaveAttribute('title', 'foo');
    expect(element).toHaveTextContent('bar');
  });

  test('should render non loading with title', () => {
    const {element} = render(<LoadingButton title="foo" />);

    expect(element).toHaveStyleRule('background', Theme.white);
  });

  test('should render loading with title', () => {
    const {element} = render(<LoadingButton title="foo" isLoading={true} />);

    expect(element).toHaveStyleRule(
      'background',
      `${Theme.lightGreen} url(/img/loading.gif) center center no-repeat`,
    );
  });
});

// vim: set ts=2 sw=2 tw=80:
