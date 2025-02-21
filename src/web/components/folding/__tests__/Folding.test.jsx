/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen, fireEvent} from 'web/utils/Testing';

import {withFolding, FoldState, withFoldToggle} from '../Folding';

describe('withFolding', () => {
  const DummyComponent = props => <div {...props}>Dummy Component</div>;
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
    const DummyComponent = ({foldState, onFoldToggle}) => (
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
