/* Copyright (C) 2019-2022 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';
import userEvent from '@testing-library/user-event';

import {render} from 'web/utils/testing';
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
    const handleCloseClick = jest.fn();
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
    const handleCloseClick = jest.fn();
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
    const handleCloseClick = jest.fn();
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
    const handleCloseClick = jest.fn();
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
