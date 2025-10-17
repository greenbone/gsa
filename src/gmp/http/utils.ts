/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {hasValue, isDefined} from 'gmp/utils/identity';

export type UrlParamValue = string | number | boolean | undefined;
export type UrlParams = Record<string, UrlParamValue>;

export type DataValue = string | number | boolean | Blob | undefined;
export type Data = Record<string, DataValue | string[] | number[] | boolean[]>;

export const buildUrlParams = (params: UrlParams): string => {
  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (isDefined(value)) {
      urlParams.append(key, String(value));
    }
  }
  return String(urlParams);
};

export const buildServerUrl = (
  server: string,
  path: string = '',
  protocol?: string,
) => {
  if (isDefined(protocol)) {
    if (!protocol.endsWith(':')) {
      protocol += ':';
    }
  } else {
    protocol = window.location.protocol;
  }
  return protocol + '//' + server + '/' + path;
};

const isBlob = (value: unknown): value is Blob => value instanceof Blob;

export const formdataAppend = (
  formdata: FormData,
  key: string,
  value: DataValue | null,
) => {
  if (hasValue(value)) {
    formdata.append(key, isBlob(value) ? value : String(value));
  }
};
