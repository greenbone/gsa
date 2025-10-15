/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, testing, expect} from '@gsa/testing';
import {rendererWithTableHeader, screen} from 'web/testing';
import TableHead from 'web/components/table/TableHead';
import TableRow from 'web/components/table/TableRow';
import withEntitiesHeader, {
  type WithEntitiesHeaderComponentProps,
} from 'web/entities/withEntitiesHeader';
import SelectionType from 'web/utils/SelectionType';

describe('withEntitiesHeader test', () => {
  const MockComponent = testing.fn(
    ({actionsColumn}: WithEntitiesHeaderComponentProps) => (
      <TableRow data-testid="header-row">{actionsColumn}</TableRow>
    ),
  );

  test('should render with default actions column', () => {
    const EnhancedComponent = withEntitiesHeader()(MockComponent);
    const {render} = rendererWithTableHeader();
    render(<EnhancedComponent />);
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  test('should render with custom actions column', () => {
    const customActions = <TableHead title="Custom Actions" />;
    const EnhancedComponent = withEntitiesHeader(customActions)(MockComponent);
    const {render} = rendererWithTableHeader();
    render(<EnhancedComponent />);
    expect(screen.getByText('Custom Actions')).toBeInTheDocument();
  });

  test('should render user selection action', () => {
    const EnhancedComponent = withEntitiesHeader(true)(MockComponent);
    const {render} = rendererWithTableHeader();
    const {rerender} = render(
      <EnhancedComponent selectionType={SelectionType.SELECTION_USER} />,
    );
    expect(screen.getByText('Actions')).toBeInTheDocument();

    rerender(
      <EnhancedComponent selectionType={SelectionType.SELECTION_FILTER} />,
    );
    expect(screen.queryByText('Actions')).not.toBeInTheDocument();
    expect(screen.getByTestId('header-row')).toBeEmptyDOMElement();
  });

  test('should render no action column', () => {
    const EnhancedComponent = withEntitiesHeader(true)(MockComponent);
    const {render} = rendererWithTableHeader();
    render(<EnhancedComponent />);
    expect(screen.queryByText('Actions')).not.toBeInTheDocument();
    expect(screen.getByTestId('header-row')).toBeEmptyDOMElement();
  });
});
