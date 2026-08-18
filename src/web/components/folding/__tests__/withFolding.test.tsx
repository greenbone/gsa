/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, render, screen} from 'web/testing';
import {FoldState} from 'web/components/folding/Folding';
import withFolding from 'web/components/folding/withFolding';

const DummyComponent = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>Dummy Component</div>
);

const FoldableComponent = withFolding(DummyComponent);

describe('withFolding', () => {
  test('should update the display name', () => {
    expect(FoldableComponent.displayName).toBe('withFolding(DummyComponent)');
  });

  test('should use the default fold state and forward props', () => {
    const {element} = render(
      <FoldableComponent className="dummy-component" data-testid="dummy" />,
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
    const {element, rerender} = render(
      <FoldableComponent foldState={foldState} />,
    );

    expect(element).toHaveStyle({display, height});

    rerender(<FoldableComponent foldState={FoldState.UNFOLDED} />);
  });

  test('should hide folded content and show it when unfolded', () => {
    const {rerender} = render(
      <FoldableComponent foldState={FoldState.FOLDED} />,
    );
    expect(screen.getByText('Dummy Component')).not.toBeVisible();

    rerender(<FoldableComponent foldState={FoldState.UNFOLDED} />);
    expect(screen.getByText('Dummy Component')).toBeVisible();
  });

  test('should call onFoldStepEnd after a transition', () => {
    const onFoldStepEnd = testing.fn();
    const {element} = render(
      <FoldableComponent
        foldState={FoldState.FOLDING_START}
        onFoldStepEnd={onFoldStepEnd}
      />,
    );

    fireEvent.transitionEnd(element);

    expect(onFoldStepEnd).toHaveBeenCalledTimes(1);
  });
});
