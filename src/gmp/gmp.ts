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
import 'gmp/commands/scanners';
import 'gmp/commands/schedules';
import 'gmp/commands/tags';
import 'gmp/commands/targets';
import 'gmp/commands/tickets';
import 'gmp/commands/tlscertificates';
import 'gmp/commands/vulns';

import {getCommands} from 'gmp/command';
import AuthenticationCommand from 'gmp/commands/auth';
import DashboardCommand from 'gmp/commands/dashboards';
import FeedStatusCommand from 'gmp/commands/feedstatus';
import LoginCommand from 'gmp/commands/login';
import PerformanceCommand from 'gmp/commands/performance';
import {PortListCommand, PortListsCommand} from 'gmp/commands/portlists';
import ReportCommand from 'gmp/commands/report';
import ReportsCommand from 'gmp/commands/reports';
import RoleCommand from 'gmp/commands/role';
import RolesCommand from 'gmp/commands/roles';
import TaskCommand from 'gmp/commands/task';
import TasksCommand from 'gmp/commands/tasks';
import TrashCanCommand from 'gmp/commands/trashcan';
import UserCommand from 'gmp/commands/user';
import UsersCommand from 'gmp/commands/users';
import WizardCommand from 'gmp/commands/wizard';
import GmpSettings from 'gmp/gmpsettings';
import GmpHttp from 'gmp/http/gmp';
import {ErrorHandler} from 'gmp/http/http';
import DefaultTransform from 'gmp/http/transform/default';
import {buildServerUrl, buildUrlParams, UrlParams} from 'gmp/http/utils';
import {setLocale} from 'gmp/locale/lang';
import {BROWSER_LANGUAGE} from 'gmp/locale/languages';
import logger, {RootLogger} from 'gmp/log';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

type Listener = () => void;

const log = logger.getLogger('gmp');

class Gmp {
  readonly settings: GmpSettings;
  readonly log: RootLogger;
  readonly http: GmpHttp;
  readonly _login: LoginCommand;
  _logoutListeners: Listener[];

  readonly auth: AuthenticationCommand;
  readonly dashboard: DashboardCommand;
  readonly feedstatus: FeedStatusCommand;
  readonly portlist: PortListCommand;
  readonly portlists: PortListsCommand;
  readonly performance: PerformanceCommand;
  readonly trashcan: TrashCanCommand;
  readonly user: UserCommand;
  readonly users: UsersCommand;
  readonly wizard: WizardCommand;
  readonly report: ReportCommand;
  readonly reports: ReportsCommand;
  readonly role: RoleCommand;
  readonly roles: RolesCommand;
  readonly task: TaskCommand;
  readonly tasks: TasksCommand;

  constructor(settings: GmpSettings, http?: GmpHttp) {
    this.settings = settings;

    logger.init(this.settings);

    log.debug('Using gmp settings', settings);

    this.log = logger;

    this.http = http ?? new GmpHttp(this.settings);

    this._login = new LoginCommand(this.http);

    this._logoutListeners = [];

    this.auth = new AuthenticationCommand(this.http);
    this.dashboard = new DashboardCommand(this.http);
    this.feedstatus = new FeedStatusCommand(this.http);
    this.portlist = new PortListCommand(this.http);
    this.portlists = new PortListsCommand(this.http);
    this.performance = new PerformanceCommand(this.http);
    this.trashcan = new TrashCanCommand(this.http);
    this.user = new UserCommand(this.http);
    this.users = new UsersCommand(this.http);
    this.wizard = new WizardCommand(this.http);
    this.report = new ReportCommand(this.http);
    this.reports = new ReportsCommand(this.http);
    this.role = new RoleCommand(this.http);
    this.roles = new RolesCommand(this.http);
    this.task = new TaskCommand(this.http);
    this.tasks = new TasksCommand(this.http);

    this._initCommands();
  }

  _initCommands() {
    for (const [name, cmd] of Object.entries(getCommands())) {
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
          // @ts-expect-error
          transform: DefaultTransform,
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
