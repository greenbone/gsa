/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, fireEvent, screen} from 'web/testing';
import ReportPanel from 'web/pages/reports/details/ReportPanel';

describe('ReportPanel tests', () => {
  test('should render title, icon and content', () => {
    render(
      <ReportPanel icon={<span>Icon</span>} title="Panel title">
        Panel content
      </ReportPanel>,
    );

    expect(screen.getByTestId('infopanel-heading')).toHaveTextContent(
      'Panel title',
    );
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Panel content')).toBeInTheDocument();
  });

  test('should call click handler when content is clicked', () => {
    const onClick = testing.fn();

    render(
      <ReportPanel
        icon={<span>Icon</span>}
        title="Clickable panel"
        onClick={onClick}
      >
        Click me
      </ReportPanel>,
    );

    fireEvent.click(screen.getByText('Click me'));

    expect(onClick).toHaveBeenCalled();
  });

  test('should not fail without click handler', () => {
    render(
      <ReportPanel icon={<span>Icon</span>} title="Panel without click">
        Static content
      </ReportPanel>,
    );

    fireEvent.click(screen.getByText('Static content'));

    expect(screen.getByText('Static content')).toBeInTheDocument();
  });
});
