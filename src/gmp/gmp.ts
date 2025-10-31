/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import 'gmp/commands/alerts';
import 'gmp/commands/audits';
import 'gmp/commands/auditreports';
import 'gmp/commands/certbund';
import 'gmp/commands/credentials';
import 'gmp/commands/cpes';
import 'gmp/commands/cves';
import 'gmp/commands/cvsscalculator';
import 'gmp/commands/dfncert';
import 'gmp/commands/filters';
import 'gmp/commands/groups';
import 'gmp/commands/hosts';
import 'gmp/commands/license';
import 'gmp/commands/resourcenames';
import 'gmp/commands/notes';
import 'gmp/commands/nvt';
import 'gmp/commands/nvtfamilies';
import 'gmp/commands/os';
import 'gmp/commands/overrides';
import 'gmp/commands/permissions';
import 'gmp/commands/policies';
import 'gmp/commands/reportconfigs';
import 'gmp/commands/reportformats';
import 'gmp/commands/results';
import 'gmp/commands/scanconfigs';
import 'gmp/commands/schedules';
import 'gmp/commands/tags';
import 'gmp/commands/targets';
import 'gmp/commands/tickets';
import 'gmp/commands/tlscertificates';
import 'gmp/commands/vulns';

import {getCommands} from 'gmp/command';
import AgentCommand from 'gmp/commands/agent';
import AgentInstallerCommand from 'gmp/commands/agent-installer';
import AgentInstallersCommand from 'gmp/commands/agent-installers';
import AgentGroupCommand from 'gmp/commands/agentgroup';
import AgentGroupsCommand from 'gmp/commands/agentgroups';
import AgentsCommand from 'gmp/commands/agents';
import AuthenticationCommand from 'gmp/commands/auth';
import CredentialStoreCommand from 'gmp/commands/credential-store';
import CredentialStoresCommand from 'gmp/commands/credential-stores';
import DashboardCommand from 'gmp/commands/dashboards';
import FeedStatusCommand from 'gmp/commands/feedstatus';
import LoginCommand from 'gmp/commands/login';
import OciImageTargetCommand from 'gmp/commands/oci-image-target';
import OciImageTargetsCommand from 'gmp/commands/oci-image-targets';
import PerformanceCommand from 'gmp/commands/performance';
import {PortListCommand, PortListsCommand} from 'gmp/commands/portlists';
import ReportCommand from 'gmp/commands/report';
import ReportsCommand from 'gmp/commands/reports';
import RoleCommand from 'gmp/commands/role';
import RolesCommand from 'gmp/commands/roles';
import ScannerCommand from 'gmp/commands/scanner';
import ScannersCommand from 'gmp/commands/scanners';
import TaskCommand from 'gmp/commands/task';
import TasksCommand from 'gmp/commands/tasks';
import TrashCanCommand from 'gmp/commands/trashcan';
import UserCommand from 'gmp/commands/user';
import UsersCommand from 'gmp/commands/users';
import WizardCommand from 'gmp/commands/wizard';
import type GmpSettings from 'gmp/gmpsettings';
import Http, {type ErrorHandler} from 'gmp/http/http';
import {buildServerUrl, buildUrlParams, type UrlParams} from 'gmp/http/utils';
import {setLocale} from 'gmp/locale/lang';
import {BROWSER_LANGUAGE} from 'gmp/locale/languages';
import logger, {type RootLogger} from 'gmp/log';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

type Listener = () => void;

const log = logger.getLogger('gmp');

class Gmp {
  readonly settings: GmpSettings;
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
  readonly credentialStore: CredentialStoreCommand;
  readonly credentialStores: CredentialStoresCommand;
  readonly dashboard: DashboardCommand;
  readonly feedstatus: FeedStatusCommand;
  readonly ociimagetarget: OciImageTargetCommand;
  readonly ociimagetargets: OciImageTargetsCommand;
  readonly performance: PerformanceCommand;
  readonly portlist: PortListCommand;
  readonly portlists: PortListsCommand;
  readonly report: ReportCommand;
  readonly reports: ReportsCommand;
  readonly role: RoleCommand;
  readonly roles: RolesCommand;
  readonly scanner: ScannerCommand;
  readonly scanners: ScannersCommand;
  readonly task: TaskCommand;
  readonly tasks: TasksCommand;
  readonly trashcan: TrashCanCommand;
  readonly user: UserCommand;
  readonly users: UsersCommand;
  readonly wizard: WizardCommand;

  constructor(settings: GmpSettings, http?: Http) {
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
    this.credentialStore = new CredentialStoreCommand(this.http);
    this.credentialStores = new CredentialStoresCommand(this.http);
    this.dashboard = new DashboardCommand(this.http);
    this.feedstatus = new FeedStatusCommand(this.http);
    this.ociimagetarget = new OciImageTargetCommand(this.http);
    this.ociimagetargets = new OciImageTargetsCommand(this.http);
    this.performance = new PerformanceCommand(this.http);
    this.portlist = new PortListCommand(this.http);
    this.portlists = new PortListsCommand(this.http);
    this.report = new ReportCommand(this.http);
    this.reports = new ReportsCommand(this.http);
    this.role = new RoleCommand(this.http);
    this.roles = new RolesCommand(this.http);
    this.scanner = new ScannerCommand(this.http);
    this.scanners = new ScannersCommand(this.http);
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
