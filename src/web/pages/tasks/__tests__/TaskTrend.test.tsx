/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render} from 'web/testing';
import TaskTrend from 'web/pages/tasks/TaskTrend';

describe('Task Trend tests', () => {
  test('should render', () => {
    const {element} = render(<TaskTrend name="up" />);

    expect(element).toBeVisible();
  });

  test('should render trend up icon', () => {
    const {element} = render(<TaskTrend name="up" />);

    expect(element).toHaveAttribute('title', 'Severity increased');
  });

  test('should render trend down icon', () => {
    const {element} = render(<TaskTrend name="down" />);

    expect(element).toHaveAttribute('title', 'Severity decreased');
  });

  test('should render trend less icon', () => {
    const {element} = render(<TaskTrend name="less" />);

    expect(element).toHaveAttribute('title', 'Vulnerability count decreased');
  });

  test('should render trend more icon', () => {
    const {element} = render(<TaskTrend name="more" />);

    expect(element).toHaveAttribute('title', 'Vulnerability count increased');
  });

  test('should render trend no change icon', () => {
    const {element} = render(<TaskTrend name="same" />);

    expect(element).toHaveAttribute('title', 'Vulnerabilities did not change');
  });
});
