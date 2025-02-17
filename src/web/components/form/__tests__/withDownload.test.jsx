/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, fireEvent} from 'web/utils/testing';

import withDownload from '../withDownload';

const TestComponent = withDownload(({onDownload, filename, data}) => (
  <button data-testid="button" onClick={() => onDownload({filename, data})} />
));

const createObjectURL = testing.fn().mockReturnValue('foo://bar');
window.URL.createObjectURL = createObjectURL;
window.URL.revokeObjectURL = testing.fn();

describe('withDownload tests', () => {
  test('should render', () => {
    const {rerender, getByTestId} = render(
      <TestComponent data="bar" filename="foo" />,
    );

    // rerender to set reference to Download component
    rerender(<TestComponent data="bar" filename="foo" />);

    const button = getByTestId('button');
    fireEvent.click(button);

    expect(createObjectURL).toHaveBeenCalled();
  });
});
