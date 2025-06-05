/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import ExternalLink from 'web/components/link/ExternalLink';
import {screen, within, fireEvent, rendererWith} from 'web/testing';

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
    const {element} = render(
      <ExternalLink title="Foo" to="http://foo.bar">
        Bar
      </ExternalLink>,
    );

    expect(screen.queryDialog()).not.toBeInTheDocument();
    fireEvent.click(element);
    const dialog = screen.getDialog();
    expect(dialog).toBeInTheDocument();
  });

  test('should close confirmation dialog on resume click', () => {
    const oldOpen = window.open;

    window.open = testing.fn();

    const {render} = rendererWith({capabilities: true, router: true});
    const {element} = render(
      <ExternalLink title="Foo" to="http://foo.bar">
        Bar
      </ExternalLink>,
    );

    expect(screen.queryDialog()).not.toBeInTheDocument();
    fireEvent.click(element);
    const dialog = screen.getDialog();
    expect(dialog).toBeInTheDocument();
    const resumeButton = screen.getDialogSaveButton();
    fireEvent.click(resumeButton);

    const closedDialog = screen.queryDialog();
    expect(closedDialog).not.toBeInTheDocument();

    window.open = oldOpen;
  });

  test('should open url in new window', () => {
    const oldOpen = window.open;

    window.open = testing.fn();

    const {render} = rendererWith({capabilities: true, router: true});
    const {element} = render(
      <ExternalLink title="Foo" to="http://foo.bar">
        Bar
      </ExternalLink>,
    );

    fireEvent.click(element);

    const dialog = within(screen.getDialog());
    fireEvent.click(dialog.getByText('Follow Link'));
    expect(window.open).toBeCalledWith(
      'http://foo.bar',
      '_blank',
      'noopener, scrollbars=1, resizable=1',
    );

    window.open = oldOpen;
  });
});
