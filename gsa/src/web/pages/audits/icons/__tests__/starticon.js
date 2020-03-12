/* Copyright (C) 2019-2020 Greenbone Networks GmbH
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

import Audit, {AUDIT_STATUS} from 'gmp/models/audit';

import {rendererWith, fireEvent} from 'web/utils/testing';

import Theme from 'web/utils/theme';

import StartIcon from '../starticon';

describe('Audit StartIcon component tests', () => {
  test('should render in active state with correct permissions', () => {
    const caps = new Capabilities(['everything']);
    const audit = Audit.fromElement({status: AUDIT_STATUS.new});
    const clickHandler = jest.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(
      <StartIcon audit={audit} onClick={clickHandler} />,
    );

    expect(element).toMatchSnapshot();
    expect(caps.mayOp('start_task')).toEqual(true);

    fireEvent.click(element);

    expect(clickHandler).toHaveBeenCalled();
    expect(element).toHaveAttribute('title', 'Start');
    expect(element).not.toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
  });

  test('should render in inactive state if wrong command level permissions are given', () => {
    const caps = new Capabilities(['authenticate']);
    const audit = Audit.fromElement({status: AUDIT_STATUS.new});
    const clickHandler = jest.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(<StartIcon audit={audit} />);

    expect(caps.mayOp('start_task')).toEqual(false);
    fireEvent.click(element);

    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveAttribute(
      'title',
      'Permission to start Audit denied',
    );
    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
  });

  test('should render in inactive state if audit is already active', () => {
    const caps = new Capabilities(['everything']);
    const audit = Audit.fromElement({status: AUDIT_STATUS.requested});
    const clickHandler = jest.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(<StartIcon audit={audit} />);

    expect(caps.mayOp('start_task')).toEqual(true);
    fireEvent.click(element);

    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveAttribute('title', 'Audit is already active');
    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
  });

  test('should not be rendered if audit is running', () => {
    const caps = new Capabilities(['everything']);
    const audit = Audit.fromElement({status: AUDIT_STATUS.running});

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(<StartIcon audit={audit} />);

    expect(caps.mayOp('start_task')).toEqual(true);
    expect(element).toEqual(null);
  });
});

// vim: set ts=2 sw=2 tw=80:
