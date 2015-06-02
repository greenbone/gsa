<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    version="1.0">

<!--
Greenbone Security Assistant
$Id$
Description: Dummy stylesheet for dynamic strings in other stylesheets.

Authors:
Timo Pollmeier <timo.pollmeier@greenbone.net>

Copyright:
Copyright (C) 2015 Greenbone Networks GmbH

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
-->

<!--
  This stylesheet is a helper file for generating translation template (pot)
  files and contains commonly used strings that cannot be extracted literally
  from the other stylesheets as they are passed to the i18n function
  as variables or function return values.

  This file is not used for any actual transformations.
-->

<!--
  Messages generated internally
-->

<!-- Login page messages generated internally -->
<xsl:template name="login-msgs">
  <xsl:value-of select="gsa:i18n ('Successfully logged out.', 'Login')"/>
  <xsl:value-of select="gsa:i18n ('Already logged out.', 'Login')"/>
  <xsl:value-of select="gsa:i18n ('Logged out. OMP service is down.', 'Login')"/>
  <xsl:value-of select="gsa:i18n ('Login failed.', 'Login')"/>
  <xsl:value-of select="gsa:i18n ('Login failed.  OMP service is down.', 'Login')"/>
  <xsl:value-of select="gsa:i18n ('Login failed.  Error during authentication.', 'Login')"/>
  <xsl:value-of select="gsa:i18n ('Session has expired.  Please login again.', 'Login')"/>
  <xsl:value-of select="gsa:i18n ('Cookie missing or bad.  Please login again.', 'Login')"/>
  <xsl:value-of select="gsa:i18n ('Token missing or bad.  Please login again.', 'Login')"/>
</xsl:stylesheet>


<!--
  Strings where resource types are inserted
-->

<!-- A singular resource type name like "Task" -->
<xsl:template name="type-name">
  <xsl:value-of select="gsa:i18n ('Task', 'Task')"/>
  <xsl:value-of select="gsa:i18n ('Note', 'Note')"/>
  <xsl:value-of select="gsa:i18n ('Override', 'Override')"/>
  <xsl:value-of select="gsa:i18n ('NVT', 'NVT')"/>
  <xsl:value-of select="gsa:i18n ('CVE', 'CVE')"/>
  <xsl:value-of select="gsa:i18n ('CPE', 'CPE')"/>
  <xsl:value-of select="gsa:i18n ('OVAL Definition', 'OVAL Definition')"/>
  <xsl:value-of select="gsa:i18n ('CERT-Bund Advisory', 'CERT-Bund Advisory')"/>
  <xsl:value-of select="gsa:i18n ('DFN-CERT Advisory', 'DFN-CERT Advisory')"/>
  <xsl:value-of select="gsa:i18n ('Target', 'Target')"/>
  <xsl:value-of select="gsa:i18n ('Port List', 'Port List')"/>
  <xsl:value-of select="gsa:i18n ('Credential', 'Credential')"/>
  <xsl:value-of select="gsa:i18n ('Scan Config', 'Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('Alert', 'Alert')"/>
  <xsl:value-of select="gsa:i18n ('Schedule', 'Schedule')"/>
  <xsl:value-of select="gsa:i18n ('Report Format', 'Report Format')"/>
  <xsl:value-of select="gsa:i18n ('Slave', 'Slave')"/>
  <xsl:value-of select="gsa:i18n ('Agent', 'Agent')"/>
  <xsl:value-of select="gsa:i18n ('Scanner', 'Scanner')"/>
  <xsl:value-of select="gsa:i18n ('Filter', 'Filter')"/>
  <xsl:value-of select="gsa:i18n ('Tag', 'Tag')"/>
  <xsl:value-of select="gsa:i18n ('Permission', 'Permission')"/>
  <xsl:value-of select="gsa:i18n ('User', 'User')"/>
  <xsl:value-of select="gsa:i18n ('Group', 'Group')"/>
  <xsl:value-of select="gsa:i18n ('Role', 'Role')"/>
</xsl:stylesheet>

