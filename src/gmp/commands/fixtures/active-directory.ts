/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type DirectoryTarget} from 'gmp/models/active-directory';

export type DirectoryFixtureScenario = 'base' | 'relationships' | 'large-level';

interface MockObject {
  kind: 'ou' | 'group' | 'container' | 'computer';
  id: string;
  parent: string;
  name: string;
  hostname?: string;
  description?: string;
  disabled?: boolean;
  captured?: boolean;
  matchedTargets?: DirectoryTarget[];
  matchingUnavailable?: boolean;
}

// Wire fixtures only: production commands must never import this module.
export const AD_SOURCE = '254cd3ef-bbe1-4d58-859d-21b8d0c046c6';
export const AD_OTHER_SOURCE = '254cd3ef-bbe1-4d58-859d-21b8d0c046c7';
export const AD_BASE = 'DC=domain,DC=local';
export const AD_CLIENTS = `OU=Clients,${AD_BASE}`;
export const AD_CONTAINER = `CN=Computers,${AD_BASE}`;
export const AD_NESTED_CONTAINER = `CN=Workstations,${AD_CONTAINER}`;
export const AD_ACCOUNTING = `OU=Accounting,${AD_CLIENTS}`;
export const AD_FILE_SERVERS = `CN=File servers,${AD_CLIENTS}`;
export const AD_CRITICAL_SERVERS = `CN=Critical servers,${AD_CLIENTS}`;
export const AD_ARCHIVE_SERVERS = `CN=Archive servers,${AD_CLIENTS}`;
export const AD_LARGE_LEVEL_NAME = 'Performance lab';
export const AD_LARGE_LEVEL = `OU=${AD_LARGE_LEVEL_NAME},${AD_BASE}`;
export const AD_LARGE_LEVEL_SIZE = 10_000;

export const largeLevelComputerName = (number: number) =>
  `perf-pc-${String(number).padStart(5, '0')}`;

export const AD_CREDENTIALS = [
  {
    id: AD_SOURCE,
    name: 'AD Administration (dc01.domain.local)',
    host: 'dc01.domain.local',
    port: '636',
    baseDn: AD_BASE,
    tlsMode: 'ldaps',
  },
  {
    id: AD_OTHER_SOURCE,
    name: 'AD Engineering (dc02.domain.local)',
    host: 'dc02.domain.local',
    port: '389',
    baseDn: AD_BASE,
    tlsMode: 'starttls',
  },
  ...Array.from({length: 50}, (_, index) => ({
    id: `254cd3ef-bbe1-4d58-859d-${String(index + 100).padStart(12, '0')}`,
    name: `AD Site ${String(index + 1).padStart(2, '0')}`,
    host: `dc${index + 3}.domain.local`,
    port: '636',
    baseDn: AD_BASE,
    tlsMode: 'ldaps',
  })),
];

const branch = (
  id: string,
  parent: string,
  name: string,
  kind: 'ou' | 'group' | 'container',
): MockObject => ({id, parent, name, kind});
const computer = (
  name: string,
  parent: string,
  extra: Partial<MockObject> = {},
): MockObject => ({
  kind: 'computer',
  id: `CN=${name},${parent}`,
  parent,
  name: `${name}.domain.local`,
  hostname: `${name}.domain.local`,
  ...extra,
});
export const AD_OBJECTS: MockObject[] = [
  branch(AD_CLIENTS, AD_BASE, 'Clients', 'ou'),
  branch(AD_ACCOUNTING, AD_CLIENTS, 'Accounting', 'ou'),
  branch(AD_FILE_SERVERS, AD_CLIENTS, 'File servers', 'group'),
  branch(AD_CRITICAL_SERVERS, AD_CLIENTS, 'Critical servers', 'group'),
  computer('pc-042', AD_ACCOUNTING),
  computer('pc-043', AD_ACCOUNTING, {
    captured: true,
    description: 'Accounting workstation & finance reporting',
  }),
  computer('pc-legacy', AD_ACCOUNTING),
  computer('pc-retired', AD_ACCOUNTING, {disabled: true}),
  computer('fs-01', AD_BASE),
  computer('fs-02', AD_BASE),
  computer('no-hostname', AD_ACCOUNTING, {hostname: undefined}),
];

const relationshipTarget: DirectoryTarget = {
  id: '1f28d970-17ef-4c69-ba8a-13827059f2b9',
  name: 'Office network',
  tasks: [
    {
      id: '8e12f1c0-d786-4f4c-82db-6ac77e596882',
      name: 'Weekly workstation scan',
      config: {
        id: 'daba56c8-73ec-11df-a475-002264764cea',
        name: 'Full and fast',
      },
    },
  ],
};
const relationshipTargets: DirectoryTarget[] = [
  {
    ...relationshipTarget,
    tasks: [
      ...(relationshipTarget.tasks ?? []),
      {
        id: '8e12f1c0-d786-4f4c-82db-6ac77e596883',
        name: 'Daily discovery',
        config: {
          id: 'daba56c8-73ec-11df-a475-002264764ceb',
          name: 'Discovery',
        },
      },
    ],
  },
  {
    id: '1f28d970-17ef-4c69-ba8a-13827059f2ba',
    name: 'Engineering network',
    tasks: [],
  },
];
const relationshipComputers = () => [
  computer('pc-no-target', AD_ACCOUNTING, {matchedTargets: []}),
  computer('pc-one-target', AD_ACCOUNTING, {
    matchedTargets: [relationshipTarget],
  }),
  computer('pc-multiple-targets', AD_ACCOUNTING, {
    matchedTargets: relationshipTargets,
  }),
  computer('pc-no-tasks', AD_ACCOUNTING, {
    matchedTargets: [{...relationshipTarget, tasks: []}],
  }),
  computer('pc-tasks-unavailable', AD_ACCOUNTING, {
    matchedTargets: [{...relationshipTarget, tasks: undefined}],
  }),
  computer('pc-config-unavailable', AD_ACCOUNTING, {
    matchedTargets: [
      {
        ...relationshipTarget,
        tasks: [
          {
            id: '8e12f1c0-d786-4f4c-82db-6ac77e596882',
            name: 'Restricted configuration scan',
          },
        ],
      },
    ],
  }),
  computer('pc-matching-unavailable', AD_ACCOUNTING, {
    matchingUnavailable: true,
  }),
];
const containerObjects = [
  branch(AD_CONTAINER, AD_BASE, 'Computers', 'container'),
  branch(AD_NESTED_CONTAINER, AD_CONTAINER, 'Workstations', 'container'),
  computer('container-pc', AD_NESTED_CONTAINER),
];

export const createDirectoryFixture = (
  scenario: DirectoryFixtureScenario = 'base',
): MockObject[] => {
  if (scenario === 'large-level') {
    return [
      branch(AD_LARGE_LEVEL, AD_BASE, AD_LARGE_LEVEL_NAME, 'ou'),
      ...Array.from({length: AD_LARGE_LEVEL_SIZE}, (_, index) =>
        computer(largeLevelComputerName(index + 1), AD_LARGE_LEVEL),
      ),
    ];
  }

  return [
    ...AD_OBJECTS.map(node =>
      scenario === 'relationships' && node.name === 'pc-043.domain.local'
        ? {...node, matchedTargets: relationshipTargets}
        : node,
    ),
    ...(scenario === 'relationships'
      ? [
          branch(AD_ARCHIVE_SERVERS, AD_CLIENTS, 'Archive servers', 'group'),
          computer('fs-archive-01', AD_BASE),
          ...relationshipComputers(),
        ]
      : []),
  ];
};

const groupMembers = (
  scenario: DirectoryFixtureScenario,
): Record<string, string[]> => ({
  [AD_FILE_SERVERS]: [
    AD_CRITICAL_SERVERS,
    ...(scenario === 'relationships' ? [AD_ARCHIVE_SERVERS] : []),
  ],
  [AD_CRITICAL_SERVERS]: AD_OBJECTS.filter(node =>
    node.name.startsWith('fs-'),
  ).map(node => node.id),
  ...(scenario === 'relationships'
    ? {[AD_ARCHIVE_SERVERS]: [`CN=fs-archive-01,${AD_BASE}`]}
    : {}),
});
const escape = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const reference = (type: string, id: string, name: string, children = '') =>
  `<${type} id="${id}"><name>${escape(name)}</name>${children}</${type}>`;

