/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import HttpCommand from 'gmp/commands/http';
import GmpHttp from 'gmp/http/gmp';
import {XmlResponseData} from 'gmp/http/transform/fastxml';
import date, {Date} from 'gmp/models/date';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

interface SystemReportDetailsData {
  _format: string;
  _start_time?: string;
  _end_time?: string;
  _duration?: number;
  __text: string;
}

interface SystemReportData {
  name: string;
  title: string;
  report?: SystemReportDetailsData;
}

interface GetSystemReportsResponseData extends XmlResponseData {
  get_system_reports?: {
    get_system_reports_response?: {
      system_report?: SystemReportData | SystemReportData[];
    };
  };
}

interface GetSystemReportResponseData extends XmlResponseData {
  get_system_report?: {
    get_system_reports_response?: {
      system_report?: SystemReportData;
    };
  };
}

interface GetPerformanceReportArguments {
  name: string;
  duration?: number;
  endDate?: Date;
  startDate?: Date;
  sensorId?: string;
}

interface PerformanceReportDetailsArguments {
  format: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  text: string;
}

export const DEFAULT_SENSOR_ID = '0';

class PerformanceReportDetails {
  readonly format: string;
  readonly startTime?: Date;
  readonly endTime?: Date;
  readonly duration?: number;
  readonly text: string;

  constructor({
    format,
    startTime,
    endTime,
    duration,
    text,
  }: PerformanceReportDetailsArguments) {
    this.format = format;
    this.startTime = startTime ? date(startTime) : undefined;
    this.endTime = endTime ? date(endTime) : undefined;
    this.duration = duration;
    this.text = text;
  }
}

export class PerformanceReport {
  readonly name: string;
  readonly title: string;
  readonly details?: PerformanceReportDetails;

  constructor({name, title, report}: SystemReportData) {
    this.name = name;
    this.title = title;
    this.details = isDefined(report)
      ? new PerformanceReportDetails({
          format: report._format,
          startTime: report._start_time,
          endTime: report._end_time,
          duration: report._duration,
          text: report.__text,
        })
      : undefined;
  }
}

class PerformanceCommand extends HttpCommand {
  constructor(http: GmpHttp) {
    super(http, {cmd: 'get_system_reports'});
  }

  async getAll({sensorId = DEFAULT_SENSOR_ID} = {}) {
    const response = await this.httpGet({
      slave_id: sensorId,
    });
    const {get_system_reports: sys_reports = {}} =
      response.data as GetSystemReportsResponseData;
    const {get_system_reports_response: sys_response = {}} = sys_reports;
    const {system_report: reports} = sys_response;
    if (!isDefined(reports)) {
      throw new Error('Invalid response data for system reports');
    }
    return response.setData<PerformanceReport[]>(
      map(reports, report => new PerformanceReport(report)),
    );
  }

  async get({
    name,
    duration,
    startDate,
    endDate,
    sensorId = DEFAULT_SENSOR_ID,
  }: GetPerformanceReportArguments) {
    const params: Record<string, string> = {
      cmd: 'get_system_report',
      slave_id: sensorId,
      name,
    };
    if (isDefined(duration)) {
      params.duration = String(duration);
    } else if (isDefined(startDate) && isDefined(endDate)) {
      params.start_time = startDate.format('YYYY-MM-DDTHH:mm:ssZ');
      params.end_time = endDate.format('YYYY-MM-DDTHH:mm:ssZ');
    }
    const response = await this.httpGet(params);
    const data = response.data as GetSystemReportResponseData;
    const report =
      data?.get_system_report?.get_system_reports_response?.system_report;
    if (!isDefined(report)) {
      throw new Error('Invalid response data for system report');
    }
    return response.setData<PerformanceReport>(new PerformanceReport(report));
  }
}

export default PerformanceCommand;