<!-- A plural resource type name like "Tasks" -->
<xsl:template name="type-name">
  <xsl:value-of select="gsa:i18n ('Tasks', 'Task')"/>
  <xsl:value-of select="gsa:i18n ('Notes', 'Note')"/>
  <xsl:value-of select="gsa:i18n ('Overrides', 'Override')"/>
  <xsl:value-of select="gsa:i18n ('NVTs', 'NVT')"/>
  <xsl:value-of select="gsa:i18n ('CVEs', 'CVE')"/>
  <xsl:value-of select="gsa:i18n ('CPEs', 'CPE')"/>
  <xsl:value-of select="gsa:i18n ('OVAL Definitions', 'OVAL Definition')"/>
  <xsl:value-of select="gsa:i18n ('CERT-Bund Advisories', 'CERT-Bund Advisory')"/>
  <xsl:value-of select="gsa:i18n ('DFN-CERT Advisories', 'DFN-CERT Advisory')"/>
  <xsl:value-of select="gsa:i18n ('All SecInfo Information', 'All SecInfo Information')"/>
  <xsl:value-of select="gsa:i18n ('Targets', 'Target')"/>
  <xsl:value-of select="gsa:i18n ('Port Lists', 'Port List')"/>
  <xsl:value-of select="gsa:i18n ('Credentials', 'Credential')"/>
  <xsl:value-of select="gsa:i18n ('Scan Configs', 'Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('Alerts', 'Alert')"/>
  <xsl:value-of select="gsa:i18n ('Schedules', 'Schedule')"/>
  <xsl:value-of select="gsa:i18n ('Report Formats', 'Report Format')"/>
  <xsl:value-of select="gsa:i18n ('Slaves', 'Slave')"/>
  <xsl:value-of select="gsa:i18n ('Agents', 'Agent')"/>
  <xsl:value-of select="gsa:i18n ('Scanners', 'Scanner')"/>
  <xsl:value-of select="gsa:i18n ('Filters', 'Filter')"/>
  <xsl:value-of select="gsa:i18n ('Tags', 'Tag')"/>
  <xsl:value-of select="gsa:i18n ('Permissions', 'Permission')"/>
  <xsl:value-of select="gsa:i18n ('Users', 'User')"/>
  <xsl:value-of select="gsa:i18n ('Groups', 'Group')"/>
  <xsl:value-of select="gsa:i18n ('Roles', 'Role')"/>
</xsl:stylesheet>

<!-- A details label like "Task Details" -->
<xsl:template name="type-name">
  <xsl:value-of select="gsa:i18n ('Task Details', 'Task')"/>
  <xsl:value-of select="gsa:i18n ('Note Details', 'Note')"/>
  <xsl:value-of select="gsa:i18n ('Override Details', 'Override')"/>
  <xsl:value-of select="gsa:i18n ('NVT Details', 'NVT')"/>
  <xsl:value-of select="gsa:i18n ('CVE Details', 'CVE')"/>
  <xsl:value-of select="gsa:i18n ('CPE Details', 'CPE')"/>
  <xsl:value-of select="gsa:i18n ('OVAL Definition Details', 'OVAL Definition')"/>
  <xsl:value-of select="gsa:i18n ('CERT-Bund Advisory Details', 'CERT-Bund Advisory')"/>
  <xsl:value-of select="gsa:i18n ('DFN-CERT Advisory Details', 'DFN-CERT Advisory')"/>
  <xsl:value-of select="gsa:i18n ('Target Details', 'Target')"/>
  <xsl:value-of select="gsa:i18n ('Port List Details', 'Port List')"/>
  <xsl:value-of select="gsa:i18n ('Credential Details', 'Credential')"/>
  <xsl:value-of select="gsa:i18n ('Scan Config Details', 'Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('Alert Details', 'Alert')"/>
  <xsl:value-of select="gsa:i18n ('Schedule Details', 'Schedule')"/>
  <xsl:value-of select="gsa:i18n ('Report Format Details', 'Report Format')"/>
  <xsl:value-of select="gsa:i18n ('Slave Details', 'Slave')"/>
  <xsl:value-of select="gsa:i18n ('Agent Details', 'Agent')"/>
  <xsl:value-of select="gsa:i18n ('Scanner Details', 'Scanner')"/>
  <xsl:value-of select="gsa:i18n ('Filter Details', 'Filter')"/>
  <xsl:value-of select="gsa:i18n ('Tag Details', 'Tag')"/>
  <xsl:value-of select="gsa:i18n ('Permission Details', 'Permission')"/>
  <xsl:value-of select="gsa:i18n ('User Details', 'User')"/>
  <xsl:value-of select="gsa:i18n ('Group Details', 'Group')"/>
  <xsl:value-of select="gsa:i18n ('Role Details', 'Role')"/>
</xsl:stylesheet>

