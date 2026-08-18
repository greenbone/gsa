/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {render, screen} from 'web/testing';
import SectionHeader from 'web/components/section/SectionHeader';

describe('SectionHeader tests', () => {
  test('should render the section header layout', () => {
    const {element} = render(<SectionHeader />);

    expect(element).toHaveClass('section-header');
    expect(element.tagName).toBe('DIV');
    expect(element.querySelector('h2')).toBeInTheDocument();
  });

  test('should render the title, image, and children', () => {
    render(
      <SectionHeader
        img={<span data-testid="header-image">Header image</span>}
        title="Section title"
      >
        <span>Header actions</span>
      </SectionHeader>,
    );

    expect(screen.getByText('Section title')).toBeInTheDocument();
    expect(screen.getByTestId('header-image')).toBeInTheDocument();
    expect(screen.getByText('Header actions')).toBeInTheDocument();
  });

  test('should omit optional title and image when they are not provided', () => {
    render(<SectionHeader>Header actions</SectionHeader>);

    expect(screen.getByText('Header actions')).toBeInTheDocument();
    expect(screen.queryByTestId('header-image')).not.toBeInTheDocument();
    expect(screen.getByRole('heading')).toBeEmptyDOMElement();
  });
});
