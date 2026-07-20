/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityModel, {parseEntityModelProperties} from 'gmp/models/entity-model';
import BaseFilter, {
  type FilterResponseElement,
} from 'gmp/models/filter/base-filter';
import {
  type default as FilterTerm,
  parseFilterTermsFromString,
} from 'gmp/models/filter/filter-term';
import FilterTerms from 'gmp/models/filter/filter-terms';
import {
  type default as FilterType,
  type FilterSortOrder,
} from 'gmp/models/filter/filter-type';
import Model, {type ModelElement, type ModelProperties} from 'gmp/models/model';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

/**
 * XML Structure of a filter model element as returned by `<get_filters>`
 * queries.
 *
 * Example XML Structure:
 * ```xml
 * <get_filters_response status="200" status_text="OK">
 *   <filter id="0c239c16-d597-48a1-9f51-347627a23dac">
 *     ...
 *     <term>apply_overrides=0 min_qod=70 sort=name first=1 rows=1</term>
 *   </filter>
 * </get_filters_response>
 * ```
 */
export interface FilterModelElement extends ModelElement {
  alerts?: {
    alert: ModelElement[];
  };
  filter_type?: string;
  term?: string;
}

interface FilterModelProperties extends ModelProperties {
  _term?: string;
  alerts?: Model[];
  filter_type?: string;
  terms?: FilterTerm[];
}

export type {
  default as FilterType,
  FilterSortOrder,
} from 'gmp/models/filter/filter-type';

/**
 * Represents a filter
 */
class Filter extends EntityModel implements FilterType {
  static readonly entityType = 'filter';

  readonly alerts: Model[];
  readonly filter_type?: string;
  private readonly filterTerms: FilterTerms;

  constructor({
    _type,
    alerts = [],
    comment,
    creationTime,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    filter_type,
    id,
    inUse,
    modificationTime,
    name,
    owner,
    terms = [],
    userCapabilities,
    userTags = [],
    writable,
  }: FilterModelProperties) {
    super({
      _type,
      comment,
      creationTime,
      id,
      inUse,
      modificationTime,
      name,
      owner,
      userCapabilities,
      userTags,
      writable,
    });

    this.alerts = alerts;
    this.filter_type = filter_type;
    this.filterTerms = new FilterTerms({terms});
  }

  get length() {
    return this.filterTerms.length;
  }

  /**
   * Create a new Filter from the passed FilterTerms if they are different from the current ones.
   *
   * @param terms The FilterTerms to use for creating the new Filter.
   * @param keepId Whether to keep the current Filter's ID.
   *
   * @returns A new Filter if the FilterTerms are different, otherwise the current Filter.
   */
  private _delegate(terms: FilterTerms, keepId = false) {
    return terms === this.filterTerms
      ? this
      : new BaseFilter({
          id: keepId ? this.id : undefined,
          name: this.name,
          terms: [...terms.getAllTerms()],
        });
  }

  /**
   * Create new Filter from the passed element object
   *
   * @param element Element object to parse properties from.
   *
   * @returns An object with properties for the new Filter model
   */
  static fromElement(element: FilterModelElement): Filter {
    const ret = parseEntityModelProperties(element) as FilterModelProperties;

    ret.filter_type = ret._type;

    if (isDefined(element.term)) {
      ret.terms = parseFilterTermsFromString(element.term);

      // ret.term should not be part of the public api
      // but it's helpful for debug purposes
      ret._term = element.term;
      // @ts-expect-error
      delete ret.term;
    } else {
      ret.terms = [];
    }

    if (isDefined(element.alerts?.alert)) {
      ret.alerts = map(element.alerts.alert, alert =>
        Model.fromElement(alert, 'alert'),
      );
    }

    return new Filter(ret);
  }

  /**
   * Create a new Filter from the passed response element.
   *
   * @deprecated Use `BaseFilter.fromResponseElement` instead.
   *
   * @param element Response element to parse properties from.
   *
   * @returns A new Filter model instance.
   */
  static fromResponseElement(element: FilterResponseElement = {}) {
    return BaseFilter.fromResponseElement(element);
  }

  /**
   * Creates a new Filter from filterString
   *
   * @deprecated Use `BaseFilter.fromString` instead.
   *
   * @param filterString String to parse FilterTerms from.
   * @param filter Use extra terms from filter if not already
   *               parsed from filterString.
   *
   * @returns New Filter with FilterTerms parsed from filterString.
   */
  static fromString(filterString?: string, filter?: FilterType) {
    return BaseFilter.fromString(filterString, filter);
  }

  /**
   * Creates a new Filter from FilterTerms
   *
   * @deprecated Use `BaseFilter.fromTerm` instead.
   *
   * @param term FilterTerms to set for the new Filter
   *
   * @returns The new Filter
   */
  static fromTerm(...term: FilterTerm[]) {
    return BaseFilter.fromTerm(...term);
  }

  toFilterString(): string {
    return this.filterTerms.toFilterString();
  }

  toFilterCriteriaString(): string {
    return this.filterTerms.toFilterCriteriaString();
  }

  toFilterExtraString(): string {
    return this.filterTerms.toFilterExtraString();
  }

  getTerm(key: string | undefined): FilterTerm | undefined {
    return this.filterTerms.getTerm(key);
  }

  hasTerm(term: FilterTerm | undefined): boolean {
    return this.filterTerms.hasTerm(term);
  }

  getTerms(key: string | undefined): FilterTerm[] {
    return this.filterTerms.getTerms(key);
  }

  getAllTerms(): readonly FilterTerm[] {
    return this.filterTerms.getAllTerms();
  }

  get(
    key: string,
    def: string | number | undefined = undefined,
  ): string | number | undefined {
    return this.filterTerms.get(key, def);
  }