const targetXml = (target: DirectoryTarget, includeTasks: boolean) => {
  let children = '';
  if (includeTasks && target.tasks !== undefined) {
    children = `<tasks>${target.tasks
      .map(task =>
        reference(
          'task',
          task.id,
          task.name,
          task.config
            ? reference('config', task.config.id, task.config.name)
            : '',
        ),
      )
      .join('')}</tasks>`;
  }
  return reference('target', target.id, target.name, children);
};
const objectXml = (node: MockObject, params: URLSearchParams) => {
  const details = params.get('details') === '1';
  const tasks = params.get('tasks') === '1';
  const matching = params.get('targets') === '1';
  const config = reference(
    'config',
    'daba56c8-73ec-11df-a475-002264764cea',
    'Full and fast',
  );
  const task = reference(
    'task',
    '8e12f1c0-d786-4f4c-82db-6ac77e596882',
    'Weekly workstation scan',
    config,
  );
  const target = reference(
    'target',
    '1f28d970-17ef-4c69-ba8a-13827059f2b9',
    'Office network',
    tasks ? `<tasks>${task}</tasks>` : '',
  );
  const matches =
    node.matchedTargets?.map(match => targetXml(match, tasks)).join('') ??
    (node.captured ? target : '');
  return `<object type="${node.kind}"><name>${escape(node.name)}</name><distinguished_name>${escape(node.id)}</distinguished_name><parent_dn>${escape(node.parent)}</parent_dn><description>${escape(node.description ?? '')}</description>${node.kind === 'computer' ? `${node.hostname ? `<dns_hostname>${escape(node.hostname)}</dns_hostname>` : ''}<disabled>${Number(!!node.disabled)}</disabled><operating_system>Windows 11 Enterprise</operating_system>${details ? '<operating_system_version>10.0 (22631)</operating_system_version><service_principal_names><service_principal_name>HOST/example.domain.local</service_principal_name></service_principal_names>' : ''}${matching && !node.matchingUnavailable ? `<targets>${matches}</targets>` : ''}` : ''}</object>`;
};

export const directoryObjectsXml = (
  nodes: MockObject[],
  params: URLSearchParams,
  truncated = false,
) => {
  const computers = nodes.filter(node => node.kind === 'computer');
  return `<envelope><get_active_directory_objects><get_active_directory_objects_response status="200" status_text="OK"><objects truncated="${Number(truncated)}"><count><ou>${nodes.filter(node => node.kind === 'ou').length}</ou><container>${nodes.filter(node => node.kind === 'container').length}</container><group>${nodes.filter(node => node.kind === 'group').length}</group><computer><total>${computers.length}</total>${params.get('include_disabled_computers') !== '0' ? `<disabled>${computers.filter(node => node.disabled).length}</disabled>` : ''}</computer></count>${nodes.map(node => objectXml(node, params)).join('')}</objects></get_active_directory_objects_response></get_active_directory_objects></envelope>`;
};

