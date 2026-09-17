/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type CreatedData} from 'web/components/dashboard/display/created/created-transform';
import Loader, {
  createLoadFunc,
  type DisplayLoaderProps,
} from 'web/components/dashboard/display/Loader';
import {type SeverityData} from 'web/components/dashboard/display/severity/severity-class-transform';

export const NVTS_FAMILY = 'nvt-family';
export const NVTS_SEVERITY = 'nvt-severity';
export const NVTS_QOD = 'nvt-qod';
export const NVTS_QOD_TYPE = 'nvt-qod-type';
export const NVTS_CREATED = 'nvt-created';

interface NvtFamilyGroup {
  count: number;
  value: string;
  stats: {
    severity: {
      mean: number;
    };
  };
}

export interface NvtFamilyData {
  groups?: NvtFamilyGroup[];
}

interface NvtQodGroup {
  count: number;
  value: string;
}

export interface NvtQodData {
  groups?: NvtQodGroup[];
}

const nvtFamilyLoadFunc = createLoadFunc(
  ({gmp, filter}) => gmp.nvts.getFamilyAggregates({filter}).then(r => r.data),
  NVTS_FAMILY,
);

export const NvtsFamilyLoader = ({
  filter,
  children,
}: DisplayLoaderProps<NvtFamilyData>) => (
  <Loader
    dataId={NVTS_FAMILY}
    filter={filter}
    load={nvtFamilyLoadFunc}
    subscriptions={['nvts.timer', 'nvts.changed']}
  >
    {children}
  </Loader>
);

const nvtSeverityLoaderFunc = createLoadFunc(
  ({gmp, filter}) => gmp.nvts.getSeverityAggregates({filter}).then(r => r.data),
  NVTS_SEVERITY,
);

export const NvtsSeverityLoader = ({
  filter,
  children,
}: DisplayLoaderProps<SeverityData>) => (
  <Loader
    dataId={NVTS_SEVERITY}
    filter={filter}
    load={nvtSeverityLoaderFunc}
    subscriptions={['nvts.timer', 'nvts.changed']}
  >
    {children}
  </Loader>
);

const nvtQodLoaderFunc = createLoadFunc(
  ({gmp, filter}) => gmp.nvts.getQodAggregates({filter}).then(r => r.data),
  NVTS_QOD,
);

export const NvtsQodLoader = ({
  filter,
  children,
}: DisplayLoaderProps<NvtQodData>) => (
  <Loader
    dataId={NVTS_QOD}
    filter={filter}
    load={nvtQodLoaderFunc}
    subscriptions={['nvts.timer', 'nvts.changed']}
  >
    {children}
  </Loader>
);

const nvtQodTypeLoadFunc = createLoadFunc(
  ({gmp, filter}) => gmp.nvts.getQodTypeAggregates({filter}).then(r => r.data),
  NVTS_QOD_TYPE,
);

export const NvtsQodTypeLoader = ({
  filter,
  children,
}: DisplayLoaderProps<NvtQodData>) => (
  <Loader
    dataId={NVTS_QOD_TYPE}
    filter={filter}
    load={nvtQodTypeLoadFunc}
    subscriptions={['nvts.timer', 'nvts.changed']}
  >
    {children}
  </Loader>
);

const nvtCreatedLoadFunc = createLoadFunc(
  ({gmp, filter}) => gmp.nvts.getCreatedAggregates({filter}).then(r => r.data),
  NVTS_CREATED,
);

export const NvtCreatedLoader = ({
  filter,
  children,
}: DisplayLoaderProps<CreatedData>) => (
  <Loader
    dataId={NVTS_CREATED}
    filter={filter}
    load={nvtCreatedLoadFunc}
    subscriptions={['nvts.timer', 'nvts.changed']}
  >
    {children}
  </Loader>
);
