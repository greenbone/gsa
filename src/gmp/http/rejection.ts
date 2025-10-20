/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';

class Rejection extends Error {
  readonly error?: Error;

  constructor(message: string = _('Unknown Error'), error?: Error | undefined) {
    super(message);
    this.name = 'Rejection';
    this.error = error;
  }

  setMessage(message: string) {
    this.message = message;
    return this;
  }
}

export class CanceledRejection extends Rejection {
  constructor(message?: string) {
    super(message ?? _('Request canceled'));
    this.name = 'CanceledRejection';
  }
}

export class TimeoutRejection extends Rejection {
  constructor(message?: string) {
    super(message ?? _('Request timed out'));
    this.name = 'TimeoutRejection';
  }
}

export class RequestRejection extends Rejection {
  readonly request?: XMLHttpRequest;

  constructor(request?: XMLHttpRequest, message?: string) {
    super(message ?? _('Request failed'));
    this.name = 'RequestRejection';
    this.request = request;
  }
}

export class ResponseRejection extends Rejection {
  readonly status?: number;
  readonly request: XMLHttpRequest;

  constructor(request: XMLHttpRequest, message?: string) {
    super(message ?? _('Response error'));
    this.name = 'ResponseRejection';
    this.request = request;
    this.status = request.status;
  }

  get data(): string | undefined {
    return this.request.responseText;
  }
}

export default Rejection;
