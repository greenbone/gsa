/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {DownloadFunc} from 'web/components/form/useDownload';
import withDownload from 'web/components/form/withDownload';
import {screen, render, fireEvent} from 'web/testing';

interface TestComponentProps {
  onDownload?: DownloadFunc;
  filename: string;
  data: string;
}

const TestComponent = withDownload<TestComponentProps>(
  ({onDownload, filename, data}) => (
    <button data-testid="button" onClick={() => onDownload({filename, data})} />
  ),
);

const createObjectURL = testing.fn().mockReturnValue('foo://bar');
window.URL.createObjectURL = createObjectURL;
window.URL.revokeObjectURL = testing.fn();

describe('withDownload tests', () => {
  test('should render', () => {
    const {rerender} = render(<TestComponent data="bar" filename="foo" />);

    // rerender to set reference to Download component
    rerender(<TestComponent data="bar" filename="foo" />);

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    expect(createObjectURL).toHaveBeenCalled();
  });
});
