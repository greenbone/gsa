/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {TASK_STATUS} from 'gmp/models/task';
import StatusBar from 'web/components/bar/StatusBar';
import {render} from 'web/utils/Testing';
import Theme from 'web/utils/Theme';


describe('StatusBar tests', () => {
  test('should render', () => {
    const {element} = render(<StatusBar progress="90" status="Unknown" />);

    expect(element).toBeVisible();
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

    expect(progress).toHaveStyleRule(
      'background',
      `linear-gradient(90deg, ${Theme.severityWarnYellow} 0%, ${Theme.severityWarnYellow} 100%)`,
    );
  });
});
