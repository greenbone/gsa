/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import CredentialListPageToolBarIcons from 'web/pages/credentials/CredentialListPageToolBarIcons';

const manualUrl = 'test/';

describe('CredentialPage ToolBarIcons test', () => {
  test('should render', async () => {
    const handleCredentialCreateClick = testing.fn();
    const gmp = {settings: {manualUrl}};
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <CredentialListPageToolBarIcons
        onCredentialCreateClick={handleCredentialCreateClick}
      />,
    );

    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: Credentials',
    );
    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-credentials',
    );
  });

  test('should call click handlers', async () => {
    const handleCredentialCreateClick = testing.fn();
    const gmp = {settings: {manualUrl}};
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <CredentialListPageToolBarIcons
        onCredentialCreateClick={handleCredentialCreateClick}
      />,
    );

    const newIcon = screen.getByTitle('New Credential');
    fireEvent.click(newIcon);
    expect(handleCredentialCreateClick).toHaveBeenCalledWith(undefined);
  });

  test('should not show icons if user does not have the right permissions', () => {
    const handleCredentialCreateClick = testing.fn();
    const gmp = {settings: {manualUrl}};
    const {render} = rendererWith({
      gmp,
      capabilities: false,
      router: true,
    });

    render(
      <CredentialListPageToolBarIcons
        onCredentialCreateClick={handleCredentialCreateClick}
      />,
    );

    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: Credentials',
    );
    expect(screen.queryByTitle('New Credential')).not.toBeInTheDocument();
  });
});
