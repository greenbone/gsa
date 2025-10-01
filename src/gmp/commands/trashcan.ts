/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import HttpCommand from 'gmp/commands/http';
import Response from 'gmp/http/response';
import {XmlMeta, XmlResponseData} from 'gmp/http/transform/fastxml';
import AgentGroup from 'gmp/models/agentgroup';
import Alert from 'gmp/models/alert';
import Audit from 'gmp/models/audit';
import Credential from 'gmp/models/credential';
import Filter from 'gmp/models/filter';
import Group from 'gmp/models/group';
import {ModelElement} from 'gmp/models/model';
import Note from 'gmp/models/note';
import Override from 'gmp/models/override';
import Permission from 'gmp/models/permission';
import Policy from 'gmp/models/policy';
import PortList from 'gmp/models/portlist';
import ReportConfig from 'gmp/models/reportconfig';
import ReportFormat from 'gmp/models/reportformat';
import Role from 'gmp/models/role';
import ScanConfig from 'gmp/models/scanconfig';
import Scanner from 'gmp/models/scanner';
import Schedule from 'gmp/models/schedule';
import Tag from 'gmp/models/tag';
import Target from 'gmp/models/target';
import Task from 'gmp/models/task';
import Ticket from 'gmp/models/ticket';
import {forEach, map} from 'gmp/utils/array';
import {apiType, EntityType} from 'gmp/utils/entitytype';

export interface TrashCanGetData {
  alerts: Alert[];
  audits: Audit[];
  scanConfigs: ScanConfig[];
  credentials: Credential[];
  filters: Filter[];
  groups: Group[];
  notes: Note[];
  overrides: Override[];
  permissions: Permission[];
  policies: Policy[];
  portLists: PortList[];
  reportConfigs: ReportConfig[];
  reportFormats: ReportFormat[];
  roles: Role[];
  scanners: Scanner[];
  schedules: Schedule[];
  tags: Tag[];
  targets: Target[];
  tasks: Task[];
  tickets: Ticket[];
  agentGroups: AgentGroup[];
}

interface UsageTypeElement extends ModelElement {
  usage_type?: string;
}

interface AlertResponseData {
  get_alerts_response?: {
    alert: ModelElement[] | ModelElement;
  };
}

interface ConfigsResponseData {
  get_configs_response?: {
    config: UsageTypeElement[] | UsageTypeElement;
  };
}

interface CredentialsResponseData {
  get_credentials_response?: {
    credential: ModelElement[] | ModelElement;
  };
}

interface FiltersResponseData {
  get_filters_response?: {
    filter: ModelElement[] | ModelElement;
  };
}

interface GroupsResponseData {
  get_groups_response?: {
    group: ModelElement[] | ModelElement;
  };
}

interface NotesResponseData {
  get_notes_response?: {
    note: ModelElement[] | ModelElement;
  };
}

interface OverridesResponseData {
  get_overrides_response?: {
    override: ModelElement[] | ModelElement;
  };
}

interface PermissionsResponseData {
  get_permissions_response?: {
    permission: ModelElement[] | ModelElement;
  };
}

interface PortListsResponseData {
  get_port_lists_response?: {
    port_list: ModelElement[] | ModelElement;
  };
}

interface ReportConfigsResponseData {
  get_report_configs_response?: {
    report_config: ModelElement[] | ModelElement;
  };
}

interface ReportFormatsResponseData {
  get_report_formats_response?: {
    report_format: ModelElement[] | ModelElement;
  };
}

interface RolesResponseData {
  get_roles_response?: {
    role: ModelElement[] | ModelElement;
  };
}

interface ScannersResponseData {
  get_scanners_response?: {
    scanner: ModelElement[] | ModelElement;
  };
}

interface SchedulesResponseData {
  get_schedules_response?: {
    schedule: ModelElement[] | ModelElement;
  };
}

interface TagsResponseData {
  get_tags_response?: {
    tag: ModelElement[] | ModelElement;
  };
}

interface TargetsResponseData {
  get_targets_response?: {
    target: ModelElement[] | ModelElement;
  };
}

interface TasksResponseData {
  get_tasks_response?: {
    task: UsageTypeElement[] | UsageTypeElement;
  };
}

interface TicketsResponseData {
  get_tickets_response?: {
    ticket: ModelElement[] | ModelElement;
  };
}

interface AgentGroupResponseData {
  get_agent_groups_response?: {
    agent_group: ModelElement[] | ModelElement;
  };
}

