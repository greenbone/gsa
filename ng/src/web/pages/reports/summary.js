/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import React from 'react';

import EntityTags from '../../entity/tags.js';

import PropTypes from '../../utils/proptypes.js';

import Layout from '../../components/layout/layout.js';

import TagsHandler from '../../entity/tagshandler.js';

import ScanInfo from './scaninfo.js';

const Summary = ({
  report,
  onError,
  onSuccess,
  ...props
}) => (
  <Layout flex="column">
    <ScanInfo
      report={report}
    />
    <TagsHandler
      onError={onError}
      onSuccess={onSuccess}
      resourceType="report"
    >
      {tprops => (
        <EntityTags
          {...props}
          {...tprops}
          entity={report}
        />
      )}
    </TagsHandler>
  </Layout>
);

Summary.propTypes = {
  report: PropTypes.model.isRequired,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default Summary;

// vim: set ts=2 sw=2 tw=80:
