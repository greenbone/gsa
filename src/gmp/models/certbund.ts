/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {z} from 'zod';
import {Date} from 'gmp/models/date';
import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import {parseSeverity, parseDate, parseInt} from 'gmp/parser';
import {forEach, map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {validateAndCreate} from 'gmp/utils/zodModelValidation';

type CertBundAdvProperties = z.infer<typeof CertBundAdvPropertiesSchema> &
  ModelProperties;

type CertBundAdvElement = z.infer<typeof CertBundAdvElementSchema> &
  ModelElement;

const InfoElementSchema = z.object({
  _Info_Issuer: z.string().optional(),
  _Info_URL: z.string().optional(),
});

const DescriptionElementSchema = z.object({
  TextBlock: z.string().optional(),
  Infos: z
    .object({
      Info: z.union([InfoElementSchema, z.array(InfoElementSchema)]).optional(),
    })
    .optional(),
});

const RevisionElementSchema = z.object({
  Number: z.number().optional(),
  Description: z.string().optional(),
  Date: z.string().optional(),
});

const AdditionalInformationSchema = z.object({
  issuer: z.string().optional(),
  url: z.string().optional(),
});

const RevisionHistorySchema = z.object({
  revision: z.number().optional(),
  description: z.string().optional(),
  date: z.custom<Date>().optional(),
});

export const CertBundAdvPropertiesSchema = z.object({
  additionalInformation: z.array(AdditionalInformationSchema).optional(),
  categories: z.array(z.string()).optional(),
  cves: z.array(z.string()).optional(),
  description: z.array(z.string()).optional(),
  effect: z.string().optional(),
  platform: z.string().optional(),
  referenceSource: z.string().optional(),
  referenceUrl: z.string().optional(),
  remoteAttack: z.string().optional(),
  revisionHistory: z.array(RevisionHistorySchema).optional(),
  risk: z.string().optional(),
  severity: z.number().optional(),
  software: z.string().optional(),
  summary: z.string().optional(),
  title: z.string().optional(),
  version: z.string().optional(),
});

export const CertBundAdvElementSchema = z.object({
  cert_bund_adv: z
    .object({
      severity: z.number().optional(),
      cve_refs: z.number().optional(),
      summary: z.string().optional(),
      title: z.string().optional(),
      raw_data: z
        .object({
          Advisory: z
            .object({
              AggregatedCVSSScoreSet: z
                .object({
                  ScoreSet: z
                    .object({
                      BaseScore: z.number().optional(),
                      TemporalScore: z.number().optional(),
                      Vector: z.string().optional(),
                    })
                    .optional(),
                })
                .optional(),
              CVEList: z
                .object({
                  CVE: z.union([z.string(), z.array(z.string())]).optional(),
                })
                .optional(),
              CategoryTree: z
                .union([z.string(), z.array(z.string())])
                .optional(),
              Date: z.string().optional(),
              Description: z
                .object({
                  Element: z
                    .union([
                      DescriptionElementSchema,
                      z.array(DescriptionElementSchema),
                    ])
                    .optional(),
                })
                .optional(),
              Effect: z.string().optional(),
              MetaTag: z
                .object({
                  id: z.string().optional(),
                })
                .optional(),
              Platform: z.string().optional(),
              Ref_Num: z
                .object({
                  __text: z.string().optional(),
                  _update: z.string().optional(),
                })
                .optional(),
              Reference_Source: z.string().optional(),
              Reference_URL: z.string().optional(),
              RemoteAttack: z.string().optional(),
              RevisionHistory: z
                .object({
                  Revision: z
                    .union([
                      RevisionElementSchema,
                      z.array(RevisionElementSchema),
                    ])
                    .optional(),
                })
                .optional(),
              Risk: z.string().optional(),
              Software: z.string().optional(),
              Title: z.string().optional(),
              Version: z.string().optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
  update_time: z.string().optional(),
});

const CertBundAdvSchema = z.object({
  additionalInformation: z.array(AdditionalInformationSchema).optional(),
  categories: z.array(z.string()).optional(),
  cves: z.array(z.string()).optional(),
  description: z.array(z.string()).optional(),
  effect: z.string().optional(),
  platform: z.string().optional(),
  referenceSource: z.string().optional(),
  referenceUrl: z.string().optional(),
  remoteAttack: z.string().optional(),
  revisionHistory: z.array(RevisionHistorySchema).optional(),
  risk: z.string().optional(),
  severity: z.number().optional(),
  software: z.string().optional(),
  summary: z.string().optional(),
  title: z.string().optional(),
  version: z.string().optional(),
});

class CertBundAdv extends Model {
  static readonly entityType = 'certbund';

  readonly additionalInformation: z.infer<typeof AdditionalInformationSchema>[];
  readonly categories: string[];
  readonly cves: string[];
  readonly description: string[];
  readonly effect?: string;
  readonly platform?: string;
  readonly referenceSource?: string;
  readonly referenceUrl?: string;
  readonly remoteAttack?: string;
  readonly revisionHistory: z.infer<typeof RevisionHistorySchema>[];
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
    const parsedElement = this.parseElement(element);

    return validateAndCreate({
      schema: CertBundAdvSchema,
      parsedElement,
      originalElement: element,
      modelName: 'certbund',
      ModelClass: CertBundAdv,
    });
  }

  static parseElement(element: CertBundAdvElement = {}): CertBundAdvProperties {
    const {cert_bund_adv: certBundAdv} = element;
    const ret = super.parseElement(element) as CertBundAdvProperties;

    ret.severity = parseSeverity(certBundAdv?.severity);

    const additionalInformation: z.infer<typeof AdditionalInformationSchema>[] =
      [];
    const description: string[] = [];
    let revisionHistory: z.infer<typeof RevisionHistorySchema>[] = [];

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
