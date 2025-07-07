/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import Note, {NoteElement} from 'gmp/models/note';
import Nvt from 'gmp/models/nvt';
import Override, {OverrideElement} from 'gmp/models/override';
import {
  parseSeverity,
  parseQod,
  QoD,
  parseToString,
  QoDParams,
} from 'gmp/parser';
import {forEach, map} from 'gmp/utils/array';
import {isDefined, isString} from 'gmp/utils/identity';

interface CveResult {
  name: string;
  id: string;
  epss?: Epss;
}

interface ResultCveElement {
  name: string;
  epss?: {
    max_epss: {
      percentile: string;
      score: string;
      cve: {
        _id: string;
        severity: string;
      };
    };
    max_severity: {
      percentile: string;
      score: string;
      cve: {
        _id: string;
        severity: string;
      };
    };
  };
  type?: string;
}

interface EpssValue {
  percentile?: number;
  score?: number;
  cve?: {
    id?: string;
    severity?: number;
  };
}

interface Epss {
  maxEpss?: EpssValue;
  maxSeverity?: EpssValue;
}

const createCveResult = ({name, epss}: ResultCveElement): CveResult => {
  const retEpss: Epss = {};

  if (isDefined(epss?.max_epss)) {
    retEpss.maxEpss = {
      percentile: parseFloat(epss?.max_epss?.percentile),
      score: parseFloat(epss?.max_epss?.score),
    };
    if (isDefined(epss?.max_epss?.cve)) {
      retEpss.maxEpss.cve = {
        id: epss?.max_epss?.cve?._id,
        severity: parseFloat(epss?.max_epss?.cve?.severity),
      };
    }
  }
  if (isDefined(epss?.max_severity)) {
    retEpss.maxSeverity = {
      percentile: parseFloat(epss?.max_severity?.percentile),
      score: parseFloat(epss?.max_severity?.score),
    };
    if (isDefined(epss?.max_severity?.cve)) {
      retEpss.maxSeverity.cve = {
        id: epss?.max_severity?.cve?._id,
        severity: parseFloat(epss?.max_severity?.cve?.severity),
      };
    }
  }

  return {
    name,
    id: name,
    epss: retEpss,
  };
};

interface DeltaElement {
  __text: string;
  diff?: string;
  result?: {
    _id?: string;
    compliance?: string;
    description?: string;
    host?: {
      hostname?: string;
    };
    qod?: QoDParams;
    severity?: number;
  };
}

interface DeltaResult {
  compliance?: string;
  description?: string;
  host?: {
    hostname?: string;
  };
  id?: string;
  qod?: QoD;
  severity?: number;
}

export class Delta {
  static readonly TYPE_NEW = 'new';
  static readonly TYPE_SAME = 'same';
  static readonly TYPE_CHANGED = 'changed';
  static readonly TYPE_GONE = 'gone';

  readonly delta_type: string;
  readonly diff?: string;
  readonly result?: DeltaResult;

  constructor(elem: DeltaElement | string) {
    if (isString(elem)) {
      this.delta_type = elem;
    } else {
      this.delta_type = parseToString(elem.__text) as string;
      this.diff = elem.diff;
      this.result = {
        id: parseToString(elem.result?._id),
        description: parseToString(elem.result?.description),
        host: {
          hostname: parseToString(elem.result?.host?.hostname),
        },
        severity: parseSeverity(elem.result?.severity),
        compliance: parseToString(elem.result?.compliance),
        qod: isDefined(elem.result?.qod)
          ? parseQod(elem.result.qod)
          : undefined,
      };
    }
  }
}

interface TicketElement {
  _id?: string;
}

interface ResultDetectionDetailElement {
  name: string;
  value: string;
}

interface SeverityElement {
  _type?: string;
  date?: string;
  origin?: string;
  score?: number;
  value?: string;
}

interface ResultNvtElement {
  _oid?: string;
  cvss_base?: number;
  family?: string;
  name?: string;
  severities?: {
    _score?: number | string;
    severity?: SeverityElement;
  };
  solution?: {
    __text?: string;
    _type?: string;
  };
  tags?: string;
  type?: string;
}

interface ResultElement extends ModelElement {
  compliance?: string;
  delta?: DeltaElement | string;
  description?: string;
  detection?: {
    result?: {
      _id?: string;
      details?: {
        detail?: ResultDetectionDetailElement | ResultDetectionDetailElement[];
      };
    };
  };
  host?: {
    __text?: string;
    asset?: {
      _asset_id?: string;
    };
    hostname?: string;
  };
  notes?: {
    note?: NoteElement | NoteElement[];
  };
  nvt?: ResultNvtElement | ResultCveElement;
  original_severity?: number;
  original_threat?: string;
  overrides?: {
    override?: OverrideElement | OverrideElement[];
  };
  port?: string;
  report?: {
    _id?: string;
  };
  scan_nvt_version?: string;
  severity?: number;
  task?: {
    _id?: string;
    name?: string;
  };
  threat?: string;
  tickets?: {
    ticket?: TicketElement | TicketElement[];
  };
  qod?: QoDParams;
}

