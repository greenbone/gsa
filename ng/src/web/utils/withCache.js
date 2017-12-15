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
import 'core-js/fn/object/entries';

import React from 'react';

import {is_object} from 'gmp/utils.js';

import PropTypes from './proptypes.js';

export const withCache = names => Component => {
  const CacheWrapper = (props, {cache, caches}) => {
    const cache_props = {cache};

    if (is_object(names)) {
      for (const [key, value] of Object.entries(names)) {
        cache_props[key] = caches.get(value);
      }
    }
    return (
      <Component {...cache_props} {...props} />
    );
  };

  CacheWrapper.contextTypes = {
    cache: PropTypes.cache,
    caches: PropTypes.cachefactory.isRequired,
  };

  return CacheWrapper;
};

export default withCache;

// vim: set ts=2 sw=2 tw=80:
