/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import PropTypes from 'prop-types';

import {Route, Redirect} from 'react-router-dom';
import useCapabilities from 'web/hooks/useCapabilities';

const ConditionalRoute = ({component: Component, feature, ...rest}) => {
  const capabilities = useCapabilities();
  const isEnabled = capabilities.featureEnabled(feature);

  return (
    <Route
      render={props =>
        isEnabled ? <Component {...props} /> : <Redirect to="/notfound" />
      }
      {...rest}
    />
  );
};

ConditionalRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
  feature: PropTypes.string.isRequired,
};

export default ConditionalRoute;
