/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import Capabilities from 'gmp/capabilities/capabilities';

import ReportFormat from 'gmp/models/reportformat';

import {rendererWith, fireEvent} from 'web/utils/testing';

import Theme from 'web/utils/theme';

import VerifyIcon from '../verifyicon';

describe('Entity VerifyIcon component tests', () => {
  test('should render in active state with correct permissions', () => {
    const caps = new Capabilities(['everything']);
    const entity = new ReportFormat({
      permissions: {permission: [{name: 'verify_report_format'}]},
    });
    const clickHandler = jest.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(
      <VerifyIcon entity={entity} onClick={clickHandler} />,
    );

    expect(element).toMatchSnapshot();
    expect(element).not.toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
    expect(entity.userCapabilities.mayOp('verify_report_format')).toEqual(true);

    fireEvent.click(element);

    expect(clickHandler).toHaveBeenCalled();
  });

  test('should render in active state with correct permissions and name given', () => {
    const caps = new Capabilities(['everything']);
    const entity = new ReportFormat({
      permissions: {permission: [{name: 'verify_report_format'}]},
    });
    const clickHandler = jest.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(
      <VerifyIcon
        entity={entity}
        name="report_format"
        onClick={clickHandler}
      />,
    );

    expect(element).toMatchSnapshot();
    expect(element).not.toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
    expect(entity.userCapabilities.mayOp('verify_report_format')).toEqual(true);

    fireEvent.click(element);

    expect(clickHandler).toHaveBeenCalled();
  });

  test('should deactivate if wrong command level permissions are given', () => {
    const caps = new Capabilities(['authenticate']);
    const entity = new ReportFormat({
      permissions: {permission: [{name: 'verify_report_format'}]},
    });
    const clickHandler = jest.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(
      <VerifyIcon entity={entity} onClick={clickHandler} />,
    );

    expect(element).toMatchSnapshot();
    expect(entity.userCapabilities.mayOp('verify_report_format')).toEqual(true);

    fireEvent.click(element);
    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
  });

  test('should deactivate if wrong resource level permissions are given', () => {
    const caps = new Capabilities(['everything']);
    const entity = new ReportFormat({
      permissions: {permission: [{name: 'verify_scanner'}]},
    });
    const clickHandler = jest.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(
      <VerifyIcon entity={entity} onClick={clickHandler} />,
    );

    expect(element).toMatchSnapshot();
    expect(entity.userCapabilities.mayOp('verify_report_format')).toEqual(
      false,
    );

    fireEvent.click(element);

    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
  });
});

// vim: set ts=2 sw=2 tw=80:
