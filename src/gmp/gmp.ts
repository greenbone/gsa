/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import 'gmp/commands/alerts';
import 'gmp/commands/audits';
import 'gmp/commands/audit-reports';
import 'gmp/commands/dfn-cert';
import 'gmp/commands/filters';
import 'gmp/commands/groups';
import 'gmp/commands/hosts';
import 'gmp/commands/license';
import 'gmp/commands/notes';
import 'gmp/commands/nvt';
import 'gmp/commands/nvt-families';
import 'gmp/commands/os';
import 'gmp/commands/overrides';
import 'gmp/commands/policies';
import 'gmp/commands/report-configs';
import 'gmp/commands/report-formats';
import 'gmp/commands/results';
import 'gmp/commands/scan-configs';
import 'gmp/commands/schedules';
import 'gmp/commands/tickets';
import 'gmp/commands/tls-certificates';
import 'gmp/commands/vulns';

import {getCommands} from 'gmp/command';
import AgentCommand from 'gmp/commands/agent';
import AgentGroupCommand from 'gmp/commands/agent-group';
import AgentGroupsCommand from 'gmp/commands/agent-groups';
import AgentInstallerCommand from 'gmp/commands/agent-installer';
import AgentInstallersCommand from 'gmp/commands/agent-installers';
import AgentsCommand from 'gmp/commands/agents';
import AuthenticationCommand from 'gmp/commands/auth';
import CertBundAdvisoriesCommand from 'gmp/commands/cert-bund-advisories';
import CertBundAdvisoryCommand from 'gmp/commands/cert-bund-advisory';
import CpeCommand from 'gmp/commands/cpe';
import CpesCommand from 'gmp/commands/cpes';
import CredentialCommand from 'gmp/commands/credential';
import CredentialStoreCommand from 'gmp/commands/credential-store';
import CredentialStoresCommand from 'gmp/commands/credential-stores';
import CredentialsCommand from 'gmp/commands/credentials';
import CveCommand from 'gmp/commands/cve';
import CvesCommand from 'gmp/commands/cves';
import DashboardCommand from 'gmp/commands/dashboards';
import FeedStatusCommand from 'gmp/commands/feed-status';
import LoginCommand from 'gmp/commands/login';
import OciImageTargetCommand from 'gmp/commands/oci-image-target';
import OciImageTargetsCommand from 'gmp/commands/oci-image-targets';
import PerformanceCommand from 'gmp/commands/performance';
import PermissionCommand from 'gmp/commands/permission';
import PermissionsCommand from 'gmp/commands/permissions';
import {PortListCommand, PortListsCommand} from 'gmp/commands/port-lists';
import ReportCommand from 'gmp/commands/report';
import ReportsCommand from 'gmp/commands/reports';
import ResourceNamesCommand from 'gmp/commands/resource-names';
import RoleCommand from 'gmp/commands/role';
import RolesCommand from 'gmp/commands/roles';
import ScannerCommand from 'gmp/commands/scanner';
import ScannersCommand from 'gmp/commands/scanners';
import TagCommand from 'gmp/commands/tag';
import TagsCommand from 'gmp/commands/tags';
import TargetCommand from 'gmp/commands/target';
import TargetsCommand from 'gmp/commands/targets';
import TaskCommand from 'gmp/commands/task';
import TasksCommand from 'gmp/commands/tasks';
import TrashCanCommand from 'gmp/commands/trashcan';
import UserCommand from 'gmp/commands/user';
import UsersCommand from 'gmp/commands/users';
import WizardCommand from 'gmp/commands/wizard';
import Http, {type ErrorHandler} from 'gmp/http/http';
import {buildServerUrl, buildUrlParams, type UrlParams} from 'gmp/http/utils';
import {setLocale} from 'gmp/locale/lang';
import {BROWSER_LANGUAGE} from 'gmp/locale/languages';
import logger, {type RootLogger} from 'gmp/log';
import type Settings from 'gmp/settings';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

type Listener = () => void;

const log = logger.getLogger('gmp');

class Gmp {
  readonly settings: Settings;
  readonly log: RootLogger;
  readonly http: Http;
  readonly _login: LoginCommand;
  _logoutListeners: Listener[];

  readonly agent: AgentCommand;
  readonly agents: AgentsCommand;
  readonly agentgroup: AgentGroupCommand;
  readonly agentgroups: AgentGroupsCommand;
  readonly agentinstaller: AgentInstallerCommand;
  readonly agentinstallers: AgentInstallersCommand;
  readonly auth: AuthenticationCommand;
  readonly certbund: CertBundAdvisoryCommand;
  readonly certbunds: CertBundAdvisoriesCommand;
  readonly credential: CredentialCommand;
  readonly credentials: CredentialsCommand;
  readonly cpe: CpeCommand;
  readonly cpes: CpesCommand;
  readonly credentialstore: CredentialStoreCommand;
  readonly credentialstores: CredentialStoresCommand;
  readonly cve: CveCommand;
  readonly cves: CvesCommand;
  readonly dashboard: DashboardCommand;
  readonly feedstatus: FeedStatusCommand;
  readonly ociimagetarget: OciImageTargetCommand;
  readonly ociimagetargets: OciImageTargetsCommand;
  readonly performance: PerformanceCommand;
  readonly permission: PermissionCommand;
  readonly permissions: PermissionsCommand;
  readonly portlist: PortListCommand;
  readonly portlists: PortListsCommand;
  readonly report: ReportCommand;
  readonly reports: ReportsCommand;
  readonly resourcenames: ResourceNamesCommand;
  readonly role: RoleCommand;
  readonly roles: RolesCommand;
  readonly scanner: ScannerCommand;
  readonly scanners: ScannersCommand;
  readonly tag: TagCommand;
  readonly tags: TagsCommand;
  readonly target: TargetCommand;
  readonly targets: TargetsCommand;
  readonly task: TaskCommand;
  readonly tasks: TasksCommand;
  readonly trashcan: TrashCanCommand;
  readonly user: UserCommand;
  readonly users: UsersCommand;
  readonly wizard: WizardCommand;

