/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {screen, rendererWithTableBody} from 'web/testing';
import TrashCanTableRow from 'web/pages/trashcan/TrashCanTableRow';

describe('TrashCanTableRow tests', () => {
  test('should render title and link to section', () => {
    const {render} = rendererWithTableBody();
    render(<TrashCanTableRow count={5} title="Test Title" type="test-type" />);

    const linkElement = screen.getByRole('link', {name: /test title/i});
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '#test-type');
  });

  test('should render count', () => {
    const {render} = rendererWithTableBody();
    render(<TrashCanTableRow count={5} title="Test Title" type="test-type" />);

    const countElement = screen.getByText('5');
    expect(countElement).toBeInTheDocument();
  });

  test('should render row with the correct structure', () => {
    const {render} = rendererWithTableBody();
    render(<TrashCanTableRow count={5} title="Test Title" type="test-type" />);

    const rowElement = screen.getByRole('row');
    expect(rowElement).toBeInTheDocument();

    const cells = screen.getAllByRole('cell');
    expect(cells).toHaveLength(2);
  });
});
