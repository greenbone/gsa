/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import Capabilities from 'gmp/capabilities/capabilities';

import ReportFormat from 'gmp/models/reportformat';

import {rendererWith, fireEvent} from 'web/utils/testing';

import Theme from 'web/utils/theme';

import VerifyIcon from '../verifyicon';

describe('Entity VerifyIcon component tests', () => {
  test('should render in active state with correct permissions', () => {
    const caps = new Capabilities(['everything']);
    const entity = ReportFormat.fromElement({
      permissions: {permission: [{name: 'verify_report_format'}]},
    });
    const clickHandler = testing.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(
      <VerifyIcon entity={entity} onClick={clickHandler} />,
    );

    expect(element).not.toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
    expect(entity.userCapabilities.mayOp('verify_report_format')).toEqual(true);

    fireEvent.click(element);

    expect(clickHandler).toHaveBeenCalled();
  });

  test('should render in active state with correct permissions and name given', () => {
    const caps = new Capabilities(['everything']);
    const entity = ReportFormat.fromElement({
      permissions: {permission: [{name: 'verify_report_format'}]},
    });
    const clickHandler = testing.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(
      <VerifyIcon
        entity={entity}
        name="report_format"
        onClick={clickHandler}
      />,
    );

    expect(element).not.toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
    expect(entity.userCapabilities.mayOp('verify_report_format')).toEqual(true);

    fireEvent.click(element);

    expect(clickHandler).toHaveBeenCalled();
  });

  test('should deactivate if wrong command level permissions are given', () => {
    const caps = new Capabilities(['authenticate']);
    const entity = ReportFormat.fromElement({
      permissions: {permission: [{name: 'verify_report_format'}]},
    });
    const clickHandler = testing.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(
      <VerifyIcon entity={entity} onClick={clickHandler} />,
    );

    expect(entity.userCapabilities.mayOp('verify_report_format')).toEqual(true);

    fireEvent.click(element);
    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
  });

  test('should deactivate if wrong resource level permissions are given', () => {
    const caps = new Capabilities(['everything']);
    const entity = ReportFormat.fromElement({
      permissions: {permission: [{name: 'verify_scanner'}]},
    });
    const clickHandler = testing.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(
      <VerifyIcon entity={entity} onClick={clickHandler} />,
    );

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
