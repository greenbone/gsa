/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import SnackbarCreator from 'web/components/snackbar/Snackbar';
import {render} from 'web/utils/Testing';

describe('Snackbar tests', () => {
  test('should render', () => {
    const {rerender, element} = render(
      <SnackbarCreator message={{text: undefined}} />,
    );

    rerender(<SnackbarCreator message={{text: 'foo'}} />);

    expect(element).toMatchSnapshot();
  });

  test('should not render if text is undefined', () => {
    const {queryByTestId} = render(
      <SnackbarCreator message={{text: undefined}} />,
    );

    expect(queryByTestId('snackbar-container')).not.toBeInTheDocument();
  });

  test('should not render again if message stays the same', () => {
    const {element, queryByTestId, rerender} = render(
      <SnackbarCreator message={{text: undefined}} />,
    );
    const message = {text: 'foo'};

    rerender(<SnackbarCreator message={message} />);

    expect(element).toHaveTextContent('foo');

    rerender(<SnackbarCreator message={message} />);

    setTimeout(
      () => expect(queryByTestId('snackbar-container')).not.toBeInTheDocument(),
      5000,
    );
  });

  test('should call handleClose', () => {
    const {rerender, element} = render(
      <SnackbarCreator message={{text: undefined}} />,
    );

    rerender(<SnackbarCreator message={{text: 'foo'}} />);

    expect(element).toHaveTextContent('foo');
    setTimeout(() => expect(element.handleClose()).toHaveBeenCalled(), 5000);
  });

  test('should close after 5 seconds', () => {
    const {rerender, element} = render(
      <SnackbarCreator message={{text: undefined}} />,
    );

    rerender(<SnackbarCreator message={{text: 'foo'}} />);

    expect(element).toHaveTextContent('foo');
    setTimeout(() => expect(element).not.toHaveTextContent('foo'), 5000);
  });

  test('should render multiple snackbars successively', () => {
    const {rerender, element} = render(
      <SnackbarCreator message={{text: undefined}} />,
    );

    rerender(<SnackbarCreator message={{text: 'foo'}} />);

    expect(element).toHaveTextContent('foo');

    rerender(<SnackbarCreator message={{text: 'bar'}} />);

    expect(element).toHaveTextContent('foo');
    expect(element).not.toHaveTextContent('bar');
    setTimeout(() => expect(element).not.toHaveTextContent('foo'), 5000);
    setTimeout(() => expect(element).toHaveTextContent('bar'), 5000);
  });
});
