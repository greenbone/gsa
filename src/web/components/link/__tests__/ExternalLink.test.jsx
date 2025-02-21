/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  fireEvent,
  getByRole,
  getByText,
  queryByRole,
  rendererWith,
} from 'web/utils/Testing';

import ExternalLink from '../ExternalLink';

describe('ExternalLink tests', () => {
  test('should render ExternalLink', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    const {element} = render(
      <ExternalLink title="Foo" to="http://foo.bar">
        Bar
      </ExternalLink>,
    );

    expect(element).toHaveTextContent('Bar');
    expect(element).toHaveAttribute('title', 'Foo');
    expect(element).toHaveAttribute('href', 'http://foo.bar');
  });

  test('should open confirmation dialog', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    const {element, baseElement} = render(
      <ExternalLink title="Foo" to="http://foo.bar">
        Bar
      </ExternalLink>,
    );

    expect(queryByRole(baseElement, 'dialog')).toBeNull();

    fireEvent.click(element);

    const dialog = queryByRole(baseElement, 'dialog');

    expect(dialog).toBeTruthy();
  });

  test('should close confirmation dialog on resume click', () => {
    const oldOpen = window.open;

    window.open = testing.fn();

    const {render} = rendererWith({capabilities: true, router: true});
    const {element, baseElement, getByTestId} = render(
      <ExternalLink title="Foo" to="http://foo.bar">
        Bar
      </ExternalLink>,
    );

    expect(queryByRole(baseElement, 'dialog')).toBeNull();

    fireEvent.click(element);

    const dialog = queryByRole(baseElement, 'dialog');

    expect(dialog).toBeTruthy();

    const resumeButton = getByTestId('dialog-save-button');

    fireEvent.click(resumeButton);

    const closedDialog = queryByRole(baseElement, 'dialog');

    expect(closedDialog).toBeFalsy();

    window.open = oldOpen;
  });

  test('should open url in new window', () => {
    const oldOpen = window.open;

    window.open = testing.fn();

    const {render} = rendererWith({capabilities: true, router: true});
    const {element, baseElement} = render(
      <ExternalLink title="Foo" to="http://foo.bar">
        Bar
      </ExternalLink>,
    );

    fireEvent.click(element);

    const dialog = getByRole(baseElement, 'dialog');

    fireEvent.click(getByText(dialog, 'Follow Link'));

    expect(window.open).toBeCalledWith(
      'http://foo.bar',
      '_blank',
      'noopener, scrollbars=1, resizable=1',
    );

    window.open = oldOpen;
  });
});
