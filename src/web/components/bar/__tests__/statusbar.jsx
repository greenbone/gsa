/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {render} from 'web/utils/testing';

import Theme from 'web/utils/theme';

import StatusBar from '../statusbar';

import {TASK_STATUS} from 'gmp/models/task';

describe('StatusBar tests', () => {
  test('should render', () => {
    const {element} = render(<StatusBar progress="90" status="Unknown" />);

    expect(element).toMatchSnapshot();
  });

  test('should render text content', () => {
    const {element} = render(
      <StatusBar progress="90" status={TASK_STATUS.stopped} />,
    );
    expect(element).toHaveTextContent('Stopped at 90 %');
  });

  test('should render title', () => {
    const {getByTestId} = render(
      <StatusBar progress="90" status={TASK_STATUS.stopped} />,
    );
    const progressbarBox = getByTestId('progressbar-box');

    expect(progressbarBox).toHaveAttribute('title', 'Stopped');
  });

  test('should render progress', () => {
    const {getByTestId} = render(
      <StatusBar progress="90" status={TASK_STATUS.stopped} />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('width', '90%');
  });

  test('should not render progress > 100', () => {
    const {element, getByTestId} = render(
      <StatusBar progress="101" status={TASK_STATUS.stopped} />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('width', '100%');
    expect(element).toHaveTextContent('Stopped at 100 %');
  });

  test('should not render progress < 0', () => {
    const {element, getByTestId} = render(
      <StatusBar progress="-1" status={TASK_STATUS.stopped} />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('width', '0%');
    expect(element).toHaveTextContent('Stopped at 0 %');
  });

  test('should render background', () => {
    const {getByTestId} = render(
      <StatusBar progress="90" status={TASK_STATUS.stopped} />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('background', Theme.severityWarnYellow);
  });
});

// vim: set ts=2 sw=2 tw=80:
