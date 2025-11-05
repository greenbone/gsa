/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {type ModelElement, type ModelProperties} from 'gmp/models/model';
import {Param, type ParamElement} from 'gmp/models/reportformat';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

interface ReportConfigElement extends ModelElement {
  alerts?: {
    alert?: ModelElement | ModelElement[];
  };
  param?: ParamElement | ParamElement[];
  report_format?: {
    _id?: string;
    name?: string;
  };
}

interface ReportConfigReportFormat {
  id?: string;
  name?: string;
}

interface ReportConfigProperties extends ModelProperties {
  alerts?: Model[];
  params?: Param[];
  reportFormat?: ReportConfigReportFormat;
}

class ReportConfig extends Model {
  static readonly entityType = 'reportconfig';

  readonly alerts: Model[];
  readonly params: Param[];
  readonly reportFormat?: ReportConfigReportFormat;

  constructor({
    alerts = [],
    params = [],
    reportFormat,
    ...properties
  }: ReportConfigProperties = {}) {
    super(properties, ReportConfig.entityType);

    this.alerts = alerts;
    this.params = params;
    this.reportFormat = reportFormat;
  }

  static fromElement(element?: ReportConfigElement): ReportConfig {
    return new ReportConfig(this.parseElement(element));
  }

  static parseElement(
    element: ReportConfigElement = {},
  ): ReportConfigProperties {
    const ret = super.parseElement(element) as ReportConfigProperties;

    if (isDefined(element.report_format)) {
      ret.reportFormat = {
        id: element.report_format._id,
        name: element.report_format.name,
      };
    }

    ret.params = map(element.param, param => new Param(param));

    ret.alerts = map(element.alerts?.alert, alert =>
      Model.fromElement(alert, 'alert'),
    );

    return ret;
  }
}

export default ReportConfig;
