/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen, fireEvent} from 'web/testing';
import {
  withFolding,
  FoldState,
  withFoldToggle,
  type FoldStateType,
} from 'web/components/folding/Folding';

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

describe('withFoldToggle', () => {
  test('toggles foldState when onFolded isCalled', () => {
    interface DummyProps {
      foldState: FoldStateType;
      onFoldToggle: () => void;
    }

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
