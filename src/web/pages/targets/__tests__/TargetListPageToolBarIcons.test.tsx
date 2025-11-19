/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import TargetListPageToolBarIcons from 'web/pages/targets/TargetListPageToolBarIcons';

const gmp = {
  settings: {
    manualUrl: 'https://example.com/manual',
  },
};

describe('TargetListPageToolBarIcons tests', () => {
  test('should render ManualIcon', () => {
    const {render} = rendererWith({capabilities: true, gmp});
    render(<TargetListPageToolBarIcons />);

    expect(screen.getByTitle('Help: Targets')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Help Icon'})).toHaveAttribute(
      'href',
      'https://example.com/manual/en/scanning.html#managing-targets',
    );
  });

  test('should allow to create new target when the user has create capabilities', () => {
    const handleCreate = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp});
    render(<TargetListPageToolBarIcons onTargetCreateClick={handleCreate} />);

    const newIcon = screen.getByTitle('New Target');
    expect(newIcon).toBeInTheDocument();

    newIcon.click();
    expect(handleCreate).toHaveBeenCalledTimes(1);
  });

  test('should not render the NewIcon when the user lacks create capabilities', () => {
    const handleCreate = testing.fn();
    const {render} = rendererWith({capabilities: false, gmp});
    render(<TargetListPageToolBarIcons onTargetCreateClick={handleCreate} />);

    expect(screen.queryByTitle('New Target')).not.toBeInTheDocument();
  });
});
