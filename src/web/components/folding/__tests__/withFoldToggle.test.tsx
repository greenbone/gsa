/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {fireEvent, render, screen} from 'web/testing';
import {FoldState} from 'web/components/folding/Folding';
import withFoldToggle, {
  type FoldToggleComponentProps,
} from 'web/components/folding/withFoldToggle';

interface DummyProps extends FoldToggleComponentProps {
  label?: string;
}

const DummyComponent = ({
  foldState,
  label,
  onFoldStepEnd,
  onFoldToggle,
}: DummyProps) => (
  <div>
    <span data-testid="foldState">{foldState}</span>
    <span>{label}</span>
    <button onClick={onFoldToggle}>Toggle</button>
    <button onClick={onFoldStepEnd}>Step end</button>
  </div>
);

const FoldToggleComponent = withFoldToggle(DummyComponent);

const getFoldState = () => screen.getByTestId('foldState').textContent;

describe('withFoldToggle', () => {
  test('should update the wrapper display name', () => {
    expect(FoldToggleComponent.displayName).toBe(
      'withFoldToggle(DummyComponent)',
    );
  });

  test('should use the default fold state and forward public props', () => {
    render(<FoldToggleComponent label="Test label" />);

    expect(getFoldState()).toBe(FoldState.UNFOLDED);
    expect(screen.getByText('Test label')).toBeInTheDocument();
  });

  test('should use the initial fold state', () => {
    render(<FoldToggleComponent initialFoldState={FoldState.FOLDED} />);

    expect(getFoldState()).toBe(FoldState.FOLDED);
  });

  test.each([
    [FoldState.FOLDED, FoldState.UNFOLDING_START],
    [FoldState.UNFOLDED, FoldState.FOLDING_START],
    [FoldState.UNFOLDING_START, FoldState.FOLDED],
    [FoldState.FOLDING_START, FoldState.UNFOLDED],
    [FoldState.UNFOLDING, FoldState.FOLDING],
    [FoldState.FOLDING, FoldState.UNFOLDING],
  ])('should toggle %s to %s', (initialFoldState, expectedFoldState) => {
    render(<FoldToggleComponent initialFoldState={initialFoldState} />);

    fireEvent.click(screen.getByText('Toggle'));

    expect(getFoldState()).toBe(expectedFoldState);
  });

  test.each([
    [FoldState.FOLDED, FoldState.FOLDED],
    [FoldState.UNFOLDED, FoldState.UNFOLDED],
    [FoldState.UNFOLDING_START, FoldState.UNFOLDING],
    [FoldState.FOLDING_START, FoldState.FOLDING],
    [FoldState.UNFOLDING, FoldState.UNFOLDED],
    [FoldState.FOLDING, FoldState.FOLDED],
  ])(
    'should handle fold step end from %s to %s',
    (initialFoldState, expectedFoldState) => {
      render(<FoldToggleComponent initialFoldState={initialFoldState} />);

      fireEvent.click(screen.getByText('Step end'));

      expect(getFoldState()).toBe(expectedFoldState);
    },
  );

  test('should provide both fold handlers to the wrapped component', () => {
    render(<FoldToggleComponent />);

    fireEvent.click(screen.getByText('Toggle'));
    expect(getFoldState()).toBe(FoldState.FOLDING_START);

    fireEvent.click(screen.getByText('Step end'));
    expect(getFoldState()).toBe(FoldState.FOLDING);
  });
});