interface ResultHost {
  name?: string;
  id?: string;
  hostname?: string;
}

interface ResultDetectionResult {
  id?: string;
  details?: Record<string, string>;
}

interface ResultDetection {
  result: ResultDetectionResult;
}

interface ResultProperties extends ModelProperties {
  compliance?: string;
  delta?: Delta;
  detection?: ResultDetection;
  description?: string;
  host?: ResultHost;
  information?: Nvt | CveResult;
  notes?: Note[];
  original_severity?: number;
  overrides?: Override[];
  port?: string;
  qod?: QoD;
  report?: Model;
  scan_nvt_version?: string;
  severity?: number;
  task?: Model;
  tickets?: Model[];
  vulnerability?: string;
}

class Result extends Model {
  static readonly entityType = 'result';

  readonly compliance?: string;
  readonly delta?: Delta;
  readonly detection?: ResultDetection;
  readonly description?: string;
  readonly host?: ResultHost;
  readonly information?: Nvt | CveResult;
  readonly notes?: Note[];
  readonly original_severity?: number;
  readonly overrides: Override[];
  readonly port?: string;
  readonly qod?: QoD;
  readonly report?: Model;
  readonly scan_nvt_version?: string;
  readonly severity?: number;
  readonly task?: Model;
  readonly tickets: Model[];
  readonly vulnerability?: string;

  constructor({
    compliance,
    delta,
    detection,
    description,
    host,
    information,
    notes = [],
    // eslint-disable-next-line @typescript-eslint/naming-convention
    original_severity,
    overrides = [],
    port,
    qod,
    report,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    scan_nvt_version,
    severity,
    task,
    tickets = [],
    vulnerability,
    ...properties
  }: ResultProperties = {}) {
    super(properties);

    this.compliance = compliance;
    this.delta = delta;
    this.detection = detection;
    this.description = description;
    this.host = host;
    this.information = information;
    this.notes = notes;
    this.original_severity = original_severity;
    this.overrides = overrides;
    this.port = port;
    this.qod = qod;
    this.report = report;
    this.scan_nvt_version = scan_nvt_version;
    this.severity = severity;
    this.task = task;
    this.tickets = tickets;
    this.vulnerability = vulnerability;
  }

  static fromElement(element: ResultElement = {}): Result {
    return new Result(this.parseElement(element));
  }

  static parseElement(element: ResultElement = {}): ResultProperties {
    const copy = super.parseElement(element) as ResultProperties;

    const {
      compliance,
      description,
      detection,
      host,
      name,
      notes,
      nvt: information,
      original_severity,
      overrides,
      report,
      severity,
      task,
      delta,
      qod,
      tickets,
    } = element;

    if (isDefined(host)) {
      copy.host = {
        name: parseToString(host.__text),
        id: parseToString(host.asset?._asset_id),
        hostname: parseToString(host.hostname),
      };
    }

    if (isDefined(information)) {
      if (information.type === 'nvt') {
        copy.information = Nvt.fromElement({
          nvt: information as ResultNvtElement,
        });
      } else {
        copy.information = createCveResult(information as ResultCveElement);
        copy.name = name ?? information.name;
      }
    }

    copy.description = parseToString(description);
    copy.compliance = parseToString(compliance);
    copy.port = parseToString(element.port);
    copy.scan_nvt_version = parseToString(element.scan_nvt_version);
    copy.severity = parseSeverity(severity);
    copy.vulnerability = isDefined(name)
      ? name
      : (information as ResultNvtElement)?._oid;

    copy.report = isDefined(report)
      ? Model.fromElement(report, 'report')
      : undefined;
    copy.task = isDefined(task) ? Model.fromElement(task, 'task') : undefined;

    if (isDefined(detection) && isDefined(detection.result)) {
      const details = {};

      if (isDefined(detection.result.details)) {
        forEach(detection.result.details.detail, detail => {
          details[detail.name] = detail.value;
        });
      }

      copy.detection = {
        result: {
          id: detection.result._id,
          details: details,
        },
      };
    }

    copy.delta = isDefined(delta) ? new Delta(delta) : undefined;
    copy.original_severity = isDefined(original_severity)
      ? parseSeverity(original_severity)
      : undefined;
    copy.qod = isDefined(qod) ? parseQod(qod) : undefined;
    copy.notes = map(notes?.note, note => Note.fromElement(note));
    copy.overrides = map(overrides?.override, override =>
      Override.fromElement(override),
    );

    // parse tickets as models only. we don't have other data then the id here
    copy.tickets = map(tickets?.ticket, ticket =>
      Model.fromElement(ticket, 'ticket'),
    );

    return copy;
  }

  hasDelta() {
    return isDefined(this.delta);
  }
}

export default Result;
