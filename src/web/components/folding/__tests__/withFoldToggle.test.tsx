/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen, fireEvent} from 'web/testing';
import {FoldState} from 'web/components/folding/Folding';
import withFoldToggle, {
  type FoldToggleComponentProps,
} from 'web/components/folding/withFoldToggle';

type DummyProps = FoldToggleComponentProps;

describe('withFoldToggle', () => {
  test('toggles foldState when onFolded isCalled', () => {
    const DummyComponent = ({foldState, onFoldToggle}: DummyProps) => (
      <div>
        <span data-testid="foldState">{foldState}</span>
        <button onClick={onFoldToggle}>Toggle</button>
      </div>
    );

    const FoldToggleComponent = withFoldToggle(DummyComponent);

    render(<FoldToggleComponent />);

    expect(screen.getByTestId('foldState')).toHaveTextContent(
      FoldState.UNFOLDED,
    );

    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('foldState')).toHaveTextContent(
      FoldState.FOLDING_START,
    );
  });
});
