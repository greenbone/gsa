/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith, fireEvent, RendererOptions} from 'web/testing';
import TableHead from 'web/components/table/Head';

const rendererWithTableHeader = (options: RendererOptions = {}) => {
  const {render, ...other} = rendererWith(options);
  return {
    ...other,
    render: (element: React.ReactNode) =>
      render(
        <table>
          <thead>
            <tr>{element}</tr>
          </thead>
        </table>,
      ),
  };
};

describe('TableHead tests', () => {
  test('should render with default props', () => {
    const {render} = rendererWithTableHeader();
    render(<TableHead />);
    expect(screen.getByRole('columnheader')).toBeInTheDocument();
  });

  test('should render', () => {
    const {render} = rendererWithTableHeader();
    render(
      <TableHead currentSortBy="name" currentSortDir="asc" sortBy="name" />,
    );
    expect(screen.getByTestId('table-header-sort-by-name')).toBeVisible();
  });

  test('should handle sorting', () => {
    const onSortChange = testing.fn();
    const {render} = rendererWithTableHeader();
    render(
      <TableHead
        currentSortBy="name"
        currentSortDir="asc"
        sortBy="name"
        onSortChange={onSortChange}
      />,
    );
    const sortButton = screen.getByRole('button');
    fireEvent.click(sortButton);
    expect(onSortChange).toHaveBeenCalledWith('name');
  });

  test('should render title', () => {
    const {render} = rendererWithTableHeader();
    const title = 'Test Title';
    render(<TableHead title={title} />);
    expect(screen.getByText(title)).toBeInTheDocument();

    const onSortChange = testing.fn();
    render(
      <TableHead
        currentSortBy="name"
        currentSortDir="asc"
        sortBy="name"
        title="Foo Bar"
        onSortChange={onSortChange}
      />,
    );
    expect(screen.getByText('Foo Bar')).toBeInTheDocument();
  });

  test('should not render not sorted', () => {
    const onSortChange = testing.fn();
    const {render} = rendererWithTableHeader();
    render(
      <TableHead
        currentSortBy="name"
        sortBy="foo"
        onSortChange={onSortChange}
      />,
    );
    expect(screen.getByTitle('Not Sorted')).toBeVisible();
    expect(screen.getByTestId('arrow-up-down-icon')).toBeVisible();
  });

  test('should not render sort symbol if not sorted', () => {
    const {render} = rendererWithTableHeader();
    render(<TableHead sort={false} sortBy="name" />);
    expect(
      screen.queryByTestId('table-header-sort-by-name'),
    ).not.toBeInTheDocument();

    render(<TableHead />);
    expect(
      screen.queryByTestId('table-header-sort-by-'),
    ).not.toBeInTheDocument();
  });

  test('should render sort with ascending icon', () => {
    const {render} = rendererWithTableHeader();
    render(
      <TableHead
        currentSortBy="name"
        currentSortDir="asc"
        sortBy="name"
        title="Name"
      />,
    );
    expect(
      screen.getByTitle('Sorted In Ascending Order By Name'),
    ).toBeVisible();
    expect(screen.getByTestId('arrow-up-icon')).toBeVisible();
  });

  test('should render sort with descending icon', () => {
    const {render} = rendererWithTableHeader();
    render(
      <TableHead
        currentSortBy="name"
        currentSortDir="desc"
        sortBy="name"
        title="Name"
      />,
    );
    expect(
      screen.getByTitle('Sorted In Descending Order By Name'),
    ).toBeVisible();
    expect(screen.getByTestId('arrow-down-icon')).toBeVisible();
  });
});
