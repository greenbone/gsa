/* Copyright (C) 2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React, {useState} from 'react';

import Button from 'web/components/form/button';

import {rendererWith, fireEvent, wait, screen} from 'web/utils/testing';

import {
  useCreateTarget,
  useModifyTarget,
  CREATE_TARGET,
  MODIFY_TARGET,
} from '../targets';

const createTargetInput = {
  name: 'foo',
  hosts: 'lorem, ipsum',
};

const modifyTargetInput = {
  id: '12345',
  name: 'bar',
};

const createTargetResult = jest.fn().mockReturnValue({
  data: {
    createTarget: {
      id: '12345',
      status: 200,
    },
  },
});

const modifyTargetResult = jest.fn().mockReturnValue({
  data: {
    modifyTarget: {
      ok: true,
    },
  },
});

const createTargetMock = {
  request: {
    query: CREATE_TARGET,
    variables: {input: createTargetInput},
  },
  newData: createTargetResult,
};

const modifyTargetMock = {
  request: {
    query: MODIFY_TARGET,
    variables: {input: modifyTargetInput},
  },
  newData: modifyTargetResult,
};

const TestComponent = () => {
  const [notification, setNotification] = useState('');

  const [createTarget] = useCreateTarget();
  const [modifyTarget] = useModifyTarget();

  const handleCreateResult = resp => {
    const {data} = resp;
    setNotification(
      `Target created with id ${data.createTarget.id} and status ${data.createTarget.status}.`,
    );
  };

  const handleModifyResult = resp => {
    const {data} = resp;
    setNotification(`Target modified with ok=${data.modifyTarget.ok}.`);
  };

  return (
    <div>
      <Button
        title={'Create target'}
        onClick={() => createTarget(createTargetInput).then(handleCreateResult)}
      />
      <Button
        title={'Modify target'}
        onClick={() => modifyTarget(modifyTargetInput).then(handleModifyResult)}
      />
      <h3 data-testid="notification">{notification}</h3>
    </div>
  );
};

describe('Target mutation tests', () => {
  test('should create a target', async () => {
    const {render} = rendererWith({queryMocks: [createTargetMock]});

    const {element} = render(<TestComponent />);

    const buttons = element.querySelectorAll('button');

    fireEvent.click(buttons[0]);

    await wait();

    expect(createTargetResult).toHaveBeenCalled();
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Target created with id 12345 and status 200.',
    );
  });

  test('should modify a target', async () => {
    const {render} = rendererWith({queryMocks: [modifyTargetMock]});

    const {element} = render(<TestComponent />);

    const buttons = element.querySelectorAll('button');

    fireEvent.click(buttons[1]);

    await wait();

    expect(modifyTargetResult).toHaveBeenCalled();
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Target modified with ok=true.',
    );
  });
});
