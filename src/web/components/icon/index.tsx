/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type React from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BarChart3,
  Calendar,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  CircleMinus,
  CirclePlus,
  CircleX,
  ClipboardCheck,
  Clock3,
  Diff,
  Download,
  Equal,
  FileCog,
  FileOutput,
  FilePenLine,
  Filter,
  Fingerprint,
  Folder,
  FolderOpen,
  Gauge,
  Glasses,
  HatGlasses,
  HelpCircle,
  Import,
  Info,
  Key,
  KeyRound,
  List,
  LogOut,
  type LucideIcon,
  Megaphone,
  Minus,
  Pencil,
  Play,
  PlugZap,
  Plus,
  Power,
  PowerOff,
  Puzzle,
  RefreshCcw,
  RotateCcw,
  Rss,
  Save,
  Search,
  Settings,
  Settings2,
  ShieldCheck,
  ShieldX,
  Square,
  StepForward,
  Tag,
  Tags,
  Trash2,
  Upload,
  User,
  UserCheck,
  Users,
  X,
  ZoomIn,
} from 'lucide-react';
import DynamicIcon, {
  type DynamicIconProps,
} from 'web/components/icon/DynamicIcon';
import AddToAssets from 'web/components/icon/svg/add_to_assets.svg?react';
import CertBundAdv from 'web/components/icon/svg/cert_bund_adv.svg?react';
import Clone from 'web/components/icon/svg/clone.svg?react';
import Config from 'web/components/icon/svg/config.svg?react';
import Cpe from 'web/components/icon/svg/cpe.svg?react';
import Cve from 'web/components/icon/svg/cve.svg?react';
import CvssCalculator from 'web/components/icon/svg/cvss_calculator.svg?react';
import Delta from 'web/components/icon/svg/delta.svg?react';
import DeltaSecond from 'web/components/icon/svg/delta_second.svg?react';
import DfnCertAdv from 'web/components/icon/svg/dfn_cert_adv.svg?react';
import DlCsv from 'web/components/icon/svg/dl_csv.svg?react';
import DlDeb from 'web/components/icon/svg/dl_deb.svg?react';
import DlExe from 'web/components/icon/svg/dl_exe.svg?react';
import DlKey from 'web/components/icon/svg/dl_key.svg?react';
import DlRpm from 'web/components/icon/svg/dl_rpm.svg?react';
import DlSvg from 'web/components/icon/svg/dl_svg.svg?react';
import Host from 'web/components/icon/svg/host.svg?react';
import Ldap from 'web/components/icon/svg/ldap.svg?react';
import Legend from 'web/components/icon/svg/legend.svg?react';
import New from 'web/components/icon/svg/new.svg?react';
import NewNote from 'web/components/icon/svg/new_note.svg?react';
import NewOverride from 'web/components/icon/svg/new_override.svg?react';
import NewTicket from 'web/components/icon/svg/new_ticket.svg?react';
import Note from 'web/components/icon/svg/note.svg?react';
import Nvt from 'web/components/icon/svg/nvt.svg?react';
import Os from 'web/components/icon/svg/os.svg?react';
import Override from 'web/components/icon/svg/override.svg?react';
import PortList from 'web/components/icon/svg/port_list.svg?react';
import ProvideView from 'web/components/icon/svg/provide_view.svg?react';
import Radius from 'web/components/icon/svg/radius.svg?react';
import RemoveFromAssets from 'web/components/icon/svg/remove_from_assets.svg?react';
import Report from 'web/components/icon/svg/report.svg?react';
import ReportFormat from 'web/components/icon/svg/report_format.svg?react';
import Restore from 'web/components/icon/svg/restore.svg?react';
import Result from 'web/components/icon/svg/result.svg?react';
import Role from 'web/components/icon/svg/role.svg?react';
import Scanner from 'web/components/icon/svg/scanner.svg?react';
import Sensor from 'web/components/icon/svg/sensor.svg?react';
import StMitigate from 'web/components/icon/svg/st_mitigate.svg?react';
import StNonavailable from 'web/components/icon/svg/st_nonavailable.svg?react';
import StUnknown from 'web/components/icon/svg/st_unknown.svg?react';
import StVendorfix from 'web/components/icon/svg/st_vendorfix.svg?react';
import StWillnotfix from 'web/components/icon/svg/st_willnotfix.svg?react';
import StWorkaround from 'web/components/icon/svg/st_workaround.svg?react';
import Target from 'web/components/icon/svg/target.svg?react';
import Task from 'web/components/icon/svg/task.svg?react';
import Ticket from 'web/components/icon/svg/ticket.svg?react';
import Tlscertificate from 'web/components/icon/svg/tlscertificate.svg?react';
import Toggle3d from 'web/components/icon/svg/toggle3d.svg?react';
import TrendDown from 'web/components/icon/svg/trend_down.svg?react';
import TrendLess from 'web/components/icon/svg/trend_less.svg?react';
import TrendMore from 'web/components/icon/svg/trend_more.svg?react';
import TrendNochange from 'web/components/icon/svg/trend_nochange.svg?react';
import TrendUp from 'web/components/icon/svg/trend_up.svg?react';
import Vulnerability from 'web/components/icon/svg/vulnerability.svg?react';
import Wizard from 'web/components/icon/svg/wizard.svg?react';

type IconComponent = {
  <TValue = string | undefined>(
    props: Omit<DynamicIconProps<TValue>, 'icon' | 'isLucide' | 'ariaLabel'> & {
      'data-testid'?: string;
    },
  ): React.ReactNode;
  displayName?: string;
};

let _iconCache: Record<string, IconComponent> | null = null;

function createIcon(
  Icon: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>,
  dataTestId: string,
  ariaLabel: string,
  isLucide = true,
): IconComponent {
  const IconWrapper = <TValue extends string | undefined>(
    props: Omit<DynamicIconProps<TValue>, 'icon' | 'isLucide' | 'ariaLabel'> & {
      'data-testid'?: string;
    },
  ) => {
    const {'data-testid': testId = dataTestId, ...rest} = props;
    return (
      <DynamicIcon
        ariaLabel={ariaLabel}
        dataTestId={testId}
        icon={Icon}
        isLucide={isLucide}
        {...rest}
      />
    );
  };
  IconWrapper.displayName = `${ariaLabel.replaceAll(' ', '')}`;
  return IconWrapper as IconComponent;
}

const getIcons = (): Record<string, IconComponent> => {
  if (_iconCache) return _iconCache;

  _iconCache = {
    // Lucide icons
    AlertCircle: createIcon(
      AlertCircle,
      'alert-circle-icon',
      'Alert Circle Icon',
    ),
    Plus: createIcon(Plus, 'plus-icon', 'Plus Icon'),
    Diff: createIcon(Diff, 'diff-icon', 'Diff Icon'),
    Equal: createIcon(Equal, 'equal-icon', 'Equal Icon'),
    CirclePlus: createIcon(CirclePlus, 'circle-plus-icon', 'Circle Plus Icon'),
    Minus: createIcon(Minus, 'minus-icon', 'Minus Icon'),
    CircleMinus: createIcon(
      CircleMinus,
      'circle-minus-icon',
      'Circle Minus Icon',
    ),
    HatAndGlasses: createIcon(
      HatGlasses,
      'hat-and-glasses-icon',
      'Hat and Glasses Icon',
    ),
    FileOutput: createIcon(FileOutput, 'export-icon', 'Export Icon'),
    CircleX: createIcon(CircleX, 'delete-icon', 'Delete Icon'),
    RefreshCcw: createIcon(RefreshCcw, 'refresh-ccw-icon', 'Refresh CCW Icon'),
    Megaphone: createIcon(Megaphone, 'alert-icon', 'Alert Icon'),
    Audit: createIcon(ClipboardCheck, 'audit-icon', 'Audit Icon'),
    ArrowDown: createIcon(ArrowDown, 'arrow-down-icon', 'Arrow Down Icon'),
    ArrowUpDown: createIcon(
      ArrowUpDown,
      'arrow-up-down-icon',
      'Arrow Up Down Icon',
    ),
    ArrowUp: createIcon(ArrowUp, 'arrow-up-icon', 'Arrow Up Icon'),
    Calendar: createIcon(Calendar, 'calendar-icon', 'Calendar Icon'),
    KeyRound: createIcon(KeyRound, 'credential-icon', 'Credential Icon'),
    BarChart3: createIcon(BarChart3, 'dashboard-icon', 'Dashboard Icon'),
    Trash2: createIcon(Trash2, 'trashcan-icon', 'Delete Icon'),
    Disabled: createIcon(PowerOff, 'disable-icon', 'Disable Icon'),
    ZoomIn: createIcon(ZoomIn, 'details-icon', 'Details Icon'),
    Download: createIcon(Download, 'download-icon', 'Download Icon'),
    Pencil: createIcon(Pencil, 'edit-icon', 'Edit Icon'),
    Power: createIcon(Power, 'enable-icon', 'Enable Icon'),
    Rss: createIcon(Rss, 'feed-icon', 'Feed Icon'),
    Filter: createIcon(Filter, 'filter-icon', 'Filter Icon'),
    ChevronFirst: createIcon(ChevronFirst, 'first-icon', 'First Icon'),
    Folder: createIcon(Folder, 'fold-icon', 'Fold Icon'),
    Users: createIcon(Users, 'group-icon', 'Group Icon'),
    HelpCircle: createIcon(HelpCircle, 'help-icon', 'Help Icon'),
    Import: createIcon(Import, 'import-icon', 'Import Icon'),
    Info: createIcon(Info, 'info-icon', 'Info Icon'),
    Key: createIcon(Key, 'key-icon', 'Key Icon'),
    ChevronLast: createIcon(ChevronLast, 'last-icon', 'Last Icon'),
    List: createIcon(List, 'list-icon', 'List Icon'),
    LogOut: createIcon(LogOut, 'logout-icon', 'Logout Icon'),
    Settings: createIcon(Settings, 'my-settings-icon', 'My Settings Icon'),
    ChevronRight: createIcon(ChevronRight, 'next-icon', 'Next Icon'),
    Gauge: createIcon(Gauge, 'performance-icon', 'Performance Icon'),
    UserCheck: createIcon(UserCheck, 'permission-icon', 'Permission Icon'),
    FileCog: createIcon(FileCog, 'policy-icon', 'Policy Icon'),
    ChevronLeft: createIcon(ChevronLeft, 'previous-icon', 'Previous Icon'),
    RotateCcw: createIcon(RotateCcw, 'reset-icon', 'Reset Icon'),
    StepForward: createIcon(StepForward, 'resume-icon', 'Resume Icon'),
    Alterable: createIcon(FilePenLine, 'alterable-icon', 'Alterable Icon'),
    Clock3: createIcon(Clock3, 'schedule-icon', 'Schedule Icon'),
    Search: createIcon(Search, 'search-icon', 'Search Icon'),
    Settings2: createIcon(Settings2, 'settings-2-icon', 'Settings Icon'),
    Puzzle: createIcon(Puzzle, 'solution-type-icon', 'Solution Type Icon'),
    Play: createIcon(Play, 'start-icon', 'Start Icon'),
    Square: createIcon(Square, 'stop-icon', 'Stop Icon'),
    Tag: createIcon(Tag, 'tag-icon', 'Tag Icon'),
    Tags: createIcon(Tags, 'tags-icon', 'Tags Icon'),
    FolderOpen: createIcon(FolderOpen, 'unfold-icon', 'Unfold Icon'),
    Upload: createIcon(Upload, 'upload-icon', 'Upload Icon'),
    User: createIcon(User, 'user-icon', 'User Icon'),
    ShieldCheck: createIcon(ShieldCheck, 'verify-icon', 'Verify Icon'),
    ShieldX: createIcon(ShieldX, 'verify-no-icon', 'Verify No Icon'),
    Glasses: createIcon(Glasses, 'view-other-icon', 'View Other Icon'),
    X: createIcon(X, 'X-icon', 'Close Icon'),
    Save: createIcon(Save, 'save-icon', 'Save Icon'),
    Fingerprint: createIcon(
      Fingerprint,
      'fingerprint-icon',
      'Fingerprint Icon',
    ),
    PlugZap: createIcon(PlugZap, 'plug-zap-icon', 'Plug Zap Icon'),

    // SVG icons
    AddToAssets: createIcon(
      AddToAssets,
      'add-to-assets-icon',
      'Add To Assets Icon',
      false,
    ),
    CertBundAdv: createIcon(
      CertBundAdv,
      'cert-bund-adv-icon',
      'Cert Bund Adv Icon',
      false,
    ),
    Clone: createIcon(Clone, 'clone-icon', 'Clone Icon', false),
    ReportConfig: createIcon(
      ReportFormat,
      'report-config-icon',
      'Report Config Icon',
      false,
    ),
    CpeLogo: createIcon(Cpe, 'cpe-logo-icon', 'CPE Logo Icon', false),
    Cve: createIcon(Cve, 'cve-icon', 'CVE Icon', false),
    CvssCalculator: createIcon(CvssCalculator, 'cvss-icon', 'CVSS Icon', false),
    Delta: createIcon(Delta, 'delta-icon', 'Delta Icon', false),
    DeltaSecond: createIcon(
      DeltaSecond,
      'delta-second-icon',
      'Delta Second Icon',
      false,
    ),
    DeltaDifference: createIcon(
      DeltaSecond,
      'delta-difference-icon',
      'Delta Difference Icon',
      false,
    ),
    DfnCertAdv: createIcon(
      DfnCertAdv,
      'dfn-cert-adv-icon',
      'DFN-CERT Adv Icon',
      false,
    ),
    DlCsv: createIcon(DlCsv, 'download-csv-icon', 'Download CSV Icon', false),
    DlDeb: createIcon(DlDeb, 'download-deb-icon', 'Download DEB Icon', false),
    DlExe: createIcon(DlExe, 'download-exe-icon', 'Download EXE Icon', false),
    DlKey: createIcon(DlKey, 'download-key-icon', 'Download Key Icon', false),
    DlRpm: createIcon(DlRpm, 'download-rpm-icon', 'Download RPM Icon', false),
    DlSvg: createIcon(DlSvg, 'download-svg-icon', 'Download SVG Icon', false),
    Host: createIcon(Host, 'host-icon', 'Host Icon', false),
    Ldap: createIcon(Ldap, 'ldap-icon', 'LDAP Icon', false),
    Legend: createIcon(Legend, 'legend-icon', 'Legend Icon', false),
    New: createIcon(New, 'new-icon', 'New Icon', false),
    NewNote: createIcon(NewNote, 'new-note-icon', 'New Note Icon', false),
    NewTicket: createIcon(
      NewTicket,
      'new-ticket-icon',
      'New Ticket Icon',
      false,
    ),
    NewOverride: createIcon(
      NewOverride,
      'new-override-icon',
      'New Override Icon',
      false,
    ),
    Note: createIcon(Note, 'note-icon', 'Note Icon', false),
    Nvt: createIcon(Nvt, 'nvt-icon', 'NVT Icon', false),
    Os: createIcon(Os, 'os-svg-icon', 'OS Icon', false),
    Override: createIcon(Override, 'override-icon', 'Override Icon', false),
    PortList: createIcon(PortList, 'port-list-icon', 'Port List Icon', false),
    ProvideView: createIcon(
      ProvideView,
      'provide-view-icon',
      'Provide View Icon',
      false,
    ),
    Radius: createIcon(Radius, 'radius-icon', 'Radius Icon', false),
    RemoveFromAssets: createIcon(
      RemoveFromAssets,
      'remove-from-assets-icon',
      'Remove From Assets Icon',
      false,
    ),
    Report: createIcon(Report, 'report-icon', 'Report Icon', false),
    ReportFormat: createIcon(
      ReportFormat,
      'report-format-icon',
      'Report Format Icon',
      false,
    ),
    Restore: createIcon(Restore, 'restore-icon', 'Restore Icon', false),
    Result: createIcon(Result, 'result-icon', 'Result Icon', false),
    Role: createIcon(Role, 'role-icon', 'Role Icon', false),
    Scanner: createIcon(Scanner, 'scanner-icon', 'Scanner Icon', false),
    ScanConfig: createIcon(
      Config,
      'scan-config-icon',
      'Scan Config Icon',
      false,
    ),
    Sensor: createIcon(Sensor, 'sensor-icon', 'Sensor Icon', false),
    StMitigate: createIcon(
      StMitigate,
      'st-mitigate-icon',
      'ST Mitigate Icon',
      false,
    ),
    StNonavailable: createIcon(
      StNonavailable,
      'st-nonavailable-icon',
      'ST Nonavailable Icon',
      false,
    ),
    StUnknown: createIcon(
      StUnknown,
      'st-unknown-icon',
      'ST Unknown Icon',
      false,
    ),
    StVendorfix: createIcon(
      StVendorfix,
      'st-vendorfix-icon',
      'ST Vendorfix Icon',
      false,
    ),
    StWillnotfix: createIcon(
      StWillnotfix,
      'st-willnotfix-icon',
      'ST Willnotfix Icon',
      false,
    ),
    StWorkaround: createIcon(
      StWorkaround,
      'st-workaround-icon',
      'ST Workaround Icon',
      false,
    ),
    Target: createIcon(Target, 'target-icon', 'Target Icon', false),
    Task: createIcon(Task, 'task-icon', 'Task Icon', false),
    Ticket: createIcon(Ticket, 'ticket-icon', 'Ticket Icon', false),
    Tlscertificate: createIcon(
      Tlscertificate,
      'tls-certificate-icon',
      'TLS Certificate Icon',
      false,
    ),
    Toggle3d: createIcon(Toggle3d, 'toggle-3d-icon', 'Toggle 3D Icon', false),
    TrendDown: createIcon(
      TrendDown,
      'trend-down-icon',
      'Trend Down Icon',
      false,
    ),
    TrendLess: createIcon(
      TrendLess,
      'trend-less-icon',
      'Trend Less Icon',
      false,
    ),
    TrendMore: createIcon(
      TrendMore,
      'trend-more-icon',
      'Trend More Icon',
      false,
    ),
    TrendNochange: createIcon(
      TrendNochange,
      'trend-nochange-icon',
      'Trend Nochange Icon',
      false,
    ),
    TrendUp: createIcon(TrendUp, 'trend-up-icon', 'Trend Up Icon', false),
    Vulnerability: createIcon(
      Vulnerability,
      'vulnerability-icon',
      'Vulnerability Icon',
      false,
    ),
    Wizard: createIcon(Wizard, 'wizard-icon', 'Wizard Icon', false),
  };

  return _iconCache;
};

export const AlertCircleIcon = getIcons().AlertCircle;
export const AddToAssetsIcon = getIcons().AddToAssets;
export const AlterableIcon = getIcons().Alterable;
export const ArrowDownIcon = getIcons().ArrowDown;
export const ArrowUpIcon = getIcons().ArrowUp;
export const ArrowUpDownIcon = getIcons().ArrowUpDown;
export const AuditIcon = getIcons().Audit;
export const DashboardIcon = getIcons().BarChart3;
export const CalendarIcon = getIcons().Calendar;
export const CertBundAdvIcon = getIcons().CertBundAdv;
export const FirstIcon = getIcons().ChevronFirst;
export const LastIcon = getIcons().ChevronLast;
export const PreviousIcon = getIcons().ChevronLeft;
export const NextIcon = getIcons().ChevronRight;
export const CircleMinusIcon = getIcons().CircleMinus;
export const CirclePlusIcon = getIcons().CirclePlus;
export const CircleXDeleteIcon = getIcons().CircleX;
export const ScheduleIcon = getIcons().Clock3;
export const CloneIcon = getIcons().Clone;
export const ConfigIcon = getIcons().ScanConfig;
export const CpeLogoIcon = getIcons().CpeLogo;
export const CveIcon = getIcons().Cve;
export const CvssIcon = getIcons().CvssCalculator;
export const DeltaIcon = getIcons().Delta;
export const DeltaDifferenceIcon = getIcons().DeltaDifference;
export const DeltaSecondIcon = getIcons().DeltaSecond;
export const DfnCertAdvIcon = getIcons().DfnCertAdv;
export const DiffIcon = getIcons().Diff;
export const DisableIcon = getIcons().Disabled;
export const DownloadCsvIcon = getIcons().DlCsv;
export const DownloadDebIcon = getIcons().DlDeb;
export const DownloadExeIcon = getIcons().DlExe;
export const DownloadKeyIcon = getIcons().DlKey;
export const DownloadRpmIcon = getIcons().DlRpm;
export const DownloadSvgIcon = getIcons().DlSvg;
export const DownloadIcon = getIcons().Download;
export const EqualIcon = getIcons().Equal;
export const PolicyIcon = getIcons().FileCog;
export const FileOutputIcon = getIcons().FileOutput;
export const FilterIcon = getIcons().Filter;
export const FingerprintIcon = getIcons().Fingerprint;
export const FoldIcon = getIcons().Folder;
export const UnfoldIcon = getIcons().FolderOpen;
export const PerformanceIcon = getIcons().Gauge;
export const ViewOtherIcon = getIcons().Glasses;
export const HatAndGlassesIcon = getIcons().HatAndGlasses;
export const HelpIcon = getIcons().HelpCircle;
export const HostIcon = getIcons().Host;
export const ImportIcon = getIcons().Import;
export const InfoIcon = getIcons().Info;
export const KeyIcon = getIcons().Key;
export const CredentialIcon = getIcons().KeyRound;
export const LdapIcon = getIcons().Ldap;
export const LegendIcon = getIcons().Legend;
export const ListSvgIcon = getIcons().List;
export const LogoutIcon = getIcons().LogOut;
export const AlertIcon = getIcons().Megaphone;
export const MinusIcon = getIcons().Minus;
export const NewIcon = getIcons().New;
export const NewNoteIcon = getIcons().NewNote;
export const NewOverrideIcon = getIcons().NewOverride;
export const NewTicketIcon = getIcons().NewTicket;
export const NoteIcon = getIcons().Note;
export const NvtIcon = getIcons().Nvt;
export const OsSvgIcon = getIcons().Os;
export const OverrideIcon = getIcons().Override;
export const EditIcon = getIcons().Pencil;
export const StartIcon = getIcons().Play;
export const PlugZapIcon = getIcons().PlugZap;
export const PlusIcon = getIcons().Plus;
export const PortListIcon = getIcons().PortList;
export const EnableIcon = getIcons().Power;
export const ProvideViewIcon = getIcons().ProvideView;
export const SolutionTypeSvgIcon = getIcons().Puzzle;
export const RadiusIcon = getIcons().Radius;
export const RefreshIcon = getIcons().RefreshCcw;
export const RemoveFromAssetsIcon = getIcons().RemoveFromAssets;
export const ReportIcon = getIcons().Report;
export const ReportConfigIcon = getIcons().ReportConfig;
export const ReportFormatIcon = getIcons().ReportFormat;
export const RestoreIcon = getIcons().Restore;
export const ResultIcon = getIcons().Result;
export const RoleIcon = getIcons().Role;
export const ResetIcon = getIcons().RotateCcw;
export const FeedIcon = getIcons().Rss;
export const SaveIcon = getIcons().Save;
export const ScanConfigIcon = getIcons().ScanConfig;
export const ScannerIcon = getIcons().Scanner;
export const SearchIcon = getIcons().Search;
export const SensorIcon = getIcons().Sensor;
export const MySettingsIcon = getIcons().Settings;
export const Settings2Icon = getIcons().Settings2;
export const VerifyIcon = getIcons().ShieldCheck;
export const VerifyNoIcon = getIcons().ShieldX;
export const StopIcon = getIcons().Square;
export const ResumeIcon = getIcons().StepForward;
export const StMitigateIcon = getIcons().StMitigate;
export const StNonAvailableIcon = getIcons().StNonavailable;
export const StUnknownIcon = getIcons().StUnknown;
export const StVendorFixIcon = getIcons().StVendorfix;
export const StWillNotFixIcon = getIcons().StWillnotfix;
export const StWorkaroundIcon = getIcons().StWorkaround;
export const TagIcon = getIcons().Tag;
export const TagsIcon = getIcons().Tags;
export const TargetIcon = getIcons().Target;
export const TaskIcon = getIcons().Task;
export const TicketIcon = getIcons().Ticket;
export const TlsCertificateIcon = getIcons().Tlscertificate;
export const Toggle3dIcon = getIcons().Toggle3d;
export const TrashcanIcon = getIcons().Trash2;
export const TrendDownIcon = getIcons().TrendDown;
export const TrendLessIcon = getIcons().TrendLess;
export const TrendMoreIcon = getIcons().TrendMore;
export const TrendNoChangeIcon = getIcons().TrendNochange;
export const TrendUpIcon = getIcons().TrendUp;
export const UploadIcon = getIcons().Upload;
export const UserIcon = getIcons().User;
export const PermissionIcon = getIcons().UserCheck;
export const GroupIcon = getIcons().Users;
export const VulnerabilityIcon = getIcons().Vulnerability;
export const WizardIcon = getIcons().Wizard;
export const XIcon = getIcons().X;
export const DetailsIcon = getIcons().ZoomIn;
