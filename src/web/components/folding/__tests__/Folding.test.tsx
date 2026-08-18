/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import {withFolding, FoldState} from 'web/components/folding/Folding';

describe('withFolding', () => {
  const DummyComponent = (props: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>Dummy Component</div>
  );
  const FoldableComponent = withFolding(DummyComponent);

  test('hides content when foldState is Folded', () => {
    const {rerender} = render(
      <FoldableComponent foldState={FoldState.FOLDED} />,
    );
    expect(screen.getByText('Dummy Component')).not.toBeVisible();

    rerender(<FoldableComponent foldState={FoldState.UNFOLDED} />);
    expect(screen.getByText('Dummy Component')).toBeVisible();
  });
});