<!-- A filter label like "Task Filter" -->
<xsl:template name="type-name">
  <xsl:value-of select="gsa:i18n ('Task Filter', 'Task')"/>
  <xsl:value-of select="gsa:i18n ('Note Filter', 'Note')"/>
  <xsl:value-of select="gsa:i18n ('Override Filter', 'Override')"/>
  <xsl:value-of select="gsa:i18n ('NVT Filter', 'NVT')"/>
  <xsl:value-of select="gsa:i18n ('CVE Filter', 'CVE')"/>
  <xsl:value-of select="gsa:i18n ('CPE Filter', 'CPE')"/>
  <xsl:value-of select="gsa:i18n ('OVAL Filter', 'OVAL Definition')"/>
  <xsl:value-of select="gsa:i18n ('CERT-Bund Filter', 'CERT-Bund Advisory')"/>
  <xsl:value-of select="gsa:i18n ('DFN-CERT Filter', 'DFN-CERT Advisory')"/>
  <xsl:value-of select="gsa:i18n ('Info Filter', 'Info')"/>
  <xsl:value-of select="gsa:i18n ('All SecInfo Filter', 'Info')"/>
  <xsl:value-of select="gsa:i18n ('Target Filter', 'Target')"/>
  <xsl:value-of select="gsa:i18n ('Port List Filter', 'Port List')"/>
  <xsl:value-of select="gsa:i18n ('Credential Filter', 'Credential')"/>
  <xsl:value-of select="gsa:i18n ('Scan Config Filter', 'Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('Alert Filter', 'Alert')"/>
  <xsl:value-of select="gsa:i18n ('Schedule Filter', 'Schedule')"/>
  <xsl:value-of select="gsa:i18n ('Report Format Filter', 'Report Format')"/>
  <xsl:value-of select="gsa:i18n ('Slave Filter', 'Slave')"/>
  <xsl:value-of select="gsa:i18n ('Agent Filter', 'Agent')"/>
  <xsl:value-of select="gsa:i18n ('Scanner Filter', 'Scanner')"/>
  <xsl:value-of select="gsa:i18n ('Filter Filter', 'Filter')"/>
  <xsl:value-of select="gsa:i18n ('Tag Filter', 'Tag')"/>
  <xsl:value-of select="gsa:i18n ('Permission Filter', 'Permission')"/>
  <xsl:value-of select="gsa:i18n ('User Filter', 'User')"/>
  <xsl:value-of select="gsa:i18n ('Group Filter', 'Group')"/>
  <xsl:value-of select="gsa:i18n ('Role Filter', 'Role')"/>
</xsl:stylesheet>

<!-- "New ..." label like "New Task" -->
<xsl:template name="type-new">
  <xsl:value-of select="gsa:i18n ('New Task', 'Task')"/>
  <xsl:value-of select="gsa:i18n ('New Note', 'Note')"/>
  <xsl:value-of select="gsa:i18n ('New Override', 'Override')"/>
  <xsl:value-of select="gsa:i18n ('New Target', 'Target')"/>
  <xsl:value-of select="gsa:i18n ('New Port List', 'Port List')"/>
  <xsl:value-of select="gsa:i18n ('New Credential', 'Credential')"/>
  <xsl:value-of select="gsa:i18n ('New Scan Config', 'Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('New Alert', 'Alert')"/>
  <xsl:value-of select="gsa:i18n ('New Schedule', 'Schedule')"/>
  <xsl:value-of select="gsa:i18n ('New Report Format', 'Report Format')"/>
  <xsl:value-of select="gsa:i18n ('New Slave', 'Slave')"/>
  <xsl:value-of select="gsa:i18n ('New Agent', 'Agent')"/>
  <xsl:value-of select="gsa:i18n ('New Scanner', 'Scanner')"/>
  <xsl:value-of select="gsa:i18n ('New Filter', 'Filter')"/>
  <xsl:value-of select="gsa:i18n ('New Tag', 'Tag')"/>
  <xsl:value-of select="gsa:i18n ('New Permission', 'Permission')"/>
  <xsl:value-of select="gsa:i18n ('New User', 'User')"/>
  <xsl:value-of select="gsa:i18n ('New Group', 'Group')"/>
  <xsl:value-of select="gsa:i18n ('New Role', 'Role')"/>
</xsl:stylesheet>

<!-- "Edit ..." label like "Edit Task" -->
<xsl:template name="type-new">
  <xsl:value-of select="gsa:i18n ('Edit Task', 'Task')"/>
  <xsl:value-of select="gsa:i18n ('Edit Note', 'Note')"/>
  <xsl:value-of select="gsa:i18n ('Edit Override', 'Override')"/>
  <xsl:value-of select="gsa:i18n ('Edit Target', 'Target')"/>
  <xsl:value-of select="gsa:i18n ('Edit Port List', 'Port List')"/>
  <xsl:value-of select="gsa:i18n ('Edit Credential', 'Credential')"/>
  <xsl:value-of select="gsa:i18n ('Edit Scan Config', 'Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('Edit Alert', 'Alert')"/>
  <xsl:value-of select="gsa:i18n ('Edit Schedule', 'Schedule')"/>
  <xsl:value-of select="gsa:i18n ('Edit Report Format', 'Report Format')"/>
  <xsl:value-of select="gsa:i18n ('Edit Slave', 'Slave')"/>
  <xsl:value-of select="gsa:i18n ('Edit Agent', 'Agent')"/>
  <xsl:value-of select="gsa:i18n ('Edit Scanner', 'Scanner')"/>
  <xsl:value-of select="gsa:i18n ('Edit Filter', 'Filter')"/>
  <xsl:value-of select="gsa:i18n ('Edit Tag', 'Tag')"/>
  <xsl:value-of select="gsa:i18n ('Edit Permission', 'Permission')"/>
  <xsl:value-of select="gsa:i18n ('Edit User', 'User')"/>
  <xsl:value-of select="gsa:i18n ('Edit Group', 'Group')"/>
  <xsl:value-of select="gsa:i18n ('Edit Role', 'Role')"/>
