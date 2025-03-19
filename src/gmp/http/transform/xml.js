/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Rejection from 'gmp/http//rejection';
import {_} from 'gmp/locale/lang';
import {isDefined} from 'gmp/utils/identity';

export const success =
  transform =>
  (response, options = {}) => {
    try {
      return transform(response);
    } catch (error) {
      throw new Rejection(
        response.xhr,
        Rejection.REASON_ERROR,
        _(
          'An error occurred while converting gmp response to js for ' +
            'url {{- url}}',
          {url: options.url},
        ),
        error,
      );
    }
  };

export const rejection = transform => rej => {
  if (rej.isError && rej.isError()) {
    const data = transform(rej);
    if (!isDefined(data)) {
      return rej;
    }

    const {envelope} = data;
    if (isDefined(envelope)) {
      rej.root = envelope;

      if (isDefined(envelope.gsad_response)) {
        return rej.setMessage(envelope.gsad_response.message);
      }

      if (isDefined(envelope.action_result)) {
        return rej.setMessage(envelope.action_result.message);
      }
    }

    return rej;
  }

  return rej;
};
