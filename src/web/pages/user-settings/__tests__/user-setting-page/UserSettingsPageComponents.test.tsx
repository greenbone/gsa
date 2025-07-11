/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith, rendererWithTable} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import EverythingCapabilities from 'gmp/capabilities/everything';
import {
  SettingTableRow,
  ToolBarIcons,
} from 'web/pages/user-settings/user-setting-page/UserSettingsPageComponents';

describe('UserSettingsPageHelpers', () => {
  describe('SettingTableRow', () => {
    test('renders correctly with given props', () => {
      const setting = {
        id: '1',
        name: 'Test Setting',
        comment: 'This is a test',
      };
      const title = 'Test Title';
      const type = 'testType';

      const {render} = rendererWithTable({
        capabilities: new EverythingCapabilities(),
      });
      render(<SettingTableRow setting={setting} title={title} type={type} />);

      expect(screen.getByText(title)).toBeVisible();
      expect(screen.getByText(setting.name)).toBeVisible();
      expect(screen.getByTitle(setting.comment)).toBeVisible();
    });

    test('does not render DetailsLink if id is not defined', () => {
      const setting = {name: 'Test Setting', comment: 'This is a test'};
      const title = 'Test Title';
      const type = 'testType';

      const {render} = rendererWithTable({});
      render(<SettingTableRow setting={setting} title={title} type={type} />);

      expect(screen.queryByText(setting.name)).not.toBeInTheDocument();
    });

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
          capabilities: new Capabilities(),
        });
        render(
          <ToolBarIcons
            disableEditIcon={true}
            onEditSettingsClick={() => {}}
          />,
        );
        const deniedIcon = screen.getByTitle(
          'Permission to edit settings denied',
        );
        expect(deniedIcon).toBeDisabled();
      });
    });
  });
});
