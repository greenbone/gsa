/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router';
import {updateDisplayName} from 'web/utils/display-name';

export interface WithRouterComponentProps {
  location: ReturnType<typeof useLocation>;
  navigate: ReturnType<typeof useNavigate>;
  params: ReturnType<typeof useParams>;
  searchParams: ReturnType<typeof useSearchParams>[0];
}

type WithRouterProps<TProps> = Omit<TProps, keyof WithRouterComponentProps>;

const withRouter = <TProps extends WithRouterComponentProps>(
  Component: React.ComponentType<TProps>,
) => {
  function ComponentWithRouterProp(props: WithRouterProps<TProps>) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    const [searchParams] = useSearchParams();

    return (
      <Component
        {...(props as TProps)}
        location={location}
        navigate={navigate}
        params={params}
        searchParams={searchParams}
      />
    );
  }

  return updateDisplayName(ComponentWithRouterProp, Component, 'withRouter');
};

export default withRouter;
