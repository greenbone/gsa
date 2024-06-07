/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, userEvent} from 'web/utils/testing';
import Theme from 'web/utils/theme';

import InfoPanel from '../infopanel';

describe('InfoPanel tests', () => {
  test('should render with children', () => {
    const {element, queryByRole, getByTestId} = render(
      <InfoPanel heading="heading text" footer="footer text">
        <span data-testid="child-span">child</span>
      </InfoPanel>,
    );

    const childSpan = getByTestId('child-span');
    const closeButton = queryByRole('button');

    expect(element).toHaveTextContent('heading text');
    expect(element).toHaveTextContent('footer text');
    expect(closeButton).not.toBeInTheDocument();
    expect(childSpan).toBeInTheDocument();
    expect(childSpan).toHaveTextContent('child');
  });

  test('should show close button if handler is defined', () => {
    const handleCloseClick = testing.fn();
    const {element, queryByRole} = render(
      <InfoPanel
        heading="heading text"
        footer="footer text"
        onCloseClick={handleCloseClick}
      />,
    );

    const closeButton = queryByRole('button');

    expect(element).toHaveTextContent('heading text');
    expect(element).toHaveTextContent('footer text');
    expect(closeButton).toBeInTheDocument();
  });

  test('should render blue if info', () => {
    const handleCloseClick = testing.fn();
    const {element, queryByRole, getByTestId} = render(
      <InfoPanel
        heading="heading text"
        footer="footer text"
        onCloseClick={handleCloseClick}
      />,
    );

    const heading = getByTestId('infopanel-heading');
    const closeButton = queryByRole('button');

    expect(element).toHaveTextContent('heading text');
    expect(element).toHaveTextContent('footer text');
    expect(closeButton).toBeInTheDocument();
    expect(heading).toHaveStyleRule('background-color', Theme.lightBlue);
  });

  test('should render red if warning', () => {
    const handleCloseClick = testing.fn();
    const {element, queryByRole, getByTestId} = render(
      <InfoPanel
        isWarning={true}
        heading="heading text"
        footer="footer text"
        onCloseClick={handleCloseClick}
      />,
    );

    const heading = getByTestId('infopanel-heading');
    const closeButton = queryByRole('button');

    expect(element).toHaveTextContent('heading text');
    expect(element).toHaveTextContent('footer text');
    expect(closeButton).toBeInTheDocument();
    expect(heading).toHaveStyleRule('background-color', Theme.mediumLightRed);
  });

  test('should call click handler', () => {
    const handleCloseClick = testing.fn();
    const {queryByRole} = render(
      <InfoPanel
        heading="heading text"
        footer="footer text"
        onCloseClick={handleCloseClick}
      />,
    );

    const closeButton = queryByRole('button');

    expect(closeButton).toBeInTheDocument();

    userEvent.click(closeButton);

    expect(handleCloseClick).toHaveBeenCalled();
  });
});

// vim: set ts=2 sw=2 tw=80:
