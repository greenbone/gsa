/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import PropTypes from 'web/utils/proptypes';

import useGmp from 'web/hooks/useGmp';

import BlankLink from './blanklink';

const ProtocolDocLink = ({title}) => {
  const gmp = useGmp();
  const {protocolDocUrl} = gmp.settings;

  return (
    <BlankLink to={protocolDocUrl} title={title}>
      {title}
    </BlankLink>
  );
};

ProtocolDocLink.propTypes = {
  title: PropTypes.string.isRequired,
};

export default ProtocolDocLink;
