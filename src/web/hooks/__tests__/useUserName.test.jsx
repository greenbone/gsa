/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {setUsername} from 'web/store/usersettings/actions';
import {rendererWith, fireEvent} from 'web/utils/testing';

import useUserName from '../useUserName';

const TestUserName = () => <span>{useUserName()[0]}</span>;

const TestUserName2 = () => {
  const [name, setUserName] = useUserName();
  return <span onClick={() => setUserName('bar')}>{name}</span>;
};

describe('useUserName tests', () => {
  test('should return the users name', () => {
    const {render, store} = rendererWith({store: true});

    store.dispatch(setUsername('foo'));

    const {element} = render(<TestUserName />);

    expect(element).toHaveTextContent(/^foo$/);
  });

  test('should allow to change the user name', () => {
    const {render, store} = rendererWith({store: true});

    store.dispatch(setUsername('foo'));

    const {element} = render(<TestUserName2 />);

    expect(element).toHaveTextContent(/^foo$/);

    fireEvent.click(element);

    expect(element).toHaveTextContent(/^bar$/);
  });
});
