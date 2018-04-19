/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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

import PropTypes from '../../../utils/proptypes';

import Loader, {loadFunc} from '../../../components/dashboard2/data/loader';

const loaderPropTypes = {
  children: PropTypes.func,
  filter: PropTypes.filter,
};

export const NVT_FAMILY = 'nvt-family';
export const NVT_SEVERITY_CLASS = 'nvt-severity-class';
export const NVT_QOD = 'nvt-qod';
export const NVT_QOD_TYPE = 'nvt-qod-type';

export const nvtFamilyLoader = loadFunc(
  ({gmp, filter}) => gmp.nvts.getFamilyAggregates({filter})
    .then(r => r.data),
  NVT_FAMILY);

export const NvtsFamilyLoader = ({
  filter,
  children,
}) => (
  <Loader
    dataId={NVT_FAMILY}
    filter={filter}
    load={nvtFamilyLoader}
    subscriptions={[
      'nvts.timer',
      'nvts.changed',
    ]}
  >
    {children}
  </Loader>
);

NvtsFamilyLoader.propTypes = loaderPropTypes;

export const nvtSeverityLoader = loadFunc(
  ({gmp, filter}) => gmp.nvts.getSeverityAggregates({filter})
    .then(r => r.data),
  NVT_SEVERITY_CLASS);

export const NvtsSeverityLoader = ({
  filter,
  children,
}) => (
  <Loader
    dataId={NVT_SEVERITY_CLASS}
    filter={filter}
    load={nvtSeverityLoader}
    subscriptions={[
      'nvts.timer',
      'nvts.changed',
    ]}
  >
    {children}
  </Loader>
);

NvtsSeverityLoader.propTypes = loaderPropTypes;

export const nvtQodLoader = loadFunc(
  ({gmp, filter}) => gmp.nvts.getQodAggregates({filter})
    .then(r => r.data),
  NVT_QOD);

export const NvtsQodLoader = ({
  filter,
  children,
}) => (
  <Loader
    dataId={NVT_QOD}
    filter={filter}
    load={nvtQodLoader}
    subscriptions={[
      'nvts.timer',
      'nvts.changed',
    ]}
  >
    {children}
  </Loader>
);

NvtsQodLoader.propTypes = loaderPropTypes;

export const nvtQodTypeLoader = loadFunc(
  ({gmp, filter}) => gmp.nvts.getQodTypeAggregates({filter})
    .then(r => r.data),
  NVT_QOD_TYPE);

export const NvtsQodTypeLoader = ({
  filter,
  children,
}) => (
  <Loader
    dataId={NVT_QOD_TYPE}
    filter={filter}
    load={nvtQodTypeLoader}
    subscriptions={[
      'nvts.timer',
      'nvts.changed',
    ]}
  >
    {children}
  </Loader>
);

NvtsQodTypeLoader.propTypes = loaderPropTypes;

// vim: set ts=2 sw=2 tw=80:
