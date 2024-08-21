/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/* eslint-disable react/prop-types */

import {describe, test, expect, testing} from '@gsa/testing';

import {fireEvent, render, screen} from 'web/utils/testing';

import useDownload from '../useDownload';
import Download from '../download';

const TestComponent = () => {
  const [ref, download] = useDownload();
  return (
    <>
      <Download ref={ref} />
      <button
        data-testid="download"
        onClick={() => download({filename: 'foo', data: 'bar'})}
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