/** GSAD XML responses for automated tests. */
export const activeDirectoryMockResponse = (
  params: URLSearchParams,
  scenario: DirectoryFixtureScenario = 'base',
): string | undefined => {
  const cmd = params.get('cmd');
  const credentialXml = (credential: (typeof AD_CREDENTIALS)[number]) =>
    `<credential id="${credential.id}"><name>${escape(credential.name)}</name><type>ad</type><host>${credential.host}</host><port>${credential.port}</port><bind_dn>CN=Reader,${credential.baseDn}</bind_dn><base_dn>${credential.baseDn}</base_dn><tls_mode>${credential.tlsMode}</tls_mode></credential>`;
  if (
    cmd === 'get_filters' &&
    params.get('filter')?.includes('type=credential')
  ) {
    return '<envelope><get_filters><get_filters_response status="200" status_text="OK"><filters start="1" max="-1"/><filter_count>0<filtered>0</filtered><page>0</page></filter_count></get_filters_response></get_filters></envelope>';
  }
  if (cmd === 'get_credential') {
    const credential = AD_CREDENTIALS.find(
      item => item.id === params.get('credential_id'),
    );
    if (!credential) return undefined;
    return `<envelope><get_credential><get_credentials_response status="200" status_text="OK">${credentialXml(credential)}</get_credentials_response></get_credential></envelope>`;
  }
  if (cmd === 'get_credentials' && params.get('filter')?.includes('type=ad')) {
    const filter = params.get('filter') ?? '';
    // Model qualified GMP terms and the unqualified free-text terms accepted
    // by the standard powerfilter (for example, "site 01").
    const filterTerms = (
      filter.match(/[^\s=~:<>]+[=~:<>](?:"[^"]*"|[^\s]+)|"[^"]*"|[^\s]+/g) ?? []
    )
      .map(term => term.trim())
      .filter(Boolean);
    const alternatives: string[][] = [[]];
    for (const term of filterTerms) {
      if (term.toLowerCase() === 'or') alternatives.push([]);
      else if (term.toLowerCase() !== 'and') alternatives.at(-1)?.push(term);
    }
    const matchesTerm = (
      credential: (typeof AD_CREDENTIALS)[number],
      term: string,
    ) => {
      const match = term.match(/^([a-z_][\w-]*)([=~:<>])(.*)$/i);
      const value = (match?.[3] ?? term).replace(/^"|"$/g, '').toLowerCase();
      if (match?.[1].toLowerCase() === 'type')
        return match[2] === '=' && value === 'ad';
      if (match?.[1].toLowerCase() === 'name') {
        const name = credential.name.toLowerCase();
        return match[2] === '=' ? name === value : name.includes(value);
      }
      if (match) return true;
      const searchable =
        `${credential.name} ${credential.host} ${credential.baseDn}`.toLowerCase();
      return searchable.includes(value);
    };
    let credentials = AD_CREDENTIALS.filter(credential =>
      alternatives.some(terms =>
        terms.every(term => matchesTerm(credential, term)),
      ),
    );
    credentials = [...credentials].sort((left, right) =>
      left.name.localeCompare(right.name),
    );
    if (filter.includes('sort-reverse=name')) credentials.reverse();
    const first = Number(filter.match(/(?:^|\s)first=(\d+)/)?.[1] ?? 1);
    const rows = Number(filter.match(/(?:^|\s)rows=(-?\d+)/)?.[1] ?? 50);
    const page =
      rows < 0
        ? credentials.slice(first - 1)
        : credentials.slice(first - 1, first - 1 + rows);
    return `<envelope><get_credentials><get_credentials_response status="200" status_text="OK">${page.map(credentialXml).join('')}<credentials start="${first}" max="${rows}"/><credential_count>${AD_CREDENTIALS.length}<filtered>${credentials.length}</filtered><page>${page.length}</page></credential_count><filters><term>${escape(filter)}</term></filters></get_credentials_response></get_credentials></envelope>`;
  }
  if (cmd !== 'get_active_directory_objects') return undefined;
  const base = params.get('base_dn') ?? AD_BASE;
  const group = params.get('group_dn');
  const scope = params.get('scope') ?? 'onelevel';
  let nodes = [...createDirectoryFixture(scenario), ...containerObjects].filter(
    node =>
      scope === 'base'
        ? node.id === base
        : scope === 'subtree'
          ? node.id.endsWith(`,${base}`)
          : node.parent === base,
  );
  if (group)
    nodes = nodes.filter(node =>
      groupMembers(scenario)[group]?.includes(node.id),
    );
  if (params.get('include_disabled_computers') === '0')
    nodes = nodes.filter(node => !node.disabled);
  const requestedTypes = params.getAll('object_types:');
  const types = requestedTypes.length
    ? requestedTypes
    : ['ou', 'computer', 'group'];
  nodes = nodes.filter(node => types.includes(node.kind));
  const defaultLimit = scenario === 'large-level' ? AD_LARGE_LEVEL_SIZE : 200;
  const limit = Number(params.get('max_results') ?? defaultLimit);
  return directoryObjectsXml(
    nodes.slice(0, limit),
    params,
    nodes.length > limit,
  );
};
