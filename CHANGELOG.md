# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [21.10] - Unreleased

### Added
### Changed
### Fixed
### Removed
- Remove OVAL Definitions detailspage and listpage [#2918](https://github.com/greenbone/gsa/pull/2918)
- Remove Network Source Interface from GSA for Tasks and Audits [#2902](https://github.com/greenbone/gsa/pull/2902)

[21.10]: https://github.com/greenbone/gsa/compare/gsa-21.04...gsa-21.10

## [21.04.1] - Unreleased

### Added
- Added @testing-library/user-event as a dev-dependency [#2891](https://github.com/greenbone/gsa/pull/2891)

### Changed
- Use greenbone sensor as default scanner type when opening the dialog if available [#2867](https://github.com/greenbone/gsa/pull/2867)

### Fixed
- Fixed number-only names within schedules/dialog [#2914](https://github.com/greenbone/gsa/pull/2914)
- Fixed changing Trend and Select for NVT-families and whole selection only [#2905](https://github.com/greenbone/gsa/pull/2905)
- Fixed missing name for CVE results on result detailspage [#2892](https://github.com/greenbone/gsa/pull/2892)
- Fix setting secret key in RADIUS dialog [#2891](https://github.com/greenbone/gsa/pull/2891)
- Fix setting result UUID in notes dialog [#2889](https://github.com/greenbone/gsa/pull/2889)

### Removed

[21.04.1]: https://github.com/greenbone/gsa/compare/v21.4.0...gsa-21.04

## [21.04] - 2021-04-16

### Added
- Allow to set unix socket permissions for gsad [#2816](https://github.com/greenbone/gsa/pull/2816)
- Added CVSS date to NVT details [#2802](https://github.com/greenbone/gsa/pull/2802)
- Add option to allow to scan simultaneous IPs to targets
  [#2779](https://github.com/greenbone/gsa/pull/2779),
  [#2813](https://github.com/greenbone/gsa/pull/2813)
- Added CVSS origin to NVT details [#2588](https://github.com/greenbone/gsa/pull/2588)
- Added the CVSS v3.1 BaseScore calculator to the `/cvsscalculator` page in the Help section. [#2536](https://github.com/greenbone/gsa/pull/2536)

### Changed
- Don't show word cloud as default in result dashboard [#2883](https://github.com/greenbone/gsa/pull/2883)
- Sort host, os and vulns listpage by descending severity [#2880](https://github.com/greenbone/gsa/pull/2880)
- Revert the changes from integer `score` to a float `severity` [#2854](https://github.com/greenbone/gsa/pull/2854)
- Show StartIcon for scheduled tasks [#2840](https://github.com/greenbone/gsa/pull/2840)
- Remove solution from log NVTs [#2792](https://github.com/greenbone/gsa/pull/2792)
- Don't show empty sections in result details [#2791](https://github.com/greenbone/gsa/pull/2791)
- Move error message and adjust design on login page [#2780](https://github.com/greenbone/gsa/pull/2780)
- Refactored useFormValidation hook [#2704](https://github.com/greenbone/gsa/pull/2704)
- Updated copyright and footer layout [#2687](https://github.com/greenbone/gsa/pull/2687)
- New login page layout
  [#2683](https://github.com/greenbone/gsa/pull/2683),
  [#2736](https://github.com/greenbone/gsa/pull/2736),
  [#2756](https://github.com/greenbone/gsa/pull/2756)
- CVE Tables Page can now be used with the updated xml-format and CVSSv3(.1). [#2583](https://github.com/greenbone/gsa/pull/2583)
- The CVSS v2 BaseScore calculator calculates the score on the client side now. [#2536](https://github.com/greenbone/gsa/pull/2536)


### Fixed
- Fix dynamic severity checkbox not being checked upon clicking [#2882](https://github.com/greenbone/gsa/pull/2882)
- Fixed result CVE parsing for result listpage and CVE reports [#2869](https://github.com/greenbone/gsa/pull/2869)
- Fixed setting comments of business process nodes [#2781](https://github.com/greenbone/gsa/pull/2781)
- Added the deprecatedBy field to CPEs [#2751](https://github.com/greenbone/gsa/pull/2751)
- Fixed the severity for different advisories [#2611](https://github.com/greenbone/gsa/pull/2611)

### Removed
- Removed Edge <= 18 support [#2691](https://github.com/greenbone/gsa/pull/2691)
- Removed Internet Explorer 11 support [#2689](https://github.com/greenbone/gsa/pull/2689)
- Removed support for uncontrolled form fields [#2520](https://github.com/greenbone/gsa/pull/2520)
- Drop gmp scanner type from GSA [#2498](https://github.com/greenbone/gsa/pull/2498)
- Removed filter element "autofp" [#2480](https://github.com/greenbone/gsa/pull/2480)
- Drop dynamic severity classes [#2448](https://github.com/greenbone/gsa/pull/2448)

[21.04]: https://github.com/greenbone/gsa/compare/gsa-20.08...v21.04.0

## [20.8.1] - 2021-02-02

### Added
- Added icon to host detailspage to link to TLS certificates [#2624](https://github.com/greenbone/gsa/pull/2624)
- Added form validation for user setting "rows per page"
  [#2478](https://github.com/greenbone/gsa/pull/2478), [#2505](https://github.com/greenbone/gsa/pull/2505)
- Added option for "Start Task" event upon "New SecInfo arrived" condition in alerts dialog [#2418](https://github.com/greenbone/gsa/pull/2418)

### Changed
- Ensure superadmins can edit themselves [#2633](https://github.com/greenbone/gsa/pull/2633)
- Disable clone icon for superadmins [#2634](https://github.com/greenbone/gsa/pull/2634)
- Allow äüöÄÜÖß in form validation rule for "name" [#2586](https://github.com/greenbone/gsa/pull/2586)
- Show "Filter x matches at least y results" condition to task events in alert dialog [#2580](https://github.com/greenbone/gsa/pull/2580)
- Always send sort=name with delta report request filters [#2570](https://github.com/greenbone/gsa/pull/2570)
- Changed trash icon to delete icon on host detailspage [#2565](https://github.com/greenbone/gsa/pull/2565)
- Change tooltip of override icon in result details [#2467](https://github.com/greenbone/gsa/pull/2467)
- For edit config/policy dialog, only send name and comment if config or policy is in use, and add in use notification [#2463](https://github.com/greenbone/gsa/pull/2463)
- Changed visual appearance of compliance status bar [#2457](https://github.com/greenbone/gsa/pull/2457)
- Changed delete icons on report format detailspage and schedule detailspage to trashcan icons [#2459](https://github.com/greenbone/gsa/pull/2459)
- Use <predefined> to disable feed object editing and filter creation on feed status page [#2398](https://github.com/greenbone/gsa/pull/2398)
- Allow underscores and hyphens in host parameters [#2846](https://github.com/greenbone/gsa/pull/#2846)

### Fixed
- Fix default port value for scanner dialog [#2773](https://github.com/greenbone/gsa/pull/2773)
- Stop growing of toolbars which only have the help icon [#2641](https://github.com/greenbone/gsa/pull/2641)
- Fixed initial value of dropdown for including related resources for permissions [#2632](https://github.com/greenbone/gsa/pull/2632)
- Fixed compiling gsad with libmicrohttp 0.9.71 and later [#2625](https://github.com/greenbone/gsa/pull/2625)
- Fixed display of alert condition "Severity changed" [#2623](https://github.com/greenbone/gsa/pull/2623)
- Fixed sanity check for port ranges [#2566](https://github.com/greenbone/gsa/pull/2566)
- Replace deprecated sys_siglist with strsignal [#2513](https://github.com/greenbone/gsa/pull/2513)
- Allow to delete processes without having had edges in BPM [#2507](https://github.com/greenbone/gsa/pull/2507)
- Fixed TLS certificate download for users with permissions [#2496](https://github.com/greenbone/gsa/pull/2496)
- Fixed form validation error tooltips [#2478](https://github.com/greenbone/gsa/pull/2478)
- Only show schedule options in advanced and modify task wizard if user has correct permissions [#2472](https://github.com/greenbone/gsa/pull/2472)

### Removed
- Remove secinfo filter from user settings dialog and elsewhere [#2495](https://github.com/greenbone/gsa/pull/2495)
- Removed export/download for report formats [#2427](https://github.com/greenbone/gsa/pull/2427)

[20.8.1]: https://github.com/greenbone/gsa/compare/v20.8.0...v20.8.1

## [20.8.0] - 2020-08-11

### Added
- Added reload timer to feedstatuspage and displaying when updating is in progress [#2350](https://github.com/greenbone/gsa/pull/2350)
- Added filtered links to GVMD_DATA row in feed status page [#2339](https://github.com/greenbone/gsa/pull/2339)
- Added loading indicator for CVEs on CPE detailspage [#2248](https://github.com/greenbone/gsa/pull/2248)
- Added new form validation feature, implemented on create and edit ticket dialog [#1782](https://github.com/greenbone/gsa/pull/1782)
- Added German translation for About page [#1998](https://github.com/greenbone/gsa/pull/1998)
- Added a renew session timeout icon to usermenu [#1966](https://github.com/greenbone/gsa/pull/1966)
- Added new BPM feature [#1931](https://github.com/greenbone/gsa/pull/1931) [#2018](https://github.com/greenbone/gsa/pull/2018) [#2025](https://github.com/greenbone/gsa/pull/2025) [#2099](https://github.com/greenbone/gsa/pull/2099)  [#2129](https://github.com/greenbone/gsa/pull/2129) [#2196](https://github.com/greenbone/gsa/pull/2196)
- Added clean-up-translations script [#1948](https://github.com/greenbone/gsa/pull/1948)
- Added handling possible undefined trash in case of an error on the trashcanpage [#1908](https://github.com/greenbone/gsa/pull/1908)
- Added translation using babel-plugin-i18next-extract [#1808](https://github.com/greenbone/gsa/pull/1808)
- Multistep dialog feature, implemented on scanner dialog [#1725](https://github.com/greenbone/gsa/pull/1725)
- Added handling of queued task status [#2208](https://github.com/greenbone/gsa/pull/2208)

### Changed
- Increase age for feed being too old [#2394](https://github.com/greenbone/gsa/pull/2394)
- Do not use result filter from store on report detailspage by default [#2358](https://github.com/greenbone/gsa/pull/2358)
- Improve performance of form fields in edit scan config dialog [#2354](https://github.com/greenbone/gsa/pull/2354)
- Default to sorting nvts by "Created", newest first [#2352](https://github.com/greenbone/gsa/pull/2352)
- Disable EditIcons for data objects from feed [#2346](https://github.com/greenbone/gsa/pull/2346)
- Improve error 503 message at login [#2310](https://github.com/greenbone/gsa/pull/2310)
- Use unified solution type instead of solution type nvt tag [#2268](https://github.com/greenbone/gsa/pull/2268)
- Changed queued status color [#2227](https://github.com/greenbone/gsa/pull/2227)
- Make several NVT families selectable as a whole only in scan configs [#2222](https://github.com/greenbone/gsa/pull/2222)
- Changed future release version from 20.04 to 20.08 [#2118](https://github.com/greenbone/gsa/pull/2118)
- Adjusted task icons to use them for both tasks and audits and removed audit icons [#2070](https://github.com/greenbone/gsa/pull/2070)
- Don't use DetailsLink in ClosedCvesTable if host does not have an ID [#2055](ttps://github.com/greenbone/gsa/pull/2055)
- Changed NOTES_DASHBOARD_ID to fit [gvmd/#1018](https://github.com/greenbone/gvmd/pull/1018) [#2053](https://github.com/greenbone/gsa/pull/2053)
- Change license to AGPL-3.0-or-later [#2027](https://github.com/greenbone/gsa/pull/2027)
- Moved mockprocessmap to separate file to keep tests from running multiple times [#2008](https://github.com/greenbone/gsa/pull/2008)
- Updated German translation according to the changes made in gsa8 and gsa9 [#2007](https://github.com/greenbone/gsa/pull/2007)
- Changed image, text, and layout of About page [#1993](https://github.com/greenbone/gsa/pull/1993)[#1996](https://github.com/greenbone/gsa/pull/1996)[#1998](https://github.com/greenbone/gsa/pull/1998)
- Adjusted multiselect and report listpage to use getDerivedStateFromProps instead of deprecated componentWillReceiveProps [#1935](https://github.com/greenbone/gsa/pull/1935)
- Updated react-beautiful-dnd to version 12.2.0 and fix dragging into empty row [#1837](https://github.com/greenbone/gsa/pull/1837)
- Deleting a single entity now removes its ID from store [#1839](https://github.com/greenbone/gsa/pull/1839)

### Fixed
- Fixed empty subsections on oval def details page [#2396](https://github.com/greenbone/gsa/pull/2396)
- Fixed missing NVT solution [#2388](https://github.com/greenbone/gsa/pull/2388)
- EmptyResultsReport uses the same counts as the results tab title in normal reports, when filtering for nonexistent results
  [#2335](https://github.com/greenbone/gsa/pull/2335), [#2365](https://github.com/greenbone/gsa/pull/2365)
- Show proper error message on report detailspage when no report format is available [#2367](https://github.com/greenbone/gsa/pull/2367)
- Don't use stored result list page filter at report results tab [#2366](https://github.com/greenbone/gsa/pull/2366)
- Fixed pagination of report results [#2365](https://github.com/greenbone/gsa/pull/2365)
- Fixed flickering reports [#2359](https://github.com/greenbone/gsa/pull/2359)
- Fixed "Hosts scanned" in report details disappearing during page refresh [#2357](https://github.com/greenbone/gsa/pull/2357)
- Fixed schedule_periods not forwarded if there is no schedule [#2331](https://github.com/greenbone/gsa/pull/2331)
- Fixed broken radio buttons in alert dialog [#2326](https://github.com/greenbone/gsa/pull/2326)
- Fixed report formats undeletable and unrestorable [#2321](https://github.com/greenbone/gsa/pull/2321)
- Fixed loading delta report detailspage [#2320](https://github.com/greenbone/gsa/pull/2320)
- Fixed spacing between radio buttons and input field in override dialog [#2286](https://github.com/greenbone/gsa/pull/2286)
- Fixed separating hosts in override dialog via comma [#2280](https://github.com/greenbone/gsa/pull/2280)
- Fixed installing the json translation files [#2272](https://github.com/greenbone/gsa/pull/2272)
- Fixed displaying asset host identifiers references [#2260](https://github.com/greenbone/gsa/pull/2260)
- Fixed sort order for recurring days for custom monthly schedule [#2188](https://github.com/greenbone/gsa/pull/2188)
- Fixed missing loading indicator for test alert button [#2156](https://github.com/greenbone/gsa/pull/2156)
- Close dialog for ExternalLink when following link [#2148](https://github.com/greenbone/gsa/pull/2148)
- Fixed license information on AboutPage [#2118](https://github.com/greenbone/gsa/pull/2118) [#2148](https://github.com/greenbone/gsa/pull/2148)
- Fixed state updates on unmounted SvgIcons [#2063](https://github.com/greenbone/gsa/pull/2063)
- Fixed parsing xml rejection messages [#1970](https://github.com/greenbone/gsa/pull/1970)
- Fixed returning bulk_delete response [#1969](https://github.com/greenbone/gsa/pull/1969)
- Fixed parsing DFN-Cert CVE entries [#1965](https://github.com/greenbone/gsa/pull/1965)
- Fixed credential_login in gsad request handlers [#2347](https://github.com/greenbone/gsa/pull/2347)

### Removed
- Remove multistep feature from scanner dialog [#2337](https://github.com/greenbone/gsa/pull/2337)
- Removed predefined status for report formats [#2111](https://github.com/greenbone/gsa/pull/2111)
- Removed old translation mechanism [#1952](https://github.com/greenbone/gsa/pull/1952)
- Removed Agents from GSA and gsad [#1903](https://github.com/greenbone/gsa/pull/1903) [#1905](https://github.com/greenbone/gsa/pull/1905)
- Removed "All SecInfo" section [#1685](https://github.com/greenbone/gsa/pull/1685) [#1695](https://github.com/greenbone/gsa/pull/1695)
- Removed agents [#1903](https://github.com/greenbone/gsa/pull/1903)

[20.8.0]: https://github.com/greenbone/gsa/compare/gsa-9.0...v20.8.0

## [9.0.1] - 2020-05-13

### Added
- Added scanner selection to audit dialog
  [#2031](https://github.com/greenbone/gsa/pull/2031)
  [#2105](https://github.com/greenbone/gsa/pull/2105)
- Added base config to create scanconfig dialog, make it new default base for scanconfigs and new base for policies [#1789](https://github.com/greenbone/gsa/pull/1789)
- Display timezone for session timeout in user menu [#1764](https://github.com/greenbone/gsa/pull/1764)

### Changed
- Adjusted parsing of cve model and removed cwe id as it seems not to be needed anymore [#2294](https://github.com/greenbone/gsa/pull/2294)
- Adjusted parsing of filter strings to deal with strings with double quotes [#2051](https://github.com/greenbone/gsa/pull/2051)
- Changed report TlsCertificate table headers to match TlsCertificate assets
table headers [#2044](https://github.com/greenbone/gsa/pull/2044)
- Unify source reports and hosts in TlsCertficateModel [#2040](https://github.com/greenbone/gsa/pull/2040)
- Set filter rows in hostsTopologyLoader to not use rows=-1 [#2026](https://github.com/greenbone/gsa/pull/2026)
- Updated copyright header dates to 2020 [#2019](https://github.com/greenbone/gsa/pull/2020)
- Updated German translation and fixed parts that were missing after the last merge [#1991](https://github.com/greenbone/gsa/pull/1991)
- Improved error handling for invalid detailspage links [#1986](https://github.com/greenbone/gsa/pull/1986)
- Adjusted DEFAULT_OID_VALUE for use with new oid scheme [#1974](https://github.com/greenbone/gsa/pull/1974)
- Made delta report diffs more explicit [#1950](https://github.com/greenbone/gsa/pull/1950)
- Changed default port to 22 for scanner dialog [#1768](https://github.com/greenbone/gsa/pull/1768)
- Improved Delta Report Details [#1748](https://github.com/greenbone/gsa/pull/1748)
- Updated node dependencies to latest releases [#1735](https://github.com/greenbone/gsa/pull/1735)
- If details not defined, then choose first OS from identifiers [#1719](https://github.com/greenbone/gsa/pull/1719)
- Sorting of SecInfo items [#1717](https://github.com/greenbone/gsa/pull/1717))
- Disabled edit PowerFilter icon if isLoading [#1714](https://github.com/greenbone/gsa/pull/1714)
- Don't show empty menu section [#1711](https://github.com/greenbone/gsa/pull/1711)
- Increased clickable area for Logout [#1711](https://github.com/greenbone/gsa/pull/1711)
- Lowered memory usage when getting a report [#1857](https://github.com/greenbone/gvmd/pull/1857)

### Fixed
- Fixed broken radio buttons and wrong date for schedule in Modify Task Wizard [#2340](https://github.com/greenbone/gsa/pull/2340)
- Fixed missing nextDate for schedules with recurrence "once" [#2336](https://github.com/greenbone/gsa/pull/2336)
- Don't crash if dashboard getSetting returns duplicate setting [#2290](https://github.com/greenbone/gsa/pull/2290)
- Fixed broken bulk export for AllSecInfo [#2269](https://github.com/greenbone/gsa/pull/2269)
- Fixed passing threshold prop in AlertActions for ThresholdMessage [#2114](https://github.com/greenbone/gsa/pull/2114)
- Fixed audit listpage observer tooltip [#2048](https://github.com/greenbone/gsa/pull/2048)
- Fixed showing errors in CredentialDialog when opened from AlertDialog [#2041](https://github.com/greenbone/gsa/pull/2041)
- Fixed usage of report format %F in generateFilename() [#2021](https://github.com/greenbone/gsa/pull/2021)
- Fixed report DetailsContent counts in tabs [#2004](https://github.com/greenbone/gsa/pull/2004) [#2023](https://github.com/greenbone/gsa/pull/2023) [#2067](https://github.com/greenbone/gsa/pull/2067)
- Fixed auto_delete_value of 0 for tasks and audits [#1987](https://github.com/greenbone/gsa/pull/1987)
- Fixed bulk tagging by user selection (send IDs as array) [#1985](https://github.com/greenbone/gsa/pull/1985)
- Fixed pluralizing type 'vulnerability' [#1984](https://github.com/greenbone/gsa/pull/1984)
- Do not crash if osCpe or osTxt are undefined in OsIcon [#1975](https://github.com/greenbone/gsa/pull/1975) [#1978](https://github.com/greenbone/gsa/pull/1978)
- Fixed task listpage observer tooltip [#1949](https://github.com/greenbone/gsa/pull/1949)
- Fixed broken entity links for reportformat, scanconfig and portlist [#1937](https://github.com/greenbone/gsa/pull/1937)
- Fixed showing resource as orphaned when it's not [#1921](https://github.com/greenbone/gsa/pull/1921)
- Fixed override new severity being invalid [#1909](https://github.com/greenbone/gsa/pull/1909)
- Fixed missing usage_type in getAggregates commands for tasks [#1906](https://github.com/greenbone/gsa/pull/1906)
- Fixed undefined policy in create audit dialog [#1847](https://github.com/greenbone/gsa/pull/1847)
- Fixed TLS certificate filtering [#1830](https://github.com/greenbone/gsa/pull/1830)
- Fixed resetting to default filter at list pages [#1828](https://github.com/greenbone/gsa/pull/1828)
- Fixed error when parsing invalid hosts for overrides and notes [#1810](https://github.com/greenbone/gsa/pull/1810)
- Fixed displaying icon titles [#1809](https://github.com/greenbone/gsa/pull/1809)
- Fixed svg icon cursor is always a pointer [#1800](https://github.com/greenbone/gsa/pull/1800)
- Fixed defaultfilter is not always applied [#1783](https://github.com/greenbone/gsa/pull/1783)
- Fixed checkboxes in scanconfig editdialog reset after every rerender [#1773](https://github.com/greenbone/gsa/pull/1773)
- Pass scanner port number to scanner dialog from component [#1772](https://github.com/greenbone/gsa/pull/1772)
- Fixed allowed range for auto delete keep value [#1729](https://github.com/greenbone/gsa/pull/1729)
- Fixed Created column on Results listpage [#1726](https://github.com/greenbone/gsa/pull/1726)
- Get delta report needs to send details=1 [#1724](https://github.com/greenbone/gsa/pull/1724)
- Improve filter handling in report details [#1708](https://github.com/greenbone/gsa/pull/1708)
- Fixed TLS certificate download [#1704](https://github.com/greenbone/gsa/pull/1704)
- Import additional polyfills for IE11 [#1702](https://github.com/greenbone/gsa/pull/1702)
- Handle authentication errors in gsad more carefully [#1700](https://github.com/greenbone/gsa/pull/1700)
- Add usage_type param to get_aggregate [#1872](https://github.com/greenbone/gsa/pull/1872)

### Removed
- Removed auto delete field from container task dialog [#1784](https://github.com/greenbone/gsa/pull/1784)
- Removed obsolete DefaultFilter component and withDefaultFilter HOC [#1709](https://github.com/greenbone/gsa/pull/1709)

[9.0.1]: https://github.com/greenbone/gsa/compare/v9.0.0...v9.0.1

## [9.0.0] - 2019-10-14

### Added
- Added statereducer function to Select component: Scrolls to last selected item [#1715](https://github.com/greenbone/gsa/pull/1715)
- Added loading indicator to select [#1716](https://github.com/greenbone/gsa/pull/1716)
- Added loading indicator to svg icon [#1701](https://github.com/greenbone/gsa/pull/1701)
- Update German Translation [#1689](https://github.com/greenbone/gsa/pull/1689)
- List NVT of the found CVEs at the report details page [#1673](https://github.com/greenbone/gsa/pull/1673)
- Added links for GOS 6 manual for audits, policies and TLS certificates [#1657](https://github.com/greenbone/gsa/pull/1657)
- Added OSP Sensor type to GSA [#1646](https://github.com/greenbone/gsa/pull/1646)
- Added TLS certificate filter type [#1630](https://github.com/greenbone/gsa/pull/1630)
- Added change method to Field and TextArea component, removed withChangeHandler [#1625](https://github.com/greenbone/gsa/pull/1625)
- Added custom page title to all pages [#1623](https://github.com/greenbone/gsa/pull/1623/files)
- Allow to disable reload timers [#1619](https://github.com/greenbone/gsa/pull/1619)
- Added missing withRouter to withEntitiesContainer [#1614](https://github.com/greenbone/gsa/pull/1614)
- Added parseTrend() function to ScanConfig model [#1583](https://github.com/greenbone/gsa/pull/1583)
- Added DetailsPage and more functionalities to TLS Certificate assets [#1578](https://github.com/greenbone/gsa/pull/1578)
- Added Explicit Compliance [#1495](https://github.com/greenbone/gsa/pull/1495), [#1655](https://github.com/greenbone/gsa/pull/1655)
- Added tasktrendgroup component for tasks filter dialog [#1511](https://github.com/greenbone/gsa/pull/1511)
- Added HorizontalSep component for horizontal lists. [#1494](https://github.com/greenbone/gsa/pull/1494)
- Added BooleanFilterGroup and changed notes filter dialog [#1493](https://github.com/greenbone/gsa/pull/1493)
- Added grow option to multiselect component [#1485](https://github.com/greenbone/gsa/pull/1485)
- Added LogoutIcon [#1481](https://github.com/greenbone/gsa/pull/1481)
- Added a component "SeverityValuesGroup" enabling user choose the relation they want [#1477](https://github.com/greenbone/gsa/pull/1477)
- Added filter keywords owner, host, cvss base score, vulnerability and location to filter dialog on results page [#1472](https://github.com/greenbone/gsa/pull/1472)
- Add storybook [#1272](https://github.com/greenbone/gsa/pull/1286)
- Added TLS certificates to the asset management.
  [#1455](https://github.com/greenbone/gsa/pull/1455),
  [#1461](https://github.com/greenbone/gsa/pull/1461),
  [#1600](https://github.com/greenbone/gsa/pull/1600),
  [#1681](https://github.com/greenbone/gsa/pull/1681)
- Add usage type to task and scanconfig commands [#1460](https://github.com/greenbone/gsa/pull/1460)
  [#1466](https://github.com/greenbone/gsa/pull/1466) [#1467](https://github.com/greenbone/gsa/pull/1467)

### Changed
- Tweaked LDAP and RADIUS pages to be more consistent [#1718](https://github.com/greenbone/gsa/pull/1718)
- Decide whether to default to full and fast scan config (task dialog)[#1671](https://github.com/greenbone/gsa/pull/1671)
- Determine the to be applied filter of a list page in GSA and don't rely on the
  backend
  [#1631](https://github.com/greenbone/gsa/pull/1631),
  [#1653](https://github.com/greenbone/gsa/pull/1653),
  [#1677](https://github.com/greenbone/gsa/pull/1677)
- Changed gmpname for vulnerability and secinfo pages [#1652](https://github.com/greenbone/gsa/pull/1652)
- Use "lean" reports by default when requesting a single report [#1635](https://github.com/greenbone/gsa/pull/1635)
- Use uuid to get greenbone compliance report format [#1643](https://github.com/greenbone/gsa/pull/1643)
- Added details=1 to report download command [#1642](https://github.com/greenbone/gsa/pull/1642)
- Adjusted gsa to send details=1 for get_report and change gsad to forward details to gvmd [1640](https://github.com/greenbone/gsa/pull/1640)
- Switch tooltips for fold and unfold icon, change task trend options in filter dialog to make them easier to understand [#1627](https://github.com/greenbone/gsa/pull/1627)
- Improved edit scanconfig dialogs to open immediately and show loading indicators [#1624](https://github.com/greenbone/gsa/pull/1624)
- Reuse permissions, reloadInterval and compareAlerts from task details and detailspage for audit details and detailspage [#1607](https://github.com/greenbone/gsa/pull/1607)
- Replaced savedialogcontent class with hooks [#1602](https://github.com/greenbone/gsa/pull/1602)
- TicketStatusGroup updated with new filter strings [#1594](https://github.com/greenbone/gsa/pull/1594)
- Reuse NvtFamilies, NvtPreferences and ScannerPreferences from scanconfig detailspage for policy detailspage [#1593](https://github.com/greenbone/gsa/pull/1593)
- Fixed sensor icon not visible in audit row and reuse renderReport from tasks for audits [#1577](https://github.com/greenbone/gsa/pull/1577)
- Reuse scanconfig edit dialogs for policies [#1573](https://github.com/greenbone/gsa/pull/1573)
- Use styled-components to render global styles [#1557](https://github.com/greenbone/gsa/pull/1557)
- Use fast xml parser by default [#1556](https://github.com/greenbone/gsa/pull/1556)
- Updated dependencies [#1555](https://github.com/greenbone/gsa/pull/1555)
- Changed schedule dialog (added Now button) to help users jump to current time ASAP [#1519](https://github.com/greenbone/gsa/pull/1519)
- Changed the filter dialogues for tasks and overrides [#1511](https://github.com/greenbone/gsa/pull/1511)
- modified filterdialogs for reports and vulnerabilities [#1503](https://github.com/greenbone/gsa/pull/1503)
- Changed filterdialog for tickets page [#1489](https://github.com/greenbone/gsa/pull/1489)
- Restructured menu categories [#1481](https://github.com/greenbone/gsa/pull/1481)
- Logout and usersettings link got a menu [#1481](https://github.com/greenbone/gsa/pull/1481)
- Modified the BarChart's y-domain to avoid range [0,0]. [#1447](https://github.com/greenbone/gsa/pull/1447)
- Changed FilterTerm to convert all filter keywords to lower case [#1444](https://github.com/greenbone/gsa/pull/1444)
- Use Reacts new ref API (no innerRef anymore [#1441](https://github.com/greenbone/gsa/pull/1441))
- Allow dynamic ref types in NVT model and adjust CertLink to it [#1434](https://github.com/greenbone/gsa/pull/1434)
- Use new ref structure in NVTs [#1424](https://github.com/greenbone/gsa/pull/1424)
- Use HTTPS for documentation links
- Cleanup and improve handling of http parameters and arguments for gmp
  requests in gsad [#1355](https://github.com/greenbone/gsa/pull/1355)

### Fixed
- Fixed displaying negative days on the override and note active dashboard [#1727](https://github.com/greenbone/gsa/pull/1727) [#1728](https://github.com/greenbone/gsa/pull/1728)
- Fixed inability to change to/from LDAP and RADIUS settings [#1723](https://github.com/greenbone/gsa/pull/1723)
- Fixed filter dialog duplicating filter terms [#1705] (https://github.com/greenbone/gsa/pull/1705)
- Fixed parsing report details data [#1673](https://github.com/greenbone/gsa/pull/1673)
- Fixed scanconfig clone icon tooltip does not show if permission is denied [#1664](https://github.com/greenbone/gsa/pull/1664)
- Fixed feed status page does not render [#1628](https://github.com/greenbone/gsa/pull/1628)
- fixed secinfo severitybars not displaying severity.[#1530](https://github.com/greenbone/gsa/pull/1530)
- Fixed outer click issues for multi select and select boxes
  [#1504](https://github.com/greenbone/gsa/pull/1504)

### Removed
- Removed UserLink component [#1481](https://github.com/greenbone/gsa/pull/1481)
- Remove edit_config command from gsad [#1439](https://github.com/greenbone/gsa/pull/1439)
- Remove copyright from gsad version output [#1379](https://github.com/greenbone/gsa/pull/1379)

[9.0.0]: https://github.com/greenbone/gsa/compare/v8.0.1...v9.0.0

## [8.0.2] - 2020-05-13

### Added
- Show passphrase field in credential dialog for cc type [#2006](https://github.com/greenbone/gsa/pull/2006)
- Display error details at report details page [#1862](https://github.com/greenbone/gsa/pull/1862)
- Added warnings to content composer if reportResultThreshold is exceeded [#1852](https://github.com/greenbone/gsa/pull/1852)
- Added parseText to model.js to parse single space summary [#1829](https://github.com/greenbone/gsa/pull/1829)
- Added new setting to enable and disable debug logging for the redux store [#1684](https://github.com/greenbone/gsa/pull/1684)
- Added text notification when old password is entered but new password isn't [#1636](https://github.com/greenbone/gsa/pull/1636)
- Added a loading timer for empty trash button [#1604](https://github.com/greenbone/gsa/pull/1604)
- Added details to alert details page [#1591](https://github.com/greenbone/gsa/pull/1591)
- Added loading indicator for edit config dialog [#1579](https://github.com/greenbone/gsa/pull/1579)
- Added tooltip for settings in task edit dialog that can't be changed once the task has been run [#1568](https://github.com/greenbone/gsa/pull/1568)
- Added success dialog to report formats listpage [#1566](https://github.com/greenbone/gsa/pull/1566)
- Added an explicit get_capabilities command to gsad [#1538](https://github.com/greenbone/gsa/pull/1538)
- Highlight result diffs at delta reports [#1513](https://github.com/greenbone/gsa/pull/1513)
- Added HorizontalSep component for horizontal lists
  [#1506](https://github.com/greenbone/gsa/pull/1506),
  [#1507](https://github.com/greenbone/gsa/pull/1507)

### Changed
- Use IP Address instead of Name in host dialog form field title [#2311](https://github.com/greenbone/gsa/pull/2311)
- Use = instead of ~ in filter of link in OS row [#2086](https://github.com/greenbone/gsa/pull/2086)
- Update copyright header dates to 2020 [#2019](https://github.com/greenbone/gsa/pull/2019)
- Improve text for empty results report and threshold panel [#1900](https://github.com/greenbone/gsa/pull/1900)
- Load report results with separate requests
  [#1863](https://github.com/greenbone/gsa/pull/1863),
  [#1870](https://github.com/greenbone/gsa/pull/1870),
  [#1871](https://github.com/greenbone/gsa/pull/1871)
- Only load full report if the report has less than 25000 results [#1851](https://github.com/greenbone/gsa/pull/1851)
- Only render report information, results and errors if a result has more than 25000 results [#1849](https://github.com/greenbone/gsa/pull/1849)
- Limit the length of result description with a div [#1834](https://github.com/greenbone/gsa/pull/1834)
- New permission dialog: radio button for groups disabled if no groups available [#1836](https://github.com/greenbone/gsa/pull/1836)
- Changed new override dialog defaults [#1833](https://github.com/greenbone/gsa/pull/1833)
- Refactored cvsscalculatorpage to function and parse vector from url [#1824](https://github.com/greenbone/gsa/pull/1824)
- New override and note dialog: Make host/port/task fields editable even when fixed, and display oid when no name is defined [#1814](https://github.com/greenbone/gsa/pull/1814) [#1817](https://github.com/greenbone/gsa/pull/1817)
- Use consistent setting naming [#1774](https://github.com/greenbone/gsa/pull/1774)
- Consider visibility status of page for calculating the reload interval [#1761](https://github.com/greenbone/gsa/pull/1761)
- Do not simplify filterString in content composer for report download [#1733](https://github.com/greenbone/gsa/pull/1733)
- Use single component for reloading data [#1722](https://github.com/greenbone/gsa/pull/1722)
- Use last chars of a label string in BarChart [#1713](https://github.com/greenbone/gsa/pull/1713)
- Next Scheduled Tasks displays timezone [#1712](https://github.com/greenbone/gsa/pull/1712)
- Load "small" report before full report [#1697](https://github.com/greenbone/gsa/pull/1697)
- Removed Clone and Verify functionalities for report formats [#1650](https://github.com/greenbone/gsa/pull/1650)
- Use new [React context API](https://reactjs.org/docs/context.html#api) [#1637](https://github.com/greenbone/gsa/pull/1637)
- Update response data parsing in Model classes
  [#1633](https://github.com/greenbone/gsa/pull/1633),
  [#1668](https://github.com/greenbone/gsa/pull/1668)
- Fix statusbar content can be more than 100% and add progressbar colors to theme [1621](https://github.com/greenbone/gsa/pull/1621)
- Allow to overwrite details=1 for command results.get() [#1618](https://github.com/greenbone/gsa/pull/1618)
- Ensure not to request the report details when loading a list of reports [#1617](https://github.com/greenbone/gsa/pull/1617)
- Adjust PortList manual links [#1599](https://github.com/greenbone/gsa/pull/1599)
- Word-wrap in pre component [#1586](https://github.com/greenbone/gsa/pull/1586)
- Disable EditIcon for My Settings if permission denied [#1588](https://github.com/greenbone/gsa/pull/1588)
- Don't allow to clone hosts [#1581](https://github.com/greenbone/gsa/pull/1581)
- Trigger alert button disabled in report details page when no permission [#1574](https://github.com/greenbone/gsa/pull/1574)
- Update default filter for report details page [#1552](https://github.com/greenbone/gsa/pull/1552)
- Adjust HelpIcons to use GOS 5 manual [#1549](https://github.com/greenbone/gsa/pull/1549) [#1550](https://github.com/greenbone/gsa/pull/1550)
- Adjust clickable areas for Select and MultiSelect [#1545](https://github.com/greenbone/gsa/pull/1545)
- Redirect to main page when visiting the login page and the user is already
  logged in [#1508](https://github.com/greenbone/gsa/pull/1508)
- Lower memory usage when getting a report [#1858](https://github.com/greenbone/gvmd/pull/1858)

### Fixed
- Fixed missing CVEs on CPE detailspage [#2220](https://github.com/greenbone/gsa/pull/2220)
- Fixed nvt family links not changing the filter [#1997](https://github.com/greenbone/gsa/pull/1997)
- Use correct capabilities for task icons [#1973](https://github.com/greenbone/gsa/pull/1973)
- Fixed ProvideViewIcon for tasks is only shown for users but not for groups and roles [#1968](https://github.com/greenbone/gsa/pull/1968)
- Fixed missing delete button for host identifiers [#1959](https://github.com/greenbone/gsa/pull/1959)
- Fixed sorting columns with empty string values [#1936](https://github.com/greenbone/gsa/pull/1936)
- Fixed broken entity links for reportformat, scanconfig and portlist [#1934](https://github.com/greenbone/gsa/pull/1934)
- Fixed removing levels filter keyword if all severity levels are unchecked [#1869](https://github.com/greenbone/gsa/pull/1869)
- Fixed sorting of hosts in report details [#1860](https://github.com/greenbone/gsa/pull/1860)
- Fixed displaying update indication at all report details tabs [#1849](https://github.com/greenbone/gsa/pull/1849)
- Fixed getting list of Closed CVEs and sorting the Closed CVEs at report details [#1850](https://github.com/greenbone/gsa/pull/1850)
- Fixed sorting of TLS Certificates by port at report details page [#1848](https://github.com/greenbone/gsa/pull/1848)
- Use correct link for ManualIcon [#1835](https://github.com/greenbone/gsa/pull/1835)
- Fixed getting InvalidStateError with IE 11 on XHR creation [#1769](https://github.com/greenbone/gsa/pull/1769)
- Fixed filtering general command permissions in roles [#1734](https://github.com/greenbone/gsa/pull/1734)
- Fixed getting details in delta report [#1732](https://github.com/greenbone/gsa/pull/1732)
- Include results (details=1) in report download [#1731](https://github.com/greenbone/gsa/pull/1731)
- Fixed High column in hosts table for reports [#1730](https://github.com/greenbone/gsa/pull/1730)
- Fixed setting the user default filter in report results [#1699](https://github.com/greenbone/gsa/pull/1699)
- Use new model construction in some commands [#1665](https://github.com/greenbone/gsa/pull/1665)
- Fixed auth_method preselection for user dialog [#1661](https://github.com/greenbone/gsa/pull/1661)
- Fixed userId, roleId and groupId not rendering in create entity permissions dialog [#1658](https://github.com/greenbone/gsa/pull/1658)
- Don't crash Schedule details and list pages if invalid ical data is loaded [#1656](https://github.com/greenbone/gsa/pull/1656)
- Fixed showing loading indicator in content composers [#1613](https://github.com/greenbone/gsa/pull/1613)
- Enable downloading csv in table dashboard [#1611](https://github.com/greenbone/gsa/pull/1611)
- Fixed 404 URL handling in gsad which caused a XSS vulnerability [#1603](https://github.com/greenbone/gsa/pull/1603)
- Fixed status of Tickets for task.isInTrash() and isOrphan [#1592](https://github.com/greenbone/gsa/pull/1592)
- Fixed and improve editing of roles [#1587](https://github.com/greenbone/gsa/pull/1587)
- Fixed showing ScanConfig trends [#1582](https://github.com/greenbone/gsa/pull/1582) [#1554](https://github.com/greenbone/gsa/pull/1554)
- Show HostsCount at SectionTitle [#1576](https://github.com/greenbone/gsa/pull/1576)
- Fixed creating target from hosts [#1575](https://github.com/greenbone/gsa/pull/1575)
- Fixed CVSSBaseCalculatorv2 [#1572](https://github.com/greenbone/gsa/pull/1572)
- Fixed title in Operating Systems table of Reports [#1567](https://github.com/greenbone/gsa/pull/1567)
- Fixed displaying only usable report formats at report download [#1565](https://github.com/greenbone/gsa/pull/1565)
- Fixed handling schedule_periods ("once" option) in TaskDialog [#1563](https://github.com/greenbone/gsa/pull/1563)
- Fixed showing inactive VerifyIcon at ReportFormats detailspage [#1554](https://github.com/greenbone/gsa/pull/1554)
- Fixed showing SensorIcon for tasks [#1548](https://github.com/greenbone/gsa/pull/1548)
- Always show an identifier for results [#1543](https://github.com/greenbone/gsa/pull/1543)
- Don't crash Alerts listpage and trashcan when Alert data is missing [#1541](https://github.com/greenbone/gsa/pull/1541)
- Fixed calculating the next date of schedules [#1539](https://github.com/greenbone/gsa/pull/1539)
- Fixed linking to best OS in host details [#1528](https://github.com/greenbone/gsa/pull/1528)
- Redirect to root URL by default [#1517](https://github.com/greenbone/gsa/pull/1517)
- Fixed showing details for tasks [#1515](https://github.com/greenbone/gsa/pull/1515)
- Allow to use additional options for starting gsad via systemd
  [#1514](https://github.com/greenbone/gsa/pull/1514)
- Fixed using filename templates from usersettings [#1512](https://github.com/greenbone/gsa/pull/1512)
- Update manpage [#1616](https://github.com/greenbone/gsa/pull/1616)

[8.0.2]: https://github.com/greenbone/gsa/compare/v8.0.1...v8.0.2

## [8.0.1] - 2019-07-17

### Added
- Added systemd service file and logrotate config to gsad [#1486](https://github.com/greenbone/gsa/pull/1486)
- Additional report-host information [#1468](https://github.com/greenbone/gsa/pull/1468)
- New VerifyNoIcon [#1468](https://github.com/greenbone/gsa/pull/1468)
- Add tests for filter groups [#1419](https://github.com/greenbone/gsa/pull/1419)
- Add tests for severitylevelsgroup, radio button and task trend [#1413](https://github.com/greenbone/gsa/pull/1413)
- Allow to show error details [#1403](https://github.com/greenbone/gsa/pull/1403)
- Add test for solution type group [#1402](https://github.com/greenbone/gsa/pull/1402)
- Add tests for loginpage and structure components [#1390](https://github.com/greenbone/gsa/pull/1390)
- Add getAllEntities() and loadAllEntities() actions and reducers to entities store [#1345](https://github.com/greenbone/gsa/pull/1345)
- Add missing tool tips to credential download icons [#1335](https://github.com/greenbone/gsa/pull/1335)
- Add type column to scan configs to allow filter and sort by scan config type [#1331](https://github.com/greenbone/gsa/pull/1331)
- Add some tests for bar components [#1328](https://github.com/greenbone/gsa/pull/1328)
- Add new DefaultFilterSettings to UserSettings [#1326](https://github.com/greenbone/gsa/pull/1326)
- Add warning for IE11 [#1322](https://github.com/greenbone/gsa/pull/1322)
- Add tests for label and img [#1313](https://github.com/greenbone/gsa/pull/1313)
- German translation
  [#1311](https://github.com/greenbone/gsa/pull/1311),
  [#1323](https://github.com/greenbone/gsa/pull/1323),
  [#1403](https://github.com/greenbone/gsa/pull/1403)
- Add tests for comment and badge [#1309](https://github.com/greenbone/gsa/pull/1309)
- Add error dialog to fix missing error messages in trashcan [#1286](https://github.com/greenbone/gsa/pull/1286)
- Display current result, comparable result and diff between results for delta
  reports and their results in delta state "changed" [#1284](https://github.com/greenbone/gsa/pull/1284)
- Add tooltips to deactivated text fields in AlertDialog [#1269](https://github.com/greenbone/gsa/pull/1269)

### Changed
- Brand the Loading indicator [#1469](https://github.com/greenbone/gsa/pull/1469)
- Always load notes and overrides when getting results [#1446](https://github.com/greenbone/gsa/pull/1446)
- Disable some FileFields when RadioButton is not checked [#1430](https://github.com/greenbone/gsa/pull/1430)
- Change checkboxes for solution types to radio buttons [#1398](https://github.com/greenbone/gsa/pull/1398)
- Link to search in the manual for vulnerabilities [#1391](https://github.com/greenbone/gsa/pull/1391)
- Separate tasks using this scan config with commas [#1384](https://github.com/greenbone/gsa/pull/1384)
- Don't allow to verify predefined report formats [#1378](https://github.com/greenbone/gsa/pull/1378)
- Avoid storing config.js in browser cache [#1372](https://github.com/greenbone/gsa/pull/1372)
- Display data loading errors at list pages [#1349](https://github.com/greenbone/gsa/pull/1349)
- Improve login page [#1347](https://github.com/greenbone/gsa/pull/1347)
- Remove options for not implemented languages [#1344](https://github.com/greenbone/gsa/pull/1344)
- Render all dates in the current configured timezone of the user
  [#1327](https://github.com/greenbone/gsa/pull/1327),
  [#1329](https://github.com/greenbone/gsa/pull/1329),
  [#1332](https://github.com/greenbone/gsa/pull/1332)
- Change default PortList for NewTargetDialog [#1321](https://github.com/greenbone/gsa/pull/1321)
- Update dependencies of react, react-dom, react-redux and create-react-app [#1312](https://github.com/greenbone/gsa/pull/1312)
- Adjust clickable area of Select [#1296](https://github.com/greenbone/gsa/pull/1296)
- Update dialog for Task Wizard, Advanced Task Wizard and Modify Task Wizard [#1287](https://github.com/greenbone/gsa/pull/1287)
- Disable inputs for improper option selection in EmailMethodPart of
  AlertDialog [#1266](https://github.com/greenbone/gsa/pull/1266)
- Cleanup get_report function in gsad [#1263](https://github.com/greenbone/gsa/pull/1263)

### Fixed

- Displaying delta information at result details [#1499](https://github.com/greenbone/gsa/pull/1499)
- Don't crash Alerts listpage and trashcan when Alert data is missing [#1498](https://github.com/greenbone/gsa/pull/1498)
- Show full filter term in content composer [#1496](https://github.com/greenbone/gsa/pull/1496)
- Fix finding python modules
  [#1483](https://github.com/greenbone/gsa/pull/1483)
  [#1484](https://github.com/greenbone/gsa/pull/1484)
- Fix displaying schedules created during migration [#1479](https://github.com/greenbone/gsa/pull/1478)
- Fix showing Loading indicator at entities pages [#1469](https://github.com/greenbone/gsa/pull/1469)
- Show notes and overrides for results and their icon indicator in results rows [#1446](https://github.com/greenbone/gsa/pull/1446)
- Display text if gvm-libs is build without LDAP and/or Radius support [#1437](https://github.com/greenbone/gsa/pull/1437)
- Fix sending related resources in permission.create() [#1432](https://github.com/greenbone/gsa/pull/1432)
- Don't allow bulk tagging vulnerabilities [#1429](https://github.com/greenbone/gsa/pull/1429)
- Fix "given type was invalid" error for saving filters [#1428](https://github.com/greenbone/gsa/pull/1428)
- Fix parsing CVSS authentication SINGLE_INSTANCE [#1427](https://github.com/greenbone/gsa/pull/1427)
- Fix loading data on login [#1426](https://github.com/greenbone/gsa/pull/1426)
- Fix result undefined error on result details [#1423](https://github.com/greenbone/gsa/pull/1423)
- Fix showing Scanner Preferences in EditScanConfigDialog [#1420](https://github.com/greenbone/gsa/pull/1420)
- Don't crash if second result for delta is undefined [#1418](https://github.com/greenbone/gsa/pull/1418)
- Fix xml decoding issues with fast-xml-parser [#1414](https://github.com/greenbone/gsa/pull/1414)
- Fix translation for task status and task trend tooltip [#1409](https://github.com/greenbone/gsa/pull/1409)
- Fix problems with German translation in Add Dashboard dialog, SolutionTypeGroup and SeverityClassLabel [#1412](https://github.com/greenbone/gsa/pull/1412)
- Fix some translation bugs (statusbar, about page, table header tooltips)[#1407](https://github.com/greenbone/gsa/pull/1407)
- Fix checking if an entity is in use [#1406](https://github.com/greenbone/gsa/pull/1406)
- Fix "Invalid date" string for scan times [#1405](https://github.com/greenbone/gsa/pull/1405)
- Fix missing "Applied filter" message for "NVTs by Family" chart [#1404](https://github.com/greenbone/gsa/pull/1404)
- Load all filters and report formats at the report details page [#1401](https://github.com/greenbone/gsa/pull/1401)
- Fix rendering reports list page if user has no report formats [#1400](https://github.com/greenbone/gsa/pull/1400)
- Don't link to hosts not being added to the assets [#1399](https://github.com/greenbone/gsa/pull/1399)
- Fix adding and removing host assets at the report details [#1397](https://github.com/greenbone/gsa/pull/1397)
- Fix displaying the observer group name at tasks list page [#1393](https://github.com/greenbone/gsa/pull/1393)
- Improve EditScanConfigDialog performance (delete styles from svg-Icons) [#1388](https://github.com/greenbone/gsa/pull/1388)
- Fix race condition in EditUserSettingsDialog and loading all default filters [#1383](https://github.com/greenbone/gsa/pull/1383)
- Fix scheduled task tooltip time format [#1382](https://github.com/greenbone/gsa/pull/1382)
- Fix updating Titlebar after session timeout [#1377](https://github.com/greenbone/gsa/pull/1377)
- Use German manual for *DE* locale [#1372](https://github.com/greenbone/gsa/pull/1372)
- Load all container tasks for report import dialog from redux store [#1370](https://github.com/greenbone/gsa/pull/1370)
- Don't render *Invalid Date* [#1368](https://github.com/greenbone/gsa/pull/1368)
- Don't show error message after re-login [#1366](https://github.com/greenbone/gsa/pull/1366)
- Fix creating permissions in Roles dialog [#1365](https://github.com/greenbone/gsa/pull/1365)
- Fix cloning permission for Roles [#1361](https://github.com/greenbone/gsa/pull/1361)
- Use correct loaded filter in entities container [#1359](https://github.com/greenbone/gsa/pull/1359)
- Fix parsing a filter id of '0' [#1358](https://github.com/greenbone/gsa/pull/1358)
- Parse report timestamp as date object [#1357](https://github.com/greenbone/gsa/pull/1357)
- Don't crash topology chart if host has no severity [#1356](https://github.com/greenbone/gsa/pull/1356)
- Fix loading time measurements for list pages [#1352](https://github.com/greenbone/gsa/pull/1352)
- Fix rendering DateTime without dates being passed [#1343](https://github.com/greenbone/gsa/pull/1343)
- Fix restarting reload timers
  [#1341](https://github.com/greenbone/gsa/pull/1341),
  [#1351](https://github.com/greenbone/gsa/pull/1351),
  [#1389](https://github.com/greenbone/gsa/pull/1389),
  [#1396](https://github.com/greenbone/gsa/pull/1396)
- Fix list of excluded hosts formatting [#1340](https://github.com/greenbone/gsa/pull/1340)
- Fix installation of locale files [#1330](https://github.com/greenbone/gsa/pull/1330)
- Fix list of options of possible Filter types [#1326](https://github.com/greenbone/gsa/pull/1326)
- Fix timezone handling at performance page [#1325](https://github.com/greenbone/gsa/pull/1325)
- Fix creating and editing alerts without a result filter [#1315](https://github.com/greenbone/gsa/pull/1315)
- Fix filter selection at report details page [#1314](https://github.com/greenbone/gsa/pull/1314)
- Fix using default results filter at report details page
  [#1314](https://github.com/greenbone/gsa/pull/1314),
  [#1333](https://github.com/greenbone/gsa/pull/1333)
- Fix loading filters at permission list page [#1306](https://github.com/greenbone/gsa/pull/1306)
- Fix filter in Report Results view cannot be saved & Fix error for create filter with no available results [#1303](https://github.com/greenbone/gsa/pull/1303)
- Fix creating permissions via the create multiple permissions dialog [#1302](https://github.com/greenbone/gsa/pull/1302)
- Fix showing host in Scanner dialog [#1301](https://github.com/greenbone/gsa/pull/1301)
- Fix detailslinks in AllSecInfo [#1299](https://github.com/greenbone/gsa/pull/1299)
- Only run libmicrohttp in debug mode if gsad build type is debug [#1295](https://github.com/greenbone/gsa/pull/1295)
- Fix dialog can be moved outside browser frame [#1294](https://github.com/greenbone/gsa/pull/1294)
- Fix permission description [#1292](https://github.com/greenbone/gsa/pull/1292)
- Fix port ranges from file radio button [#1291](https://github.com/greenbone/gsa/pull/1291)
- Don't run more then one reload timer for a page [#1289](https://github.com/greenbone/gsa/pull/1289)
- Set first=1 when starting delta report selection [#1288](https://github.com/greenbone/gsa/pull/1288)
- Fix pagination with default filter (reset filter.id if filter is changed) [#1288](https://github.com/greenbone/gsa/pull/1288)
- Fix setting filters at report details page with less and greater then relations
  and quotes in the value [#1288](https://github.com/greenbone/gsa/pull/1288)
- Fix New Target dialog contains value from Edit Target [#1281](https://github.com/greenbone/gsa/pull/1281)
- Fix opening alert report composer [#1280](https://github.com/greenbone/gsa/pull/1280) [#1276](https://github.com/greenbone/gsa/pull/1276)
- Fix showing authentication methods in user dialog [#1278](https://github.com/greenbone/gsa/pull/1278)
- Fix Result details page [#1275](https://github.com/greenbone/gsa/pull/1275)
- Fix displaying reserved filter keywords in content composer [#1268](https://github.com/greenbone/gsa/pull/1268)
- Fix GSA version at about page [#1264](https://github.com/greenbone/gsa/pull/1264)
- Fix link to protocol documentation at about page [#1264](https://github.com/greenbone/gsa/pull/1264)
- Fix testing alerts [#1260](https://github.com/greenbone/gsa/pull/1260)
- Fix release build [#1259](https://github.com/greenbone/gsa/pull/1259), [#1265](https://github.com/greenbone/gsa/pull/1265)

### Removed
- Remove old tool tips from credential download icons because they are not visible and update new tool tips [#1338](https://github.com/greenbone/gsa/pull/1338)
- Remove sort by credential from Target view [1300](https://github.com/greenbone/gsa/pull/1300)
- Remove fifth from schedule [#1279](https://github.com/greenbone/gsa/pull/1279)
- Removed obsolete CLI arguments [#1265](https://github.com/greenbone/gsa/pull/1265)
  - --login-label
  - --http-guest-chart-frame-opts
  - --http-guest-chart-csp
  - --guest-username
  - --guest-password

[8.0.1]: https://github.com/greenbone/gsa/compare/v8.0.0...gsa-8.0

## [8.0.0] - 2018-04-05

This is the first release of the gsa module 8.0 for the Greenbone
Vulnerability Management (GVM) framework.

This release introduces an entirely re-written version of GSA with an overhauled
new user interface technology, switching from XSLT-generated web pages per
request to a single page JavaScript application. The XSLT got removed
completely and was replaced by a modern JS application allowing to add features
and usability improvements faster and easier in future.

The web server daemon (gsad) got a big code cleanup and improvements. Due to
changing to a JS application it doesn't generate any HTML code anymore. Now gsad
only ships static files and acts as some kind of http proxy between the JS
based GSA and gvmd.

Apart from this, the module covers a number of significant advances
and clean-ups compared to the previous gsa module.

### Added
- Display error message if an entity couldn't be loaded [#1252](https://github.com/greenbone/gsa/pull/1252)
- Support old secinfo URLs and redirect to replacement pages [#1247](https://github.com/greenbone/gsa/pull/1247)
- Add guest user login support [#1246](https://github.com/greenbone/gsa/pull/1246)
- Allow to set default host and operating system filters [#1243](https://github.com/greenbone/gsa/pull/1243)
- Add confirmation dialog when creating a user without a role [#1224](https://github.com/greenbone/gsa/pull/1224)
- Use dialogs to edit LDAP and RADIUS authentication [#1212](https://github.com/greenbone/gsa/pull/1212),
  [#1213](https://github.com/greenbone/gsa/pull/1213)
- Add link referencing the performance during scan time to the report details
- Allow to pass start time, end time and sensor/slave id as URL parameters to
  performance page.
- New feature: Remediation Tickets [#1126](https://github.com/greenbone/gsa/pull/1126)
- Allow to sort the nvts table at the edit scan config families dialog by
  name, oid, severity, timeout and selected [#1210](https://github.com/greenbone/gsa/pull/1210)
- Add feature: Scan Report Content Composer [#1073](https://github.com/greenbone/gsa/pull/1073),
  [#1084](https://github.com/greenbone/gsa/pull/1084), [#1086](https://github.com/greenbone/gsa/pull/1086),
  [#1090](https://github.com/greenbone/gsa/pull/1090)
- Add solution type to report details powerfilter [#1091](https://github.com/greenbone/gsa/pull/1091)
- Add Alemba vFire alert to GUI [#1100](https://github.com/greenbone/gsa/pull/1100)
- Add Sourcefire PKCS12 password support [#1150](https://github.com/greenbone/gsa/pull/1150)

### Changed
- Change order of options in target dialog [#1233](https://github.com/greenbone/gsa/pull/1233)
- Don't limit the input field lengths anymore [#1232](https://github.com/greenbone/gsa/pull/1232)
- Renamed "PGP Key" credential to "PGP Encryption Key" [#1208](https://github.com/greenbone/gsa/pull/1208)
- Sort alerts at task details alphanumerically [#1094](https://github.com/greenbone/gsa/pull/1094)
- Disable tag selection if no task should be added in create task dialog [#1220](https://github.com/greenbone/gsa/pull/1220)
- Don't show add tag fields when editing a task [#1220](https://github.com/greenbone/gsa/pull/1220)
- Use "Do not automatically delete reports" as default again in task dialog
  [#1220](https://github.com/greenbone/gsa/pull/1220)

### Fixed
- Don't crash if start or end date for performance page are invalid [#1237](https://github.com/greenbone/gsa/pull/1237)
- Convert first filter keyword values less then one to one [#1228](https://github.com/greenbone/gsa/pull/1228)
- Always use equal relation for first and rows filter keywords [#1228](https://github.com/greenbone/gsa/pull/1228)
- Fix issues with updating user authentication and logging out active
  sessions after changing the password of a user [#1159](https://github.com/greenbone/gsa/pull/1159)
- Tags can now contain backslashes, forward slashes and percent signs in the
  value as well as hyphens in the name to allow using the special task tag
  "smb-alert:file_path" [#1107](https://github.com/greenbone/gsa/pull/1107),
  [#1142](https://github.com/greenbone/gsa/pull/1142), [#1145](https://github.com/greenbone/gsa/pull/1145)
- Fix crash of Task dialog without user having get_config, get_scanner,
  get_tags and get_targets permissions [#1220](https://github.com/greenbone/gsa/pull/1220)
- Ensure host ordering is valid in task dialog [#1220](https://github.com/greenbone/gsa/pull/1220)
- Fix race condition resulting in not displaying scan config details at task
  dialog when opening the dialog for the first time [#1220](https://github.com/greenbone/gsa/pull/1220)
- Fix saving run schedule once setting from Task dialog [#1220](https://github.com/greenbone/gsa/pull/1220)
- Don't create a container task from the task dialog accidentally [#1220](https://github.com/greenbone/gsa/pull/1220)

[8.0.0]: https://github.com/greenbone/gsa/compare/v8.0+beta2...v8.0.0

## [8.0+beta2] - 2018-12-04

### Added
- Allow rename main dashboards [#1076](https://github.com/greenbone/gsa/pull/1076)
- Allow to encrypt alert emails via S/MIME and PGP [#1070](https://github.com/greenbone/gsa/pull/1070)
- New credential types S/MIME and PGP for alert email encryption [#1070](https://github.com/greenbone/gsa/pull/1070)
- Add cancel button to all dialogs [#1048](https://github.com/greenbone/gsa/pull/1048)
- Allow to store dashboard chart specific data [#1022](https://github.com/greenbone/gsa/pull/1022)
- Allow to toggle chart legend and 2D/3D view of pie charts [#989](https://github.com/greenbone/gsa/pull/989)
- Support for cmake and cmake3 executables [#936](https://github.com/greenbone/gsa/pull/926)
- Support for yarn offline mode [#935](https://github.com/greenbone/gsa/pull/935)
- Automatically logout user after session has timed out [#908](https://github.com/greenbone/gsa/pull/908)
- Adjusted auto reload interval automatically [#917](https://github.com/greenbone/gsa/pull/917)
- Allow to filter results by solution type via powerfilter dialog [#906](https://github.com/greenbone/gsa/pull/906)
- Extend the session timeout on user interaction
  [#865](https://github.com/greenbone/gsa/pull/), [#902](https://github.com/greenbone/gsa/pull/902),
  [#905](https://github.com/greenbone/gsa/pull/905)
- Added indicators for notes and overrides applied to results [#898](https://github.com/greenbone/gsa/pull/898)
- Added comments to Target table [#870](https://github.com/greenbone/gsa/pull/870)
- Added remove filter button to powerfilters [#863](https://github.com/greenbone/gsa/pull/863),
  [#893](https://github.com/greenbone/gsa/pull/893)
- Clear/Flush redux store on logout [#797](https://github.com/greenbone/gsa/pull/797)
- Allow to add multiple tags simultaneously
  [#701](https://github.com/greenbone/gsa/pull/701), [#723](https://github.com/greenbone/gsa/pull/723),
  [#728](https://github.com/greenbone/gsa/pull/728), [#748](https://github.com/greenbone/gsa/pull/748),
  [#752](https://github.com/greenbone/gsa/pull/752), [#768](https://github.com/greenbone/gsa/pull/768),
  [#771](https://github.com/greenbone/gsa/pull/771), [#786](https://github.com/greenbone/gsa/pull/786),
  [#871](https://github.com/greenbone/gsa/pull/871), [#887](https://github.com/greenbone/gsa/pull/887)
- Added host name to result hosts [#765](https://github.com/greenbone/gsa/pull/765)
- Added delta reports to alerts [#743](https://github.com/greenbone/gsa/pull/743),
  [#754](https://github.com/greenbone/gsa/pull/754)
- Extended Schedules based on ical data
  [#720](https://github.com/greenbone/gsa/pull/729), [#724](https://github.com/greenbone/gsa/pull/724),
  [#729](https://github.com/greenbone/gsa/pull/729), [#731](https://github.com/greenbone/gsa/pull/731),
  [#739](https://github.com/greenbone/gsa/pull/739)
- Allow to add Tags to scanners [#702](https://github.com/greenbone/gsa/pull/702)

### Changed
- Refined appearance of the GUI
  [#987](https://github.com/greenbone/gsa/pull/987), [#991](https://github.com/greenbone/gsa/pull/991),
  [#995](https://github.com/greenbone/gsa/pull/995), [#998](https://github.com/greenbone/gsa/pull/998),
  [#1004](https://github.com/greenbone/gsa/pull/1004), [#1021](https://github.com/greenbone/gsa/pull/1021),
  [#1025](https://github.com/greenbone/gsa/pull/1025), [#1026](https://github.com/greenbone/gsa/pull/1026),
  [#1030](https://github.com/greenbone/gsa/pull/1030), [#1037](https://github.com/greenbone/gsa/pull/1037),
  [#1043](https://github.com/greenbone/gsa/pull/1042), [#1053](https://github.com/greenbone/gsa/pull/1053),
  [#1058](https://github.com/greenbone/gsa/pull/1058)
- Don't close dialog on outer clicks [#1074](https://github.com/greenbone/gsa/pull/1074)
- New reworked icon set [#1053](https://github.com/greenbone/gsa/pull/1053)
- Don't show links to details pages for entities in Trashcan [#1035](https://github.com/greenbone/gsa/pull/1035)
- Updated and improved Line Charts [#1012](https://github.com/greenbone/gsa/pull/1012),
  [#1022](https://github.com/greenbone/gsa/pull/1022)
- Cleaned up wizards [#1001](https://github.com/greenbone/gsa/pull/1001)
- Split Results Host column into IP and Name [#999](https://github.com/greenbone/gsa/pull/999),
  [#998](https://github.com/greenbone/gsa/pull/998)
- Update to Create React App 2.0 [#997](https://github.com/greenbone/gsa/pull/997)
- Put NVT preferences into own tab on details page [#991](https://github.com/greenbone/gsa/pull/991)
- Change report summary table appearance [#991](https://github.com/greenbone/gsa/pull/991)
- Changed visual appearance of Tables [#983](https://github.com/greenbone/gsa/pull/983)
- Changed Donut Chart to a Pie Chart [#982](https://github.com/greenbone/gsa/pull/982)
- Improved visual appearance of Donut Charts while resizing [#979](https://github.com/greenbone/gsa/pull/979)
- Require NodeJS >= 8 [#964](https://github.com/greenbone/gsa/pull/964)
- Replaced glamorous with styled-components for settings styles
  [#913](https://github.com/greenbone/gsa/pull/913), [#919](https://github.com/greenbone/gsa/pull/919),
  [#922](https://github.com/greenbone/gsa/pull/922), [#924](https://github.com/greenbone/gsa/pull/924),
  [#925](https://github.com/greenbone/gsa/pull/925), [#929](https://github.com/greenbone/gsa/pull/929),
  [#934](https://github.com/greenbone/gsa/pull/934), [#938](https://github.com/greenbone/gsa/pull/938),
  [#948](https://github.com/greenbone/gsa/pull/948), [#949](https://github.com/greenbone/gsa/pull/949),
  [#950](https://github.com/greenbone/gsa/pull/950)
- Use Tabs for structuring data at User Settings [#927](https://github.com/greenbone/gsa/pull/927)
- Don't show external link dialog when clicking on Greenbone links [#904](https://github.com/greenbone/gsa/pull/904)
- Always load data into the redux store
  [#748](https://github.com/greenbone/gsa/pull/748), [#753](https://github.com/greenbone/gsa/pull/753),
  [#776](https://github.com/greenbone/gsa/pull/776), [#777](https://github.com/greenbone/gsa/pull/777),
  [#828](https://github.com/greenbone/gsa/pull/828), [#833](https://github.com/greenbone/gsa/pull/833),
  [#836](https://github.com/greenbone/gsa/pull/836), [#853](https://github.com/greenbone/gsa/pull/853),
  [#861](https://github.com/greenbone/gsa/pull/861), [#897](https://github.com/greenbone/gsa/pull/897),
  [#923](https://github.com/greenbone/gsa/pull/923), [#939](https://github.com/greenbone/gsa/pull/939)
- Improved login page layout [#859](https://github.com/greenbone/gsa/pull/859)
- Refined the menu appearance [#852](https://github.com/greenbone/gsa/pull/852),
  [#869](https://github.com/greenbone/gsa/pull/869)
- Reduced default max height for dialogs to 400px [#843](https://github.com/greenbone/gsa/pull/843)
- Show Report page header before report is loaded [#825](https://github.com/greenbone/gsa/pull/825)
- Renamed Task status "Internal Error" to "Interrupted" [#718](https://github.com/greenbone/gsa/pull/718),
  [#719](https://github.com/greenbone/gsa/pull/719)

### Fixed
- Fixed displaying the Observer icon [#1053](https://github.com/greenbone/gsa/pull/1053)
- Don't crash GSA completely if an unexpected error did occur [#1046](https://github.com/greenbone/gsa/pull/1046)
- Fix saving nvt preferences in gsad [#1045](https://github.com/greenbone/gsa/pull/1045)
- Fix "Current User" inheritance on "Delete User" [#1038](https://github.com/greenbone/gsa/pull/1038)
- Set min size for Line Charts and reduce number of x-axis labels to not
  overlap [#977](https://github.com/greenbone/gsa/pull/977)
- Don't set an unknown locale [#966](https://github.com/greenbone/gsa/pull/966)
- Fixed sorting of tables at Report details [#929](https://github.com/greenbone/gsa/pull/929)
- Fixed saving the default severity [#907](https://github.com/greenbone/gsa/pull/907)
- Fixed displaying Nvt tags [#880](https://github.com/greenbone/gsa/pull/880)
- Update locales if they are changed at the User Settings [#856](https://github.com/greenbone/gsa/pull/856)
- Don't show default dashboard if settings haven't been loaded yet [#714](https://github.com/greenbone/gsa/pull/714)

### Removed
- Remove max length of hosts for notes and overrides [#1033](https://github.com/greenbone/gsa/pull/1033)
- Removed Scan, Asset, SecInfo Dashboards and added Dashboard "templates" to
  the main dashboard [#974](https://github.com/greenbone/gsa/pull/974)
- Removed Dashboard Display menus with an icon overlay [#971](https://github.com/greenbone/gsa/pull/971),
  [#972](https://github.com/greenbone/gsa/pull/972)
- Removed sticky menu in header [#857](https://github.com/greenbone/gsa/pull/857)
- Removed support for severity class OpenVAS Classic [#709](https://github.com/greenbone/gsa/pull/709)

[8.0+beta2]: https://github.com/greenbone/gsa/compare/v8.0+beta1...v8.0+beta2

## [8.0+beta1] - 2018-05-25

This is the first beta release of the gsa module 8.0 for the Greenbone
Vulnerability Management (GVM) framework.

This release introduces an entirely re-written version of GSA with an overhauled
new user interface technology, switching from XSLT-generated web pages per
request to a single page JavaScript application. The XSLT got removed
completely and was replaced by a modern JS application allowing to add features
and usability improvements faster and easier in future.

The web server daemon (gsad) got a big code cleanup and improvements. Due to
changing to a JS application it doesn't generate any HTML code anymore. Now gsad
only ships static files and acts as some kind of http proxy between the JS
based GSA and gvmd.

Apart from this, the module covers a number of significant advances
and clean-ups compared to the previous gsa module.

### Added
- The 'excluded' list option when a New Target is created has been added.
- New view on scan results by vulnerability has been added.
- A link to Scanconfigs from scanner details has been added.
- Multiple dashboards can be defined by the user at the main entry page.

### Changed
- The web user interface has been transformed into a single page application
  which is loaded once and then only updates the in-browser data from the
  server.
- All data loading processes are asynchronous and don't block the GUI from
  reacting to user input.
- Refreshing of data is done in the background now. Therefore the user doesn't
  need to specify a refresh rate anymore.
- The extra help pages has been replaced by links to the documentation.
- The edit dialog for overrides and notes has been improved and is now more
  flexible.
- The report details view has been overhauled.
- nodejs >= 6 is required to generate the new JS based version of GSA.
- npm or yarn is required for installing the JavaScript dependencies.
- Minimum required version of glib has been raised to 2.42.
- Minimum required version of cmake has been raised to 3.0.

### Removed
- The its "face" has been removed.
- The 'classic hosts' asset has been removed.
- The edit mode of the dashboards has been removed. Dashboards are always
  editable now.
- libxslt is no longer required because all XSLT has been removed.
- The required minimum version of new dependency GVM Libraries is 1.0 and
  the dependency to the openvas-libraries module has been removed. Therefore
  many include directives have been adapted to the new source code.

[8.0+beta1]: https://github.com/greenbone/gsa/compare/gsa-7.0...v8.0+beta1
