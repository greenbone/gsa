/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {test, expect, testing} from '@gsa/testing';
import {isDefined} from 'gmp/utils/identity';
import {ICON_SIZE_SMALL_PIXELS} from 'web/hooks/useIconSize';
import {render, fireEvent, act} from 'web/utils/Testing';
import Theme from 'web/utils/Theme';

export const testIcon = (Icon, {dataTestId, customDataTestId} = {}) => {
  test('should render with default width and height', () => {
    const {element} = render(<Icon />);

    expect(element).toHaveStyleRule('width', ICON_SIZE_SMALL_PIXELS);
    expect(element).toHaveStyleRule('height', ICON_SIZE_SMALL_PIXELS);
  });

  test('should handle click', () => {
    const handler = testing.fn();
    const {element} = render(<Icon value="1" onClick={handler} />);

    fireEvent.click(element);

    expect(handler).toHaveBeenCalledWith('1');
  });
  test('should change appearance when disabled', () => {
    const {element} = render(<Icon disabled={true} />);

    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: 'svg path.gui_icon_class',
    });
    expect(element).toHaveStyleRule('color', Theme.inputBorderGray);
  });

  test('should change appearance when inactive', () => {
    const {element} = render(<Icon active={false} />);

    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: 'svg path.gui_icon_class',
    });
    expect(element).toHaveStyleRule('color', Theme.inputBorderGray);
  });

  test('should not call clickhandler when disabled', () => {
    const handler = testing.fn();
    const {element} = render(<Icon disabled={true} onClick={handler} />);

    fireEvent.click(element);

    expect(handler).not.toHaveBeenCalled();
  });

  test('should render loading state', async () => {
    let resolve;
    const promise = new Promise((res, rej) => {
      resolve = res;
    });

    const handler = testing.fn().mockReturnValue(promise);

    const {element} = render(
      <Icon loadingTitle="bar" title="foo" onClick={handler} />,
    );

    const svgElement = element.querySelector('svg');

    expect(element).toHaveAttribute('title', 'foo');
    expect(svgElement).toHaveAttribute('title', 'foo');

    fireEvent.click(element);

    expect(element).toHaveStyleRule('display', 'none', {
      modifier: '& svg path',
    });
    expect(element).toHaveStyleRule(
      'background',
      'url(/img/loading.gif) center center no-repeat',
      {
        modifier: '& svg',
      },
    );

    expect(element).toHaveAttribute('title', 'bar');
    expect(svgElement).toHaveAttribute('title', 'bar');

    await act(async () => {
      resolve();
    });

    expect(element).toHaveAttribute('title', 'foo');
    expect(svgElement).toHaveAttribute('title', 'foo');
  });

  if (isDefined(dataTestId)) {
    test('should render with default data-testid', () => {
      const {element} = render(<Icon />);

      expect(element).toHaveAttribute('data-testid', dataTestId);
    });
  }

  if (isDefined(customDataTestId)) {
    test('should render with custom data-testid', () => {
      const {element} = render(<Icon data-testid={customDataTestId} />);

      expect(element).toHaveAttribute('data-testid', customDataTestId);
    });
  }
};
