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
  onTagChanged,
}) => (
  <Layout flex="column">
    <ScanInfo
      report={report}
    />
    <TagsHandler
      onError={onError}
      onChanged={onTagChanged}
      resourceType="report"
    >
      {({
        add,
        create,
        delete: delete_func,
        disable,
        enable,
        edit,
      }) => (
        <EntityTags
          entity={report}
          onTagAddClick={add}
          onTagCreateClick={create}
          onTagDeleteClick={delete_func}
          onTagDisableClick={disable}
          onTagEditClick={edit}
          onTagEndableClick={enable}
        />
      )}
    </TagsHandler>
  </Layout>
);

Summary.propTypes = {
  report: PropTypes.model.isRequired,
  onError: PropTypes.func.isRequired,
  onTagChanged: PropTypes.func.isRequired,
};

export default Summary;

// vim: set ts=2 sw=2 tw=80:
