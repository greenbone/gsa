/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import PropTypes from 'prop-types';
import {Navigate} from 'react-router';
import useFeatures from 'web/hooks/useFeatures';

const ConditionalRoute = ({component: Component, feature, ...rest}) => {
  const features = useFeatures();
  const isEnabled = features.featureEnabled(feature);

  return (
    <>{isEnabled ? <Component {...rest} /> : <Navigate to="/notfound" />}</>
  );
};

ConditionalRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
  feature: PropTypes.string.isRequired,
};

export default ConditionalRoute;
