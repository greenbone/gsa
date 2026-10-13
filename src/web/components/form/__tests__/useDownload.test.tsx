/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, render, screen} from 'web/testing';
import useDownload from 'web/components/form/useDownload';

const TestComponent = () => {
  const {downloadComponent, download} = useDownload();
  return (
    <>
      {downloadComponent}
      <button
        data-testid="download"
        onClick={() =>
          download({filename: 'foo', data: 'bar', mimetype: 'text/plain'})
        }
      />
    </>
  );
};

describe('useDownload', () => {
  test('should download a file', () => {
    const createObjectURL = testing.fn().mockReturnValue('foo://bar');
    window.URL.createObjectURL = createObjectURL;
    window.URL.revokeObjectURL = testing.fn();

    render(<TestComponent />);

    fireEvent.click(screen.getByTestId('download'));

    expect(createObjectURL).toHaveBeenCalled();
  });
});
