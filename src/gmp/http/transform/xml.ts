/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Rejection from 'gmp/http//rejection';
import {type default as Response, type Meta} from 'gmp/http/response';
import {
  type TransformOptions,
  type TransformSuccess,
} from 'gmp/http/transform/transform';
import {_} from 'gmp/locale/lang';
import {isDefined} from 'gmp/utils/identity';

interface Envelope {
  gsad_response?: {
    message: string;
  };
  action_result?: {
    message: string;
  };
}

interface RejectionData {
  envelope?: Envelope;
}

type SuccessTransformFunc<
  TDataIn,
  TMetaIn extends Meta,
  TDataOut = TDataIn,
  TMetaOut extends Meta = TMetaIn,
> = (response: Response<TDataIn, TMetaIn>) => Response<TDataOut, TMetaOut>;

type RejectionTransformFunc = (rejection: Rejection) => RejectionData;

export const success =
  <
    TDataIn,
    TMetaIn extends Meta,
    TDataOut = TDataIn,
    TMetaOut extends Meta = TMetaIn,
  >(
    transform: SuccessTransformFunc<TDataIn, TMetaIn, TDataOut, TMetaOut>,
  ): TransformSuccess<TDataIn, TMetaIn, TDataOut, TMetaOut> =>
  (
    response: Response<TDataIn, TMetaIn>,
    options: TransformOptions = {},
  ): Response<TDataOut, TMetaOut> => {
    try {
      return transform(response);
    } catch (error) {
      throw new Rejection(
        response._xhr,
        Rejection.REASON_ERROR,
        _(
          'An error occurred while converting gmp response to js for ' +
            'url {{- url}}',
          {url: options.url as string},
        ),
        error as Error,
      );
    }
  };

export const rejection =
  (transform: RejectionTransformFunc) => (rej: Rejection) => {
    if (rej.isError && rej.isError()) {
      const data = transform(rej);
      if (!isDefined(data)) {
        return rej;
      }

      const {envelope} = data;
      if (isDefined(envelope)) {
        // this root is not defined in the Rejection class
        // but seems to be used at several places
        // we should definitively remove this in the future
        // @ts-expect-error
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
