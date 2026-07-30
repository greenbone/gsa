/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, fireEvent, render} from 'web/testing';
import InfoPanel from 'web/components/panel/InfoPanel';
import Theme from 'web/utils/theme';

describe('InfoPanel tests', () => {
  test('should render with children', () => {
    render(
      <InfoPanel footer="footer text" heading="heading text">
        <span data-testid="child-span">child</span>
      </InfoPanel>,
    );

    expect(screen.getByText('heading text')).toBeInTheDocument();
    expect(screen.getByText('footer text')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByTestId('child-span')).toHaveTextContent('child');
  });

  test('should show close button if handler is defined', () => {
    const handleCloseClick = testing.fn();
    render(
      <InfoPanel
        footer="footer text"
        heading="heading text"
        onCloseClick={handleCloseClick}
      />,
    );

    expect(screen.getByText('heading text')).toBeInTheDocument();
    expect(screen.getByText('footer text')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Close Icon'}),
    ).toBeInTheDocument();
  });

  test('should render blue if info', () => {
    const handleCloseClick = testing.fn();
    render(
      <InfoPanel
        footer="footer text"
        heading="heading text"
        onCloseClick={handleCloseClick}
      />,
    );

    expect(screen.getByTestId('infopanel-heading')).toHaveBackgroundColor(
      Theme.lightBlue,
    );
    expect(
      screen.getByRole('button', {name: 'Close Icon'}),
    ).toBeInTheDocument();
  });

  test('should render red if warning', () => {
    const handleCloseClick = testing.fn();
    render(
      <InfoPanel
        footer="footer text"
        heading="heading text"
        isWarning={true}
        onCloseClick={handleCloseClick}
      />,
    );

    expect(screen.getByTestId('infopanel-heading')).toHaveBackgroundColor(
      Theme.mediumLightRed,
    );
    expect(
      screen.getByRole('button', {name: 'Close Icon'}),
    ).toBeInTheDocument();
  });

  test('should not render a heading section when heading is omitted', () => {
    render(<InfoPanel footer="footer text" />);

    expect(screen.queryByTestId('infopanel-heading')).not.toBeInTheDocument();
  });

  test('should not render a footer section when footer is omitted', () => {
    render(<InfoPanel heading="heading text" />);

    expect(screen.queryByText('footer text')).not.toBeInTheDocument();
  });

  test('should apply a red border when isWarning is true', () => {
    render(
      <InfoPanel
        data-testid="infopanel"
        heading="heading text"
        isWarning={true}
      />,
    );

    expect(screen.getByTestId('infopanel')).toHaveBorderColor(Theme.darkRed);
  });

  test('should apply a blue border by default', () => {
    render(<InfoPanel data-testid="infopanel" heading="heading text" />);

    expect(screen.getByTestId('infopanel')).toHaveBorderColor(Theme.lightBlue);
  });

  test('should call click handler', async () => {
    const handleCloseClick = testing.fn();
    render(
      <InfoPanel
        footer="footer text"
        heading="heading text"
        onCloseClick={handleCloseClick}
      />,
    );

    const closeButton = screen.getByRole('button', {name: 'Close Icon'});
    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton);
    expect(handleCloseClick).toHaveBeenCalled();
  });
});
