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

interface PerformanceReportDetailsData {
  _format: string;
  _start_time?: string;
  _end_time?: string;
  _duration: number;
  __text: string;
}

interface PerformanceReportDetailsArguments {
  format: string;
  startTime?: string;
  endTime?: string;
  duration: number;
  text: string;
}

interface PerformanceReportData {
  name: string;
  title: string;
  report: PerformanceReportDetailsData;
}

interface PerformanceResponseData extends XmlResponseData {
  get_system_reports?: {
    get_system_reports_response?: {
      system_report?: PerformanceReportData | PerformanceReportData[];
    };
  };
}

class PerformanceReportDetails {
  readonly format: string;
  readonly startTime?: Date;
  readonly endTime?: Date;
  readonly duration: number;
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
  readonly report?: PerformanceReportDetails;

  constructor({name, title, report}: PerformanceReportData) {
    this.name = name;
    this.title = title;
    this.report = isDefined(report)
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

  async get({slaveId = '0'} = {}) {
    const response = await this.httpGet({
      slave_id: slaveId,
    });
    const {get_system_reports: sys_reports = {}} =
      response.data as PerformanceResponseData;
    const {get_system_reports_response: sys_response = {}} = sys_reports;
    const {system_report: reports} = sys_response;
    if (!isDefined(reports)) {
      throw new Error('Invalid response data for system reports');
    }
    return response.setData<PerformanceReport[]>(
      map(reports, report => new PerformanceReport(report)),
    );
  }
}

export default PerformanceCommand;
