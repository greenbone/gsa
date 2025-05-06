/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Layout from 'web/components/layout/Layout';
import Identifiers from 'web/pages/hosts/Identifiers';
import PropTypes from 'web/utils/PropTypes';

const HostDetails = ({entity, onHostIdentifierDeleteClick}) => {
  const {identifiers} = entity;
  return (
    <Layout flex="column" grow="1">
      <Identifiers
        displayActions
        identifiers={identifiers}
        onDelete={onHostIdentifierDeleteClick}
      />
    </Layout>
  );
};

HostDetails.propTypes = {
  entity: PropTypes.model.isRequired,
  onHostIdentifierDeleteClick: PropTypes.func,
};

export default HostDetails;
