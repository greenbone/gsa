/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith} from 'web/testing';
import {ToolBarIcons} from 'web/pages/user-settings/UserSettingsPageHelpers';

describe('UserSettingsPageHelpers', () => {
  describe('ToolBarIcons', () => {
    test('should render and handle click', () => {
      const handleEdit = testing.fn();
      const {render} = rendererWith({
        gmp: {settings: {manualUrl: 'test/'}},
        capabilities: true,
        router: true,
      });
      render(
        <ToolBarIcons
          disableEditIcon={false}
          onEditSettingsClick={handleEdit}
        />,
      );
      const helpIcon = screen.getByTitle('Help: My Settings').closest('a');
      expect(helpIcon).toHaveAttribute(
        'href',
        'test/en/web-interface.html#changing-the-user-settings',
      );
      expect(screen.getByTitle('Help: My Settings')).toBeVisible();
      const editIcon = screen.getByTitle('Edit My Settings');
      expect(editIcon).toBeVisible();
      editIcon.click();
      expect(handleEdit).toHaveBeenCalled();
    });

    test('should render disabled edit icon if not allowed', () => {
      const {render} = rendererWith({
        gmp: {settings: {manualUrl: 'test/'}},
        router: true,
      });
      render(
        <ToolBarIcons disableEditIcon={true} onEditSettingsClick={() => {}} />,
      );
      const deniedIcon = screen.getByTitle(
        'Permission to edit settings denied',
      );
      expect(deniedIcon).toBeDisabled();
    });
  });
});
