/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import OverrideListPageToolBarIcons from 'web/pages/overrides/OverrideListPageToolBarIcons';

const createGmp = () => ({
  settings: {
    manualUrl: 'https://example.com/manual',
  },
});

describe('OverrideListPageToolBarIcons tests', () => {
  test('should render ManualIcon', () => {
    const handleCreate = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(
      <OverrideListPageToolBarIcons onOverrideCreateClick={handleCreate} />,
    );

    expect(screen.getByTitle('Help: Overrides')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Help Icon'})).toHaveAttribute(
      'href',
      'https://example.com/manual/en/reports.html#managing-overrides',
    );
  });

  test('should allow to create new override when the user has create capabilities', () => {
    const handleCreate = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(
      <OverrideListPageToolBarIcons onOverrideCreateClick={handleCreate} />,
    );

    const newIcon = screen.getByTitle('New Override');
    expect(newIcon).toBeInTheDocument();

    fireEvent.click(newIcon);
    expect(handleCreate).toHaveBeenCalledTimes(1);
  });

  test('should not render the NewIcon when the user lacks create capabilities', () => {
    const handleCreate = testing.fn();
    const {render} = rendererWith({capabilities: false, gmp: createGmp()});
    render(
      <OverrideListPageToolBarIcons onOverrideCreateClick={handleCreate} />,
    );

    expect(screen.queryByTitle('New Override')).not.toBeInTheDocument();
  });
});
