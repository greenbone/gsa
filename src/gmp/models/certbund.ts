/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Date} from 'gmp/models/date';
import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import {parseSeverity, parseDate, parseInt} from 'gmp/parser';
import {forEach, map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

interface InfoElement {
  _Info_Issuer?: string;
  _Info_URL?: string;
}

interface DescriptionElement {
  TextBlock?: string;
  Infos?: {
    Info?: InfoElement | InfoElement[];
  };
}

interface RevisionElement {
  Number?: number;
  Description?: string;
  Date?: string;
}

interface CertBundAdvElement extends ModelElement {
  cert_bund_adv?: {
    severity?: number;
    cve_refs?: number;
    summary?: string;
    title?: string;
    raw_data?: {
      Advisory?: {
        AggregatedCVSSScoreSet?: {
          ScoreSet?: {
            BaseScore?: number;
            TemporalScore?: number;
            Vector?: string;
          };
        };
        CVEList?: {
          CVE?: string | string[];
        };
        CategoryTree?: string | string[];
        Date?: string;
        Description?: {
          Element?: DescriptionElement | DescriptionElement[];
        };
        Effect?: string;
        MetaTag?: {
          id?: string;
        };
        Platform?: string;
        Ref_Num?: {
          __text?: string;
          _update?: string;
        };
        Reference_Source?: string;
        Reference_URL?: string;
        RemoteAttack?: string;
        RevisionHistory?: {
          Revision?: RevisionElement | RevisionElement[];
        };
        Risk?: string;
        Software?: string;
        Title?: string;
        Version?: string; // may be not available anymore
      };
    };
  };
  update_time?: string;
}

interface AdditionalInformation {
  issuer?: string;
  url?: string;
}

interface RevisionHistory {
  revision?: number;
  description?: string;
  date?: Date;
}

interface CertBundAdvProperties extends ModelProperties {
  additionalInformation?: AdditionalInformation[];
  categories?: string[];
  cves?: string[];
  description?: string[];
  effect?: string;
  platform?: string;
  referenceSource?: string;
  referenceUrl?: string;
  remoteAttack?: string;
  revisionHistory?: RevisionHistory[];
  risk?: string;
  severity?: number;
  software?: string;
  summary?: string;
  title?: string;
  version?: string;
}

class CertBundAdv extends Model {
  static readonly entityType = 'certbund';

  readonly additionalInformation: AdditionalInformation[];
  readonly categories: string[];
  readonly cves: string[];
  readonly description: string[];
  readonly effect?: string;
  readonly platform?: string;
  readonly referenceSource?: string;
  readonly referenceUrl?: string;
  readonly remoteAttack?: string;
  readonly revisionHistory: RevisionHistory[];
  readonly risk?: string;
  readonly severity?: number;
  readonly software?: string;
  readonly summary?: string;
  readonly title?: string;
  readonly version?: string;

  constructor({
    additionalInformation = [],
    categories = [],
    cves = [],
    description = [],
    effect,
    platform,
    referenceSource,
    referenceUrl,
    remoteAttack,
    revisionHistory = [],
    risk,
    severity,
    software,
    summary,
    title,
    version,
    ...properties
  }: CertBundAdvProperties = {}) {
    super(properties);

    this.additionalInformation = additionalInformation;
    this.categories = categories;
    this.cves = cves;
    this.description = description;
    this.effect = effect;
    this.platform = platform;
    this.referenceSource = referenceSource;
    this.referenceUrl = referenceUrl;
    this.remoteAttack = remoteAttack;
    this.revisionHistory = revisionHistory;
    this.risk = risk;
    this.severity = severity;
    this.software = software;
    this.summary = summary;
    this.title = title;
    this.version = version;
  }

  static fromElement(element?: CertBundAdvElement): CertBundAdv {
    return new CertBundAdv(this.parseElement(element));
  }

  static parseElement(element: CertBundAdvElement = {}): CertBundAdvProperties {
    const {cert_bund_adv: certBundAdv} = element;
    const ret = super.parseElement(element) as CertBundAdvProperties;

    ret.severity = parseSeverity(certBundAdv?.severity);

    const additionalInformation: AdditionalInformation[] = [];
    const description: string[] = [];
    let revisionHistory: RevisionHistory[] = [];

    ret.categories = [];
    ret.cves = [];

    if (isDefined(certBundAdv?.raw_data?.Advisory)) {
      const {raw_data} = certBundAdv;
      const {Advisory: advisory = {}} = raw_data;

      ret.version = advisory.Version;
      ret.software = advisory.Software;
      ret.platform = advisory.Platform;
      ret.effect = advisory.Effect;
      ret.remoteAttack = advisory.RemoteAttack;
      ret.risk = advisory.Risk;
      ret.referenceSource = advisory.Reference_Source;
      ret.referenceUrl = advisory.Reference_URL;
      ret.categories = map(advisory.CategoryTree, categoryTree => categoryTree);

      if (!isDefined(ret.version) && isDefined(advisory.Ref_Num)) {
        ret.version = advisory.Ref_Num._update;
      }

      if (
        isDefined(advisory.Description) &&
        isDefined(advisory.Description.Element)
      ) {
        forEach(advisory.Description.Element, descriptionElement => {
          if (isDefined(descriptionElement.TextBlock)) {
            description.push(descriptionElement.TextBlock);
          } else if (isDefined(descriptionElement.Infos)) {
            additionalInformation.push(
              ...map(descriptionElement.Infos.Info, info => ({
                issuer: info._Info_Issuer,
                url: info._Info_URL,
              })),
            );
          }
        });
      }

      if (isDefined(advisory.RevisionHistory)) {
        revisionHistory = map(advisory.RevisionHistory.Revision, rev => ({
          revision: parseInt(rev.Number),
          description: rev.Description,
          date: parseDate(rev.Date),
        }));
      }

      if (isDefined(advisory.CVEList && isDefined(advisory.CVEList.CVE))) {
        ret.cves = map(advisory?.CVEList?.CVE, cve => cve);
      }
    }

    ret.title = certBundAdv?.title;
    ret.summary = certBundAdv?.summary;

    ret.additionalInformation = additionalInformation;
    ret.description = description;
    ret.revisionHistory = revisionHistory;

    return ret;
  }
}

export default CertBundAdv;