interface TrashCanGetResponseData<TData> extends XmlResponseData {
  get_trash: TData;
}

type TrashCanGetResponse<TData> = Response<
  TrashCanGetResponseData<TData>,
  XmlMeta
>;

type TrashCanGetPromise<TData> = Promise<TrashCanGetResponse<TData>>;

class TrashCanCommand extends HttpCommand {
  async restore({id}: {id: string}) {
    const data = {
      cmd: 'restore',
      target_id: id,
    };
    await this.httpPost(data);
  }

  async delete({id, entityType}: {id: string; entityType: EntityType}) {
    const cmdApiType = apiType(entityType);
    const cmd = 'delete_from_trash';
    const typeId = cmdApiType + '_id';
    await this.httpPost({
      cmd,
      [typeId]: id,
      resource_type: cmdApiType,
    });
  }

  async empty() {
    await this.httpPost({cmd: 'empty_trashcan'});
  }

  async get(): Promise<Response<TrashCanGetData, XmlMeta>> {
    const alertsRequest = this.httpGet({
      cmd: 'get_trash_alerts',
    }) as TrashCanGetPromise<AlertResponseData>;
    const configsRequest = this.httpGet({
      cmd: 'get_trash_configs',
    }) as TrashCanGetPromise<ConfigsResponseData>;
    const credentialsRequest = this.httpGet({
      cmd: 'get_trash_credentials',
    }) as TrashCanGetPromise<CredentialsResponseData>;
    const filtersRequest = this.httpGet({
      cmd: 'get_trash_filters',
    }) as TrashCanGetPromise<FiltersResponseData>;
    const groupsRequest = this.httpGet({
      cmd: 'get_trash_groups',
    }) as TrashCanGetPromise<GroupsResponseData>;
    const notesRequest = this.httpGet({
      cmd: 'get_trash_notes',
    }) as TrashCanGetPromise<NotesResponseData>;
    const overridesRequest = this.httpGet({
      cmd: 'get_trash_overrides',
    }) as TrashCanGetPromise<OverridesResponseData>;
    const permissionsRequest = this.httpGet({
      cmd: 'get_trash_permissions',
    }) as TrashCanGetPromise<PermissionsResponseData>;
    const portListsRequest = this.httpGet({
      cmd: 'get_trash_port_lists',
    }) as TrashCanGetPromise<PortListsResponseData>;
    const reportConfigsRequest = this.httpGet({
      cmd: 'get_trash_report_configs',
    }) as TrashCanGetPromise<ReportConfigsResponseData>;
    const reportFormatsRequest = this.httpGet({
      cmd: 'get_trash_report_formats',
    }) as TrashCanGetPromise<ReportFormatsResponseData>;
    const rolesRequest = this.httpGet({
      cmd: 'get_trash_roles',
    }) as TrashCanGetPromise<RolesResponseData>;
    const scannersRequest = this.httpGet({
      cmd: 'get_trash_scanners',
    }) as TrashCanGetPromise<ScannersResponseData>;
    const schedulesRequest = this.httpGet({
      cmd: 'get_trash_schedules',
    }) as TrashCanGetPromise<SchedulesResponseData>;
    const tagsRequest = this.httpGet({
      cmd: 'get_trash_tags',
    }) as TrashCanGetPromise<TagsResponseData>;
    const targetsRequest = this.httpGet({
      cmd: 'get_trash_targets',
    }) as TrashCanGetPromise<TargetsResponseData>;
    const tasksRequest = this.httpGet({
      cmd: 'get_trash_tasks',
    }) as TrashCanGetPromise<TasksResponseData>;
    const ticketsRequest = this.httpGet({
      cmd: 'get_trash_tickets',
    }) as TrashCanGetPromise<TicketsResponseData>;
    const agentGroupRequest = this.httpGet({
      cmd: 'get_trash_agent_group',
    }) as TrashCanGetPromise<AgentGroupResponseData>;
    const [
      alertsResponse,
      configsResponse,
      credentialsResponse,
      filtersResponse,
      groupsResponse,
      notesResponse,
      overridesResponse,
      permissionsResponse,
      portListsResponse,
      reportConfigsResponse,
      reportFormatsResponse,
      rolesResponse,
      scannersResponse,
      schedulesResponse,
      tagsResponse,
      targetsResponse,
      tasksResponse,
      ticketsResponse,
      agentGroupsResponse,
    ] = await Promise.all([
      alertsRequest,
      configsRequest,
      credentialsRequest,
      filtersRequest,
      groupsRequest,
      notesRequest,
      overridesRequest,
      permissionsRequest,
      portListsRequest,
      reportConfigsRequest,
      reportFormatsRequest,
      rolesRequest,
      scannersRequest,
      schedulesRequest,
      tagsRequest,
      targetsRequest,
      tasksRequest,
      ticketsRequest,
      agentGroupRequest,
    ]);
    const alertsData = alertsResponse.data.get_trash;
    const configsData = configsResponse.data.get_trash;
    const credentialsData = credentialsResponse.data.get_trash;
    const filtersData = filtersResponse.data.get_trash;
    const groupsData = groupsResponse.data.get_trash;
    const notesData = notesResponse.data.get_trash;
    const overridesData = overridesResponse.data.get_trash;
    const permissionsData = permissionsResponse.data.get_trash;
    const portListsData = portListsResponse.data.get_trash;
    const reportConfigsData = reportConfigsResponse.data.get_trash;
    const reportFormatsData = reportFormatsResponse.data.get_trash;
    const rolesData = rolesResponse.data.get_trash;
    const scannersData = scannersResponse.data.get_trash;
    const schedulesData = schedulesResponse.data.get_trash;
    const tagsData = tagsResponse.data.get_trash;
    const targetsData = targetsResponse.data.get_trash;
    const tasksData = tasksResponse.data.get_trash;
    const ticketsData = ticketsResponse.data.get_trash;
    const agentGroupsData = agentGroupsResponse.data.get_trash;

    const alerts = map(alertsData.get_alerts_response?.alert, element =>
      Alert.fromElement(element),
    );

    const scanConfigs: ScanConfig[] = [];
    const policies: Policy[] = [];
    forEach(configsData.get_configs_response?.config, element => {
      if (element.usage_type === 'scan')
        scanConfigs.push(ScanConfig.fromElement(element));
      else {
        policies.push(Policy.fromElement(element));
      }
    });

    const credentials = map(
      credentialsData.get_credentials_response?.credential,
      element => Credential.fromElement(element),
    );
    const filters = map(filtersData.get_filters_response?.filter, element =>
      Filter.fromElement(element),
    );
    const groups = map(groupsData.get_groups_response?.group, element =>
      Group.fromElement(element),
    );
    const notes = map(notesData.get_notes_response?.note, element =>
      Note.fromElement(element),
    );
    const overrides = map(
      overridesData.get_overrides_response?.override,
      element => Override.fromElement(element),
    );
    const permissions = map(
      permissionsData.get_permissions_response?.permission,
      element => Permission.fromElement(element),
    );
    const portLists = map(
      portListsData.get_port_lists_response?.port_list,
      element => PortList.fromElement(element),
    );
    const reportConfigs = map(
      reportConfigsData.get_report_configs_response?.report_config,
      element => ReportConfig.fromElement(element),
    );
    const reportFormats = map(
      reportFormatsData.get_report_formats_response?.report_format,
      element => ReportFormat.fromElement(element),
    );
    const roles = map(rolesData.get_roles_response?.role, element =>
      Role.fromElement(element),
    );
    const scanners = map(scannersData.get_scanners_response?.scanner, element =>
      Scanner.fromElement(element),
    );
    const schedules = map(
      schedulesData.get_schedules_response?.schedule,
      element => Schedule.fromElement(element),
    );
    const tags = map(tagsData.get_tags_response?.tag, element =>
      Tag.fromElement(element),
    );
    const targets = map(targetsData.get_targets_response?.target, element =>
      Target.fromElement(element),
    );
    const tasks: Task[] = [];
    const audits: Audit[] = [];
    forEach(tasksData.get_tasks_response?.task, element => {
      if (element.usage_type === 'scan') {
        tasks.push(Task.fromElement(element));
      } else {
        audits.push(Audit.fromElement(element));
      }
    });
    const tickets = map(ticketsData.get_tickets_response?.ticket, element =>
      Ticket.fromElement(element),
    );
    const agentGroups = map(
      agentGroupsData.get_agent_groups_response?.agent_group,
      element => AgentGroup.fromElement(element),
    );

    return targetsResponse.setData({
      alerts,
      audits,
      scanConfigs,
      credentials,
      filters,
      groups,
      notes,
      overrides,
      permissions,
      policies,
      portLists,
      reportConfigs,
      reportFormats,
      roles,
      scanners,
      schedules,
      tags,
      targets,
      tasks,
      tickets,
      agentGroups,
    });
  }
}

export default TrashCanCommand;
