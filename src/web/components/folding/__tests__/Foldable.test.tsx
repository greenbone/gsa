/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, render, screen} from 'web/testing';
import Foldable from 'web/components/folding/Foldable';
import {FoldState} from 'web/components/folding/Folding';

describe('Foldable', () => {
  test('should use the default fold state and forward props', () => {
    const {element} = render(
      <Foldable className="dummy-component" data-testid="dummy">
        Dummy Component
      </Foldable>,
    );

    expect(element).toHaveStyle({display: 'block', height: 'auto'});
    expect(screen.getByTestId('dummy')).toHaveClass('dummy-component');
    expect(screen.getByText('Dummy Component')).toBeVisible();
  });

  test.each([
    [FoldState.FOLDED, 'none', '0px'],
    [FoldState.FOLDING, 'block', '0px'],
    [
      FoldState.FOLDING_START,
      'block',
      `${Math.ceil(window.innerHeight * 1.2)}px`,
    ],
    [FoldState.UNFOLDING, 'block', `${Math.ceil(window.innerHeight * 1.2)}px`],
    [FoldState.UNFOLDING_START, 'block', '1px'],
    [FoldState.UNFOLDED, 'block', 'auto'],
  ])('should apply %s folding styles', (foldState, display, height) => {
    const {element, rerender} = render(<Foldable foldState={foldState} />);

    expect(element).toHaveStyle({display, height});

    rerender(<Foldable foldState={FoldState.UNFOLDED} />);
  });

  test('should hide folded content and show it when unfolded', () => {
    const {rerender} = render(
      <Foldable foldState={FoldState.FOLDED}>Dummy Component</Foldable>,
    );
    expect(screen.getByText('Dummy Component')).not.toBeVisible();

    rerender(
      <Foldable foldState={FoldState.UNFOLDED}>Dummy Component</Foldable>,
    );
    expect(screen.getByText('Dummy Component')).toBeVisible();
  });

  test('should call onFoldStepEnd after a transition', () => {
    const onFoldStepEnd = testing.fn();
    const {element} = render(
      <Foldable
        foldState={FoldState.FOLDING_START}
        onFoldStepEnd={onFoldStepEnd}
      />,
    );

    fireEvent.transitionEnd(element);

    expect(onFoldStepEnd).toHaveBeenCalledTimes(1);
  });
});
