/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import InfoPanel from 'web/components/panel/InfoPanel';
import {screen, fireEvent, render} from 'web/testing';
import Theme from 'web/utils/Theme';

describe('InfoPanel tests', () => {
  test('should render with children', () => {
    const {element} = render(
      <InfoPanel footer="footer text" heading="heading text">
        <span data-testid="child-span">child</span>
      </InfoPanel>,
    );

    const childSpan = screen.getByTestId('child-span');
    const closeButton = screen.queryByRole('button');

    expect(element).toHaveTextContent('heading text');
    expect(element).toHaveTextContent('footer text');
    expect(closeButton).not.toBeInTheDocument();
    expect(childSpan).toBeInTheDocument();
    expect(childSpan).toHaveTextContent('child');
  });

  test('should show close button if handler is defined', () => {
    const handleCloseClick = testing.fn();
    const {element} = render(
      <InfoPanel
        footer="footer text"
        heading="heading text"
        onCloseClick={handleCloseClick}
      />,
    );

    const closeButton = screen.getByRole('button', {name: 'Close Icon'});

    expect(element).toHaveTextContent('heading text');
    expect(element).toHaveTextContent('footer text');
    expect(closeButton).toBeInTheDocument();
  });

  test('should render blue if info', () => {
    const handleCloseClick = testing.fn();
    const {element} = render(
      <InfoPanel
        footer="footer text"
        heading="heading text"
        onCloseClick={handleCloseClick}
      />,
    );

    const heading = screen.getByTestId('infopanel-heading');
    const closeButton = screen.getByRole('button', {name: 'Close Icon'});

    expect(element).toHaveTextContent('heading text');
    expect(element).toHaveTextContent('footer text');
    expect(closeButton).toBeInTheDocument();
    expect(heading).toHaveStyleRule('background-color', Theme.lightBlue);
  });

  test('should render red if warning', () => {
    const handleCloseClick = testing.fn();
    const {element} = render(
      <InfoPanel
        footer="footer text"
        heading="heading text"
        isWarning={true}
        onCloseClick={handleCloseClick}
      />,
    );

    const heading = screen.getByTestId('infopanel-heading');
    const closeButton = screen.getByRole('button', {name: 'Close Icon'});

    expect(element).toHaveTextContent('heading text');
    expect(element).toHaveTextContent('footer text');
    expect(closeButton).toBeInTheDocument();
    expect(heading).toHaveStyleRule('background-color', Theme.mediumLightRed);
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
