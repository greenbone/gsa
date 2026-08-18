/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {fireEvent, render, screen} from 'web/testing';
import {FoldState} from 'web/components/folding/Folding';
import Section from 'web/components/section/Section';

describe('Section tests', () => {
  test('should render children without a header or folding controls', () => {
    render(
      <Section data-testid="section">
        <span>Section content</span>
      </Section>,
    );

    const section = screen.getByTestId('section');

    expect(section).toHaveTextContent('Section content');
    expect(section.querySelector('.section-header')).not.toBeNull();
    expect(section.querySelector('.section-fold-icon')).toBeNull();
  });

  test('should render the default header with title, image, and extra content', () => {
    render(
      <Section
        foldable
        data-testid="section"
        extra={<span>Extra content</span>}
        img={<span>Section image</span>}
        title="Section title"
      >
        Section content
      </Section>,
    );

    const section = screen.getByTestId('section');

    expect(section.querySelector('.section-header')).not.toBeNull();
    expect(section).toHaveTextContent('Section title');
    expect(section).toHaveTextContent('Section image');
    expect(section).toHaveTextContent('Extra content');
    expect(section).toHaveTextContent('Section content');
    expect(screen.getByTestId('fold-state-icon-fold')).toBeInTheDocument();
  });

  test('should use a supplied header instead of creating the default header', () => {
    render(
      <Section data-testid="section" header={<span>Custom header</span>}>
        Section content
      </Section>,
    );

    const section = screen.getByTestId('section');

    expect(section).toHaveTextContent('Custom header');
    expect(section).toHaveTextContent('Section content');
    expect(section.querySelector('.section-header')).toBeNull();
  });

  test('should start folded when requested and toggle from the fold icon', () => {
    render(
      <Section
        foldable
        data-testid="section"
        initialFoldState={FoldState.FOLDED}
      >
        Section content
      </Section>,
    );

    expect(screen.getByTestId('fold-state-icon-unfold')).toBeInTheDocument();
    expect(screen.getByText('Section content')).not.toBeVisible();

    fireEvent.click(screen.getByTestId('fold-state-icon-unfold'));

    expect(screen.getByTestId('fold-state-icon-fold')).toBeInTheDocument();
    expect(screen.getByText('Section content')).toBeVisible();
  });
});