</xsl:stylesheet>


<!--
  Permission descriptions
-->
<xsl:template name="permission-descriptions">
  <!-- super -->
  <xsl:value-of select="gsa:i18n ('has super access', 'Permission description')"/>
  <!-- authenticate -->
  <xsl:value-of select="gsa:i18n ('may login', 'Permission description')"/>
  <!-- commands -->
  <xsl:value-of select="gsa:i18n ('may run multiple OMP commands as one', 'Permission description')"/>

  <!-- create_... -->
  <xsl:value-of select="gsa:i18n ('may create a new agent', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new alert', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new scan config', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new filter', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new group', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new credential', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new note', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new override', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new permission', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new port list', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new port range', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new report', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new report format', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new role', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new scanner', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new schedule', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new slave', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new tag', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new target', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new task', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new user', 'Permission description')"/>

  <!-- delete_... -->
  <xsl:value-of select="gsa:i18n ('may delete an existing agent', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing alert', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing scan config', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing filter', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing group', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing credential', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing note', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing override', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing permission', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing port list', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing port range', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing report', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing report format', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing role', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing scanner', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing schedule', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing slave', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing tag', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing target', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing task', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing user', 'Permission description')"/>

  <!-- describe_... -->
  <xsl:value-of select="gsa:i18n ('may get details about the authentication configuration', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may get details about the CERT feed', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may get details about the NVT feed', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may get details about the SCAP feed', 'Permission description')"/>

  <!-- empty_trashcan -->
  <xsl:value-of select="gsa:i18n ('may empty the trashcan', 'Permission description')"/>

  <!-- get_... -->
  <xsl:value-of select="gsa:i18n ('has read access to agents', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to alerts', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to scan configs', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to filters', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to groups', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to SecInfo', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to credentials', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to notes', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to NVTs', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to NVT families', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may get NVT feed version information', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to overrides', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to permissions', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to port lists', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to port ranges', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to reports', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to report formats', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to roles', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to scanners', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to schedules', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to slaves', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to system reports', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to tags', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to targets', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to tasks', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to users', 'Permission description')"/>

  <!-- help -->
  <xsl:value-of select="gsa:i18n ('may get the help text', 'Permission description')"/>

  <!-- modify_... -->
  <xsl:value-of select="gsa:i18n ('has write access to agents', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to alerts', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to the authentication configuration', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to scan configs', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to filters', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to groups', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to credentials', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to notes', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to overrides', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to permissions', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to port lists', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to port ranges', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to reports', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to report formats', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to roles', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to scanners', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to schedules', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to slaves', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to system reports', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to tags', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to targets', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to tasks', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to users', 'Permission description')"/>

  <!-- restore -->
  <xsl:value-of select="gsa:i18n ('may restore items from the trashcan', 'Permission description')"/>

  <!-- resume_task -->
  <xsl:value-of select="gsa:i18n ('may resume tasks', 'Permission description')"/>

  <!-- run_wizard -->
  <xsl:value-of select="gsa:i18n ('may run wizards', 'Permission description')"/>

  <!-- start_task -->
  <xsl:value-of select="gsa:i18n ('may start tasks', 'Permission description')"/>

  <!-- stop_task -->
  <xsl:value-of select="gsa:i18n ('may stop tasks', 'Permission description')"/>

  <!-- sync_... -->
  <xsl:value-of select="gsa:i18n ('may sync the CERT feed', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may sync the NVT feed', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may sync the SCAP feed', 'Permission description')"/>

  <!-- test_alert -->
  <xsl:value-of select="gsa:i18n ('may test alerts', 'Permission description')"/>

  <!-- verify_... -->
  <xsl:value-of select="gsa:i18n ('may verify agents', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may verify report formats', 'Permission description')"/>
  <xsl:value-of select="gsa:i18n ('may verify scanners', 'Permission description')"/>

</xsl:stylesheet>