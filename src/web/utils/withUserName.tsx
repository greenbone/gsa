/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import useUserName from 'web/hooks/useUserName';
import {updateDisplayName} from 'web/utils/display-name';

export interface WithUserNameComponentProps {
  username?: string;
}

const withUserName = <TProps extends WithUserNameComponentProps>(
  Component: React.ComponentType<TProps>,
) => {
  const WrappedComponent = (
    props: Omit<TProps, keyof WithUserNameComponentProps>,
  ) => {
    const username = useUserName();
    return <Component {...(props as TProps)} username={username} />;
  };

  return updateDisplayName(WrappedComponent, Component, 'withUserName');
};

export default withUserName;