  constructor(settings: Settings, http?: Http) {
    this.settings = settings;

    logger.init(this.settings);

    log.debug('Using gmp settings', settings);

    this.log = logger;

    this.http = http ?? new Http(this.settings);

    this._login = new LoginCommand(this.http);

    this._logoutListeners = [];

    this.agent = new AgentCommand(this.http);
    this.agents = new AgentsCommand(this.http);
    this.agentgroup = new AgentGroupCommand(this.http);
    this.agentgroups = new AgentGroupsCommand(this.http);
    this.agentinstaller = new AgentInstallerCommand(this.http);
    this.agentinstallers = new AgentInstallersCommand(this.http);
    this.auth = new AuthenticationCommand(this.http);
    this.certbund = new CertBundAdvisoryCommand(this.http);
    this.certbunds = new CertBundAdvisoriesCommand(this.http);
    this.credential = new CredentialCommand(this.http);
    this.credentials = new CredentialsCommand(this.http);
    this.cpe = new CpeCommand(this.http);
    this.cpes = new CpesCommand(this.http);
    this.credentialstore = new CredentialStoreCommand(this.http);
    this.credentialstores = new CredentialStoresCommand(this.http);
    this.cve = new CveCommand(this.http);
    this.cves = new CvesCommand(this.http);
    this.dashboard = new DashboardCommand(this.http);
    this.feedstatus = new FeedStatusCommand(this.http);
    this.ociimagetarget = new OciImageTargetCommand(this.http);
    this.ociimagetargets = new OciImageTargetsCommand(this.http);
    this.performance = new PerformanceCommand(this.http);
    this.permission = new PermissionCommand(this.http);
    this.permissions = new PermissionsCommand(this.http);
    this.portlist = new PortListCommand(this.http);
    this.portlists = new PortListsCommand(this.http);
    this.report = new ReportCommand(this.http);
    this.reports = new ReportsCommand(this.http);
    this.resourcenames = new ResourceNamesCommand(this.http);
    this.role = new RoleCommand(this.http);
    this.roles = new RolesCommand(this.http);
    this.scanner = new ScannerCommand(this.http);
    this.scanners = new ScannersCommand(this.http);
    this.tag = new TagCommand(this.http);
    this.tags = new TagsCommand(this.http);
    this.target = new TargetCommand(this.http);
    this.targets = new TargetsCommand(this.http);
    this.task = new TaskCommand(this.http);
    this.tasks = new TasksCommand(this.http);
    this.trashcan = new TrashCanCommand(this.http);
    this.user = new UserCommand(this.http);
    this.users = new UsersCommand(this.http);
    this.wizard = new WizardCommand(this.http);

    this._initCommands();
  }

  _initCommands() {
    const commands = getCommands();

    for (const [name, cmd] of Object.entries(commands)) {
      const instance = new cmd(this.http);

      Object.defineProperty(this, name, {
        get: function () {
          return instance;
        },
      });
    }
  }

  async login(username: string, password: string) {
    const {token, timezone, locale, sessionTimeout} = await this._login.login(
      username,
      password,
    );

    this.settings.username = username;
    this.settings.timezone = timezone;
    this.settings.token = token;
    this.settings.locale = locale;

    return {
      locale: locale === BROWSER_LANGUAGE ? undefined : locale,
      username,
      token,
      timezone,
      sessionTimeout,
    };
  }

  async doLogout() {
    if (this.isLoggedIn()) {
      const url = this.buildUrl('logout');
      const args = {token: this.settings.token};

      try {
        await this.http.request('get', {
          url,
          args,
        });
      } catch (err) {
        log.error('Error on logout', err);
      } finally {
        this.logout();
      }
    }

    return Promise.resolve();
  }

  logout() {
    this.clearToken();

    for (const listener of this._logoutListeners) {
      listener();
    }
  }

  isLoggedIn() {
    return !isEmpty(this.settings.token);
  }

  subscribeToLogout(listener: Listener) {
    this._logoutListeners.push(listener);

    return () =>
      (this._logoutListeners = this._logoutListeners.filter(
        l => l !== listener,
      ));
  }

  buildUrl(path: string, params?: UrlParams, anchor?: string) {
    let url = buildServerUrl(
      this.settings.apiServer,
      path,
      this.settings.apiProtocol,
    );

    if (isDefined(params)) {
      url += '?' + buildUrlParams(params);
    }

    if (isDefined(anchor)) {
      url += '#' + anchor;
    }
    return url;
  }

  clearToken() {
    this.settings.token = undefined;
  }

  setLocale(lang?: string) {
    this.settings.locale = lang;
    setLocale(lang);
    return this;
  }

  setTimezone(timezone?: string) {
    this.settings.timezone = timezone;
    return this;
  }

  addHttpErrorHandler(handler: ErrorHandler) {
    return this.http.addErrorHandler(handler);
  }
}

export default Gmp;
