/* Copyright (C) 2020-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
/* eslint-disable react/prop-types */

import React, {useState} from 'react';

import {setLocale} from 'gmp/locale/lang';

import {rendererWith, fireEvent, wait, screen} from 'web/utils/testing';

import useExportEntity from 'web/entity/useExportEntity';

setLocale('en');

const entity = {id: 'foo'};

jest.mock('web/utils/render', () => ({
  ...jest.requireActual('web/utils/render'),
  generateFilename: () => 'foo-20201113.xml',
}));

let exportFunc;
let onDownload;
let onError;

beforeEach(() => {
  onDownload = jest.fn();
  onError = jest.fn();

  exportFunc = jest.fn().mockResolvedValue({
    data: {
      exportIpsumByIds: {
        exportedEntities: '<get_entities_response />',
      },
    },
  });
});

const ExportEntityComponent = () => {
  const [message, setMessage] = useState('Not called');

  const exportEntity = useExportEntity();

  const handleDownloadEntity = () => {
    return exportEntity({
      entity,
      resourceType: 'ipsum',
      exportFunc,
      onDownload,
      onError,
    });
  };

  return (
    <div>
      <button
        data-testid="load"
        onClick={() =>
          handleDownloadEntity().then(setMessage('Bulk export called!'))
        }
      />
      <span data-testid="message">{message}</span>
    </div>
  );
};

describe('useBulkExportEntities tests', () => {
  test('should call export on user interaction', async () => {
    const {render} = rendererWith({store: true});

    const {getByTestId} = render(<ExportEntityComponent />);

    const message = getByTestId('message');

    expect(message).toHaveTextContent('Not called');

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    await wait();

    expect(exportFunc).toHaveBeenCalledWith(['foo']);
    expect(onDownload).toHaveBeenCalledWith({
      data: '<get_entities_response />',
      filename: 'foo-20201113.xml',
    });
    expect(message).toHaveTextContent('Bulk export called!');
  });
});