  set(
    keyword: string,
    value?: string | number | boolean,
    relation: string = '=',
  ) {
    return this._delegate(this.filterTerms.set(keyword, value, relation));
  }

  has(key: string): boolean {
    return this.filterTerms.has(key);
  }

  delete(key: string) {
    return this._delegate(this.filterTerms.delete(key));
  }

  identifier() {
    return this.filterTerms.identifier();
  }

  equals(filter: FilterType | undefined | null): boolean {
    return this.filterTerms.equals(filter);
  }

  copy() {
    return new Filter({
      alerts: [...this.alerts],
      comment: this.comment,
      creationTime: this.creationTime,
      filter_type: this.filter_type,
      id: this.id,
      inUse: this.inUse,
      modificationTime: this.modificationTime,
      name: this.name,
      owner: this.owner,
      terms: [...this.filterTerms.getAllTerms()],
      userCapabilities: this.userCapabilities,
      userTags: [...this.userTags],
      writable: this.writable,
    });
  }

  next() {
    return this._delegate(this.filterTerms.next());
  }

  previous() {
    return this._delegate(this.filterTerms.previous());
  }

  first(first: number = 1) {
    return this._delegate(this.filterTerms.first(first));
  }

  all() {
    return this._delegate(this.filterTerms.all());
  }

  simple() {
    return this._delegate(this.filterTerms.simple());
  }

  and(filter: FilterType | undefined | null) {
    return this._delegate(this.filterTerms.and(filter));
  }

  getSortOrder(): FilterSortOrder {
    return this.filterTerms.getSortOrder();
  }

  getSortBy(): string | undefined {
    return this.filterTerms.getSortBy();
  }

  setSortOrder(value: FilterSortOrder) {
    return this._delegate(this.filterTerms.setSortOrder(value));
  }

  setSortBy(value: string) {
    return this._delegate(this.filterTerms.setSortBy(value));
  }

  merge(filter?: FilterType) {
    return this._delegate(this.filterTerms.merge(filter));
  }

  mergeKeywords(filter?: FilterType) {
    return this._delegate(this.filterTerms.mergeKeywords(filter));
  }

  mergeExtraKeywords(filter?: FilterType) {
    return this._delegate(this.filterTerms.mergeExtraKeywords(filter));
  }
}

export const ALL_FILTER = new BaseFilter().all();
export const AGENTS_FILTER_FILTER = Filter.fromString('type=agent');
export const AGENT_GROUPS_FILTER_FILTER = Filter.fromString('type=agent_group');
export const AGENT_INSTALLERS_FILTER_FILTER = Filter.fromString(
  'type=agent_installer',
);
export const ALERTS_FILTER_FILTER = Filter.fromString('type=alert');
export const AUDITS_FILTER_FILTER = Filter.fromString('type=task');
export const AUDIT_REPORTS_FILTER_FILTER =
  Filter.fromString('type=audit_report');
export const CERTBUND_FILTER_FILTER = Filter.fromString('type=info');
export const CPES_FILTER_FILTER = Filter.fromString('type=info');
export const CREDENTIALS_FILTER_FILTER = Filter.fromString('type=credential');
export const CVES_FILTER_FILTER = Filter.fromString('type=info');
export const DFNCERT_FILTER_FILTER = Filter.fromString('type=info');
export const FILTERS_FILTER_FILTER = Filter.fromString('type=filter');
export const GROUPS_FILTER_FILTER = Filter.fromString('type=group');
export const HOSTS_FILTER_FILTER = Filter.fromString('type=host');
export const NOTES_FILTER_FILTER = Filter.fromString('type=note');
export const NVTS_FILTER_FILTER = Filter.fromString('type=info');
export const OS_FILTER_FILTER = Filter.fromString('type=os');
export const OVERRIDES_FILTER_FILTER = Filter.fromString('type=override');
export const PORTLISTS_FILTER_FILTER = Filter.fromString('type=port_list');
export const POLICIES_FILTER_FILTER = Filter.fromString('type=config');
export const PERMISSIONS_FILTER_FILTER = Filter.fromString('type=permission');
export const REPORT_CONFIGS_FILTER_FILTER =
  Filter.fromString('type=report_config');
export const REPORT_FORMATS_FILTER_FILTER =
  Filter.fromString('type=report_format');
export const REPORTS_FILTER_FILTER = Filter.fromString('type=report');
export const RESULTS_FILTER_FILTER = Filter.fromString('type=result');
export const ROLES_FILTER_FILTER = Filter.fromString('type=role');
export const SCANCONFIGS_FILTER_FILTER = Filter.fromString('type=config');
export const SCANNERS_FILTER_FILTER = Filter.fromString('type=scanner');
export const SCHEDULES_FILTER_FILTER = Filter.fromString('type=schedule');
export const SECINFO_FILTER_FILTER = Filter.fromString('type=info');
export const TARGETS_FILTER_FILTER = Filter.fromString('type=target');
export const TASKS_FILTER_FILTER = Filter.fromString('type=task');
export const TAGS_FILTER_FILTER = Filter.fromString('type=tag');
export const TICKETS_FILTER_FILTER = Filter.fromString('type=ticket');
export const TLS_CERTIFICATES_FILTER_FILTER = Filter.fromString(
  'type=tls_certificate',
);
export const USERS_FILTER_FILTER = Filter.fromString('type=user');
export const VULNS_FILTER_FILTER = Filter.fromString('type=vuln');

export const DEFAULT_FALLBACK_FILTER = Filter.fromString('sort=name first=1');

export const RESET_FILTER = Filter.fromString('first=1');

export const DEFAULT_ROWS_PER_PAGE = 50;

export default Filter;
