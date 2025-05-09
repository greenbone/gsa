/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import BlankLink from 'web/components/link/BlankLink';
import useGmp from 'web/hooks/useGmp';
import PropTypes from 'web/utils/PropTypes';

const ProtocolDocLink = ({title}) => {
  const gmp = useGmp();
  const {protocolDocUrl} = gmp.settings;

  return (
    <BlankLink title={title} to={protocolDocUrl}>
      {title}
    </BlankLink>
  );
};

ProtocolDocLink.propTypes = {
  title: PropTypes.string.isRequired,
};

export default ProtocolDocLink;
