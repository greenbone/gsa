/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

export const withRouter = Component => {
  function ComponentWithRouterProp(props) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    const [searchParams] = useSearchParams();

    return (
      <Component
        {...props}
        location={location}
        navigate={navigate}
        params={params}
        searchParams={searchParams}
      />
    );
  }

  return ComponentWithRouterProp;
};
