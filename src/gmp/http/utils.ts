/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {hasValue, isArray, isDefined} from 'gmp/utils/identity';

export type UrlParamValue = string | number | boolean | undefined;
export type UrlParams = Record<string, UrlParamValue>;

export type DataValue = string | number | boolean | Blob | undefined | null;
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

export const formDataAppend = (
  formData: FormData,
  key: string,
  value: DataValue,
) => {
  if (hasValue(value)) {
    formData.append(key, isBlob(value) ? value : String(value));
  }
};

export const createFormData = (data: Data) => {
  const formdata = new FormData();

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];
      if (isArray(value)) {
        for (const val of value) {
          formDataAppend(formdata, key, val);
        }
      } else {
        formDataAppend(formdata, key, value);
      }
    }
  }

  return formdata;
};
