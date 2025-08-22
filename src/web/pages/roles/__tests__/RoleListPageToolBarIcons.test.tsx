/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import RoleListPageToolBarIcons from 'web/pages/roles/RoleListPageToolBarIcons';

const manualUrl = 'test/';

const gmp = {
  settings: {manualUrl},
};

describe('RoleListPageToolBarIcons tests', () => {
  test('should render NewIcon when user has create capability', () => {
    const {render} = rendererWith({
      capabilities: true,
      gmp,
    });
    render(<RoleListPageToolBarIcons onRoleCreateClick={() => {}} />);
    expect(screen.getByTitle('New Role')).toBeVisible();
  });

  test('should not render NewIcon when user does not have create capability', () => {
    const wrongCaps = new Capabilities([]);

    const {render} = rendererWith({
      capabilities: wrongCaps,
      gmp,
    });
    render(<RoleListPageToolBarIcons onRoleCreateClick={() => {}} />);
    expect(screen.queryByTitle('New Role')).not.toBeInTheDocument();
  });

  test('should render ManualIcon with correct props', () => {
    const {render} = rendererWith({
      capabilities: true,
      gmp,
    });
    render(<RoleListPageToolBarIcons onRoleCreateClick={() => {}} />);
    expect(screen.getByTestId('manual-link')).toBeVisible();
  });
});
