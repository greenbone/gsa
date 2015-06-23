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
  <xsl:value-of select="gsa:i18n ('Successfully logged out.', 'Login Message')"/>
  <xsl:value-of select="gsa:i18n ('Already logged out.', 'Login Message')"/>
  <xsl:value-of select="gsa:i18n ('Logged out. OMP service is down.', 'Login Message')"/>
  <xsl:value-of select="gsa:i18n ('Login failed.', 'Login Message')"/>
  <xsl:value-of select="gsa:i18n ('Login failed.  OMP service is down.', 'Login Message')"/>
  <xsl:value-of select="gsa:i18n ('Login failed.  Error during authentication.', 'Login Message')"/>
  <xsl:value-of select="gsa:i18n ('Session has expired.  Please login again.', 'Login Message')"/>
  <xsl:value-of select="gsa:i18n ('Cookie missing or bad.  Please login again.', 'Login Message')"/>
  <xsl:value-of select="gsa:i18n ('Token missing or bad.  Please login again.', 'Login Message')"/>
</xsl:template>


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
  <xsl:value-of select="gsa:i18n ('Config', 'Config')"/>
  <xsl:value-of select="gsa:i18n ('Scan Config', 'Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('Scan Configuration', 'Scan Configuration')"/>
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
</xsl:template>

<!-- A plural resource type name like "Tasks" -->
<xsl:template name="type-name-plural">
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
  <xsl:value-of select="gsa:i18n ('Configs', 'Config')"/>
  <xsl:value-of select="gsa:i18n ('Scan Configs', 'Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('Scan Configurations', 'Scan Configuration')"/>
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
</xsl:template>

<!-- A resource type global label like "Global Task" -->
<xsl:template name="type-global">
  <xsl:value-of select="gsa:i18n ('Global Task', 'Task')"/>
  <xsl:value-of select="gsa:i18n ('Global Note', 'Note')"/>
  <xsl:value-of select="gsa:i18n ('Global Override', 'Override')"/>
  <xsl:value-of select="gsa:i18n ('Global Target', 'Target')"/>
  <xsl:value-of select="gsa:i18n ('Global Port List', 'Port List')"/>
  <xsl:value-of select="gsa:i18n ('Global Credential', 'Credential')"/>
  <xsl:value-of select="gsa:i18n ('Global Config', 'Config')"/>
  <xsl:value-of select="gsa:i18n ('Global Scan Config', 'Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('Global Scan Configuration', 'Scan Configuration')"/>
  <xsl:value-of select="gsa:i18n ('Global Alert', 'Alert')"/>
  <xsl:value-of select="gsa:i18n ('Global Schedule', 'Schedule')"/>
  <xsl:value-of select="gsa:i18n ('Global Report Format', 'Report Format')"/>
  <xsl:value-of select="gsa:i18n ('Global Slave', 'Slave')"/>
  <xsl:value-of select="gsa:i18n ('Global Agent', 'Agent')"/>
  <xsl:value-of select="gsa:i18n ('Global Scanner', 'Scanner')"/>
  <xsl:value-of select="gsa:i18n ('Global Filter', 'Filter')"/>
  <xsl:value-of select="gsa:i18n ('Global Tag', 'Tag')"/>
  <xsl:value-of select="gsa:i18n ('Global Permission', 'Permission')"/>
  <xsl:value-of select="gsa:i18n ('Global User', 'User')"/>
  <xsl:value-of select="gsa:i18n ('Global Group', 'Group')"/>
  <xsl:value-of select="gsa:i18n ('Global Role', 'Role')"/>
</xsl:template>

<!-- A resource type "owned by" label like "Task owned by User123" -->
<xsl:template name="type-owned">
  <xsl:value-of select="gsa:i18n ('Task owned by %1', 'Task')"/>
  <xsl:value-of select="gsa:i18n ('Report owned by %1', 'Report')"/>
  <xsl:value-of select="gsa:i18n ('Result owned by %1', 'Result')"/>
  <xsl:value-of select="gsa:i18n ('Note owned by %1', 'Note')"/>
  <xsl:value-of select="gsa:i18n ('Override owned by %1', 'Override')"/>
  <xsl:value-of select="gsa:i18n ('Target owned by %1', 'Target')"/>
  <xsl:value-of select="gsa:i18n ('Port List owned by %1', 'Port List')"/>
  <xsl:value-of select="gsa:i18n ('Credential owned by %1', 'Credential')"/>
  <xsl:value-of select="gsa:i18n ('Scan Config owned by %1', 'Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('Alert owned by %1', 'Alert')"/>
  <xsl:value-of select="gsa:i18n ('Schedule owned by %1', 'Schedule')"/>
  <xsl:value-of select="gsa:i18n ('Report Format owned by %1', 'Report Format')"/>
  <xsl:value-of select="gsa:i18n ('Slave owned by %1', 'Slave')"/>
  <xsl:value-of select="gsa:i18n ('Agent owned by %1', 'Agent')"/>
  <xsl:value-of select="gsa:i18n ('Scanner owned by %1', 'Scanner')"/>
  <xsl:value-of select="gsa:i18n ('Filter owned by %1', 'Filter')"/>
  <xsl:value-of select="gsa:i18n ('Tag owned by %1', 'Tag')"/>
  <xsl:value-of select="gsa:i18n ('Permission owned by %1', 'Permission')"/>
  <xsl:value-of select="gsa:i18n ('User owned by %1', 'User')"/>
  <xsl:value-of select="gsa:i18n ('Group owned by %1', 'Group')"/>
  <xsl:value-of select="gsa:i18n ('Role owned by %1', 'Role')"/>
</xsl:template>

<!-- A details label like "Task Details" -->
<xsl:template name="type-details">
  <xsl:value-of select="gsa:i18n ('Task Details', 'Task')"/>
  <xsl:value-of select="gsa:i18n ('Report Details', 'Report')"/>
  <xsl:value-of select="gsa:i18n ('Host Details', 'Host')"/>
  <xsl:value-of select="gsa:i18n ('Result Details', 'Result')"/>
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
</xsl:template>

<!-- A long details label like "View details of Task SomeTask" -->
<xsl:template name="type-details-long">
  <xsl:value-of select="gsa:i18n ('View details of Task %1', 'Task')"/>
  <xsl:value-of select="gsa:i18n ('View details of Report %1', 'Report')"/>
  <xsl:value-of select="gsa:i18n ('View details of Host %1', 'Host')"/>
  <xsl:value-of select="gsa:i18n ('View details of Result %1', 'Result')"/>
  <xsl:value-of select="gsa:i18n ('View details of Note %1', 'Note')"/>
  <xsl:value-of select="gsa:i18n ('View details of Override %1', 'Override')"/>
  <xsl:value-of select="gsa:i18n ('View details of NVT %1', 'NVT')"/>
  <xsl:value-of select="gsa:i18n ('View details of CVE %1', 'CVE')"/>
  <xsl:value-of select="gsa:i18n ('View details of CPE %1', 'CPE')"/>
  <xsl:value-of select="gsa:i18n ('View details of OVAL Definition %1', 'OVAL Definition')"/>
  <xsl:value-of select="gsa:i18n ('View details of CERT-Bund Advisory %1', 'CERT-Bund Advisory')"/>
  <xsl:value-of select="gsa:i18n ('View details of DFN-CERT Advisory %1', 'DFN-CERT Advisory')"/>
  <xsl:value-of select="gsa:i18n ('View details of Target %1', 'Target')"/>
  <xsl:value-of select="gsa:i18n ('View details of Port List %1', 'Port List')"/>
  <xsl:value-of select="gsa:i18n ('View details of Credential %1', 'Credential')"/>
  <xsl:value-of select="gsa:i18n ('View details of Scan Config %1', 'Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('View details of Alert %1', 'Alert')"/>
  <xsl:value-of select="gsa:i18n ('View details of Schedule %1', 'Schedule')"/>
  <xsl:value-of select="gsa:i18n ('View details of Report Format %1', 'Report Format')"/>
  <xsl:value-of select="gsa:i18n ('View details of Slave %1', 'Slave')"/>
  <xsl:value-of select="gsa:i18n ('View details of Agent %1', 'Agent')"/>
  <xsl:value-of select="gsa:i18n ('View details of Scanner %1', 'Scanner')"/>
  <xsl:value-of select="gsa:i18n ('View details of Filter %1', 'Filter')"/>
  <xsl:value-of select="gsa:i18n ('View details of Tag %1', 'Tag')"/>
  <xsl:value-of select="gsa:i18n ('View details of Permission %1', 'Permission')"/>
  <xsl:value-of select="gsa:i18n ('View details of User %1', 'User')"/>
  <xsl:value-of select="gsa:i18n ('View details of Group %1', 'Group')"/>
  <xsl:value-of select="gsa:i18n ('View details of Role %1', 'Role')"/>
</xsl:template>

<!--  A single resource export like "Export Task" -->
<xsl:template name="type-export">
  <xsl:value-of select="gsa:i18n ('Export Task', 'Task')"/>
  <xsl:value-of select="gsa:i18n ('Export Note', 'Note')"/>
  <xsl:value-of select="gsa:i18n ('Export Override', 'Override')"/>
  <xsl:value-of select="gsa:i18n ('Export Target', 'Target')"/>
  <xsl:value-of select="gsa:i18n ('Export Port List', 'Port List')"/>
  <xsl:value-of select="gsa:i18n ('Export Credential', 'Credential')"/>
  <xsl:value-of select="gsa:i18n ('Export Scan Config', 'Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('Export Alert', 'Alert')"/>
  <xsl:value-of select="gsa:i18n ('Export Schedule', 'Schedule')"/>
  <xsl:value-of select="gsa:i18n ('Export Report Format', 'Report Format')"/>
  <xsl:value-of select="gsa:i18n ('Export Slave', 'Slave')"/>
  <xsl:value-of select="gsa:i18n ('Export Agent', 'Agent')"/>
  <xsl:value-of select="gsa:i18n ('Export Scanner', 'Scanner')"/>
  <xsl:value-of select="gsa:i18n ('Export Filter', 'Filter')"/>
  <xsl:value-of select="gsa:i18n ('Export Tag', 'Tag')"/>
  <xsl:value-of select="gsa:i18n ('Export Permission', 'Permission')"/>
  <xsl:value-of select="gsa:i18n ('Export User', 'User')"/>
  <xsl:value-of select="gsa:i18n ('Export Group', 'Group')"/>
  <xsl:value-of select="gsa:i18n ('Export Role', 'Role')"/>
</xsl:template>

<!--  A single resource export like "Export Task as XML" -->
<xsl:template name="type-export-xml">
  <xsl:value-of select="gsa:i18n ('Export Task as XML', 'Task')"/>
  <xsl:value-of select="gsa:i18n ('Export Note as XML', 'Note')"/>
  <xsl:value-of select="gsa:i18n ('Export Override as XML', 'Override')"/>
  <xsl:value-of select="gsa:i18n ('Export Target as XML', 'Target')"/>
  <xsl:value-of select="gsa:i18n ('Export Port List as XML', 'Port List')"/>
  <xsl:value-of select="gsa:i18n ('Export Credential as XML', 'Credential')"/>
  <xsl:value-of select="gsa:i18n ('Export Scan Config as XML', 'Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('Export Alert as XML', 'Alert')"/>
  <xsl:value-of select="gsa:i18n ('Export Schedule as XML', 'Schedule')"/>
  <xsl:value-of select="gsa:i18n ('Export Report Format as XML', 'Report Format')"/>
  <xsl:value-of select="gsa:i18n ('Export Slave as XML', 'Slave')"/>
  <xsl:value-of select="gsa:i18n ('Export Agent as XML', 'Agent')"/>
  <xsl:value-of select="gsa:i18n ('Export Scanner as XML', 'Scanner')"/>
  <xsl:value-of select="gsa:i18n ('Export Filter as XML', 'Filter')"/>
  <xsl:value-of select="gsa:i18n ('Export Tag as XML', 'Tag')"/>
  <xsl:value-of select="gsa:i18n ('Export Permission as XML', 'Permission')"/>
  <xsl:value-of select="gsa:i18n ('Export User as XML', 'User')"/>
  <xsl:value-of select="gsa:i18n ('Export Group as XML', 'Group')"/>
  <xsl:value-of select="gsa:i18n ('Export Role as XML', 'Role')"/>
</xsl:template>

<!-- A multiple resource export like "Export 10 filtered Tasks as XML" -->
<xsl:template name="type-export-multiple-filtered-xml">
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Task as XML', 'Export %1 filtered Tasks as XML', 0, 'Task')"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Note as XML', 'Export %1 filtered Notes as XML', 0, 'Note')"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Override as XML', 'Export %1 filtered Overrides as XML', 0, 'Override')"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Target as XML', 'Export %1 filtered Targets as XML', 0, 'Target')"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Port List as XML', 'Export %1 filtered Port Lists as XML', 0, 'Port List')"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Credential as XML', 'Export %1 filtered Credentials as XML', 0, 'Credential')"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Scan Config as XML', 'Export %1 filtered Scan Configs as XML', 0, 'Scan Config')"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Alert as XML', 'Export %1 filtered Alerts as XML', 0, 'Alert')"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Schedule as XML', 'Export %1 filtered Schedules as XML', 0, 'Schedule')"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Report Format as XML', 'Export %1 filtered Report Formats as XML', 0, 'Report Format')"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Slave as XML', 'Export %1 filtered Slaves as XML', 0, 'Slave')"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Agent as XML', 'Export %1 filtered Agents as XML', 0, 'Agent')"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Scanner as XML', 'Export %1 filtered Scanners as XML', 0, 'Scanner')"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Filter as XML', 'Export %1 filtered Filters as XML', 0, 'Filter')"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Tag as XML', 'Export %1 filtered Tags as XML', 0, 'Tag')"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Permission as XML', 'Export %1 filtered Permissions as XML', 0, 'Permission')"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered User as XML', 'Export %1 filtered Users as XML', 0, 'User')"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Group as XML', 'Export %1 filtered Groups as XML', 0, 'Group')"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Role as XML', 'Export %1 filtered Roles as XML', 0, 'Role')"/>
</xsl:template>

<!-- A filter label like "Task Filter" -->
<xsl:template name="type-filter">
  <xsl:value-of select="gsa:i18n ('Task Filter', 'Task')"/>
  <xsl:value-of select="gsa:i18n ('Report Filter', 'Report')"/>
  <xsl:value-of select="gsa:i18n ('Result Filter', 'Result')"/>
  <xsl:value-of select="gsa:i18n ('Note Filter', 'Note')"/>
  <xsl:value-of select="gsa:i18n ('Override Filter', 'Override')"/>
  <xsl:value-of select="gsa:i18n ('NVT Filter', 'NVT')"/>
  <xsl:value-of select="gsa:i18n ('CVE Filter', 'CVE')"/>
  <xsl:value-of select="gsa:i18n ('CPE Filter', 'CPE')"/>
  <xsl:value-of select="gsa:i18n ('OVAL Filter', 'OVAL Definition')"/>
  <xsl:value-of select="gsa:i18n ('CERT-Bund Filter', 'CERT-Bund Advisory')"/>
  <xsl:value-of select="gsa:i18n ('DFN-CERT Filter', 'DFN-CERT Advisory')"/>
  <xsl:value-of select="gsa:i18n ('Info Filter', 'SecInfo')"/>
  <xsl:value-of select="gsa:i18n ('All SecInfo Filter', 'All SecInfo Information')"/>
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
</xsl:template>

<!-- A resource permissions label like "Permissions for Task" -->
<xsl:template name="type-permissions">
  <xsl:value-of select="gsa:i18n ('Permissions for Task &quot;%1&quot;', 'Task')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Target &quot;%1&quot;', 'Target')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Port List &quot;%1&quot;', 'Port List')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Credential &quot;%1&quot;', 'Credential')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Scan Config &quot;%1&quot;', 'Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Alert &quot;%1&quot;', 'Alert')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Schedule &quot;%1&quot;', 'Schedule')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Report Format &quot;%1&quot;', 'Report Format')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Slave &quot;%1&quot;', 'Slave')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Agent &quot;%1&quot;', 'Agent')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Scanner &quot;%1&quot;', 'Scanner')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Filter &quot;%1&quot;', 'Filter')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Tag &quot;%1&quot;', 'Tag')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Permission &quot;%1&quot;', 'Permission')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for User &quot;%1&quot;', 'User')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Group &quot;%1&quot;', 'Group')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Role &quot;%1&quot;', 'Role')"/>
</xsl:template>

<!-- A new filter label like "New Task Filter from current term" -->
<xsl:template name="type-new-filter">
  <xsl:value-of select="gsa:i18n ('New Task Filter from current term', 'Task')"/>
  <xsl:value-of select="gsa:i18n ('New Report Filter from current term', 'Report')"/>
  <xsl:value-of select="gsa:i18n ('New Result Filter from current term', 'Result')"/>
  <xsl:value-of select="gsa:i18n ('New Note Filter from current term', 'Note')"/>
  <xsl:value-of select="gsa:i18n ('New Override Filter from current term', 'Override')"/>
  <xsl:value-of select="gsa:i18n ('New Info Filter from current term', 'All SecInfo Information')"/>
  <xsl:value-of select="gsa:i18n ('New All SecInfo Filter from current term', 'All SecInfo Information')"/>
  <xsl:value-of select="gsa:i18n ('New Target Filter from current term', 'Target')"/>
  <xsl:value-of select="gsa:i18n ('New Port List Filter from current term', 'Port List')"/>
  <xsl:value-of select="gsa:i18n ('New Credential Filter from current term', 'Credential')"/>
  <xsl:value-of select="gsa:i18n ('New Scan Config Filter from current term', 'Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('New Alert Filter from current term', 'Alert')"/>
  <xsl:value-of select="gsa:i18n ('New Schedule Filter from current term', 'Schedule')"/>
  <xsl:value-of select="gsa:i18n ('New Report Format Filter from current term', 'Report Format')"/>
  <xsl:value-of select="gsa:i18n ('New Slave Filter from current term', 'Slave')"/>
  <xsl:value-of select="gsa:i18n ('New Agent Filter from current term', 'Agent')"/>
  <xsl:value-of select="gsa:i18n ('New Scanner Filter from current term', 'Scanner')"/>
  <xsl:value-of select="gsa:i18n ('New Filter Filter from current term', 'Filter')"/>
  <xsl:value-of select="gsa:i18n ('New Tag Filter from current term', 'Tag')"/>
  <xsl:value-of select="gsa:i18n ('New Permission Filter from current term', 'Permission')"/>
  <xsl:value-of select="gsa:i18n ('New User Filter from current term', 'User')"/>
  <xsl:value-of select="gsa:i18n ('New Group Filter from current term', 'Group')"/>
  <xsl:value-of select="gsa:i18n ('New Role Filter from current term', 'Role')"/>
</xsl:template>

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
</xsl:template>

<!-- General text for denied actions like "Permission to delete Task denied" -->
<xsl:template name="type-action-denied">
  <xsl:value-of select="gsa:i18n ('Task is still in use', 'Task')"/>
  <xsl:value-of select="gsa:i18n ('Note is still in use', 'Note')"/>
  <xsl:value-of select="gsa:i18n ('Override is still in use', 'Override')"/>
  <xsl:value-of select="gsa:i18n ('Target is still in use', 'Target')"/>
  <xsl:value-of select="gsa:i18n ('Port List is still in use', 'Port List')"/>
  <xsl:value-of select="gsa:i18n ('Credential is still in use', 'Credential')"/>
  <xsl:value-of select="gsa:i18n ('Scan Config is still in use', 'Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('Alert is still in use', 'Alert')"/>
  <xsl:value-of select="gsa:i18n ('Schedule is still in use', 'Schedule')"/>
  <xsl:value-of select="gsa:i18n ('Report Format is still in use', 'Report Format')"/>
  <xsl:value-of select="gsa:i18n ('Slave is still in use', 'Slave')"/>
  <xsl:value-of select="gsa:i18n ('Agent is still in use', 'Agent')"/>
  <xsl:value-of select="gsa:i18n ('Scanner is still in use', 'Scanner')"/>
  <xsl:value-of select="gsa:i18n ('Filter is still in use', 'Filter')"/>
  <xsl:value-of select="gsa:i18n ('Tag is still in use', 'Tag')"/>
  <xsl:value-of select="gsa:i18n ('Permission is still in use', 'Permission')"/>
  <xsl:value-of select="gsa:i18n ('User is still in use', 'User')"/>
  <xsl:value-of select="gsa:i18n ('Group is still in use', 'Group')"/>
  <xsl:value-of select="gsa:i18n ('Role is still in use', 'Role')"/>

  <xsl:value-of select="gsa:i18n ('Task is not writable', 'Task')"/>
  <xsl:value-of select="gsa:i18n ('Note is not writable', 'Note')"/>
  <xsl:value-of select="gsa:i18n ('Override is not writable', 'Override')"/>
  <xsl:value-of select="gsa:i18n ('Target is not writable', 'Target')"/>
  <xsl:value-of select="gsa:i18n ('Port List is not writable', 'Port List')"/>
  <xsl:value-of select="gsa:i18n ('Credential is not writable', 'Credential')"/>
  <xsl:value-of select="gsa:i18n ('Scan Config is not writable', 'Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('Alert is not writable', 'Alert')"/>
  <xsl:value-of select="gsa:i18n ('Schedule is not writable', 'Schedule')"/>
  <xsl:value-of select="gsa:i18n ('Report Format is not writable', 'Report Format')"/>
  <xsl:value-of select="gsa:i18n ('Slave is not writable', 'Slave')"/>
  <xsl:value-of select="gsa:i18n ('Agent is not writable', 'Agent')"/>
  <xsl:value-of select="gsa:i18n ('Scanner is not writable', 'Scanner')"/>
  <xsl:value-of select="gsa:i18n ('Filter is not writable', 'Filter')"/>
  <xsl:value-of select="gsa:i18n ('Tag is not writable', 'Tag')"/>
  <xsl:value-of select="gsa:i18n ('Permission is not writable', 'Permission')"/>
  <xsl:value-of select="gsa:i18n ('User is not writable', 'User')"/>
  <xsl:value-of select="gsa:i18n ('Group is not writable', 'Group')"/>
  <xsl:value-of select="gsa:i18n ('Role is not writable', 'Role')"/>

  <xsl:value-of select="gsa:i18n ('Task cannot be deleted', 'Task')"/>
  <xsl:value-of select="gsa:i18n ('Report cannot be deleted', 'Report')"/>
  <xsl:value-of select="gsa:i18n ('Note cannot be deleted', 'Note')"/>
  <xsl:value-of select="gsa:i18n ('Override cannot be deleted', 'Override')"/>
  <xsl:value-of select="gsa:i18n ('Target cannot be deleted', 'Target')"/>
  <xsl:value-of select="gsa:i18n ('Port List cannot be deleted', 'Port List')"/>
  <xsl:value-of select="gsa:i18n ('Credential cannot be deleted', 'Credential')"/>
  <xsl:value-of select="gsa:i18n ('Scan Config cannot be deleted', 'Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('Alert cannot be deleted', 'Alert')"/>
  <xsl:value-of select="gsa:i18n ('Schedule cannot be deleted', 'Schedule')"/>
  <xsl:value-of select="gsa:i18n ('Report Format cannot be deleted', 'Report Format')"/>
  <xsl:value-of select="gsa:i18n ('Slave cannot be deleted', 'Slave')"/>
  <xsl:value-of select="gsa:i18n ('Agent cannot be deleted', 'Agent')"/>
  <xsl:value-of select="gsa:i18n ('Scanner cannot be deleted', 'Scanner')"/>
  <xsl:value-of select="gsa:i18n ('Filter cannot be deleted', 'Filter')"/>
  <xsl:value-of select="gsa:i18n ('Tag cannot be deleted', 'Tag')"/>
  <xsl:value-of select="gsa:i18n ('Permission cannot be deleted', 'Permission')"/>
  <xsl:value-of select="gsa:i18n ('User cannot be deleted', 'User')"/>
  <xsl:value-of select="gsa:i18n ('Group cannot be deleted', 'Group')"/>
  <xsl:value-of select="gsa:i18n ('Role cannot be deleted', 'Role')"/>

  <xsl:value-of select="gsa:i18n ('Task cannot be moved to the trashcan', 'Task')"/>
  <xsl:value-of select="gsa:i18n ('Report cannot be moved to the trashcan', 'Report')"/>
  <xsl:value-of select="gsa:i18n ('Note cannot be moved to the trashcan', 'Note')"/>
  <xsl:value-of select="gsa:i18n ('Override cannot be moved to the trashcan', 'Override')"/>
  <xsl:value-of select="gsa:i18n ('Target cannot be moved to the trashcan', 'Target')"/>
  <xsl:value-of select="gsa:i18n ('Port List cannot be moved to the trashcan', 'Port List')"/>
  <xsl:value-of select="gsa:i18n ('Credential cannot be moved to the trashcan', 'Credential')"/>
  <xsl:value-of select="gsa:i18n ('Scan Config cannot be moved to the trashcan', 'Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('Alert cannot be moved to the trashcan', 'Alert')"/>
  <xsl:value-of select="gsa:i18n ('Schedule cannot be moved to the trashcan', 'Schedule')"/>
  <xsl:value-of select="gsa:i18n ('Report Format cannot be moved to the trashcan', 'Report Format')"/>
  <xsl:value-of select="gsa:i18n ('Slave cannot be moved to the trashcan', 'Slave')"/>
  <xsl:value-of select="gsa:i18n ('Agent cannot be moved to the trashcan', 'Agent')"/>
  <xsl:value-of select="gsa:i18n ('Scanner cannot be moved to the trashcan', 'Scanner')"/>
  <xsl:value-of select="gsa:i18n ('Filter cannot be moved to the trashcan', 'Filter')"/>
  <xsl:value-of select="gsa:i18n ('Tag cannot be moved to the trashcan', 'Tag')"/>
  <xsl:value-of select="gsa:i18n ('Permission cannot be moved to the trashcan', 'Permission')"/>
  <xsl:value-of select="gsa:i18n ('User cannot be moved to the trashcan', 'User')"/>
  <xsl:value-of select="gsa:i18n ('Group cannot be moved to the trashcan', 'Group')"/>
  <xsl:value-of select="gsa:i18n ('Role cannot be moved to the trashcan', 'Role')"/>

  <xsl:value-of select="gsa:i18n ('Permission to move Task to trashcan denied', 'Task')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Report to trashcan denied', 'Report')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Note to trashcan denied', 'Note')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Override to trashcan denied', 'Override')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Target to trashcan denied', 'Target')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Port List to trashcan denied', 'Port List')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Credential to trashcan denied', 'Credential')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Scan Config to trashcan denied', 'Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Alert to trashcan denied', 'Alert')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Schedule to trashcan denied', 'Schedule')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Report Format to trashcan denied', 'Report Format')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Slave to trashcan denied', 'Slave')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Agent to trashcan denied', 'Agent')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Scanner to trashcan denied', 'Scanner')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Filter to trashcan denied', 'Filter')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Tag to trashcan denied', 'Tag')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Permission to trashcan denied', 'Permission')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move User to trashcan denied', 'User')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Group to trashcan denied', 'Group')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Role to trashcan denied', 'Role')"/>

  <xsl:value-of select="gsa:i18n ('Permission to edit Task denied', 'Task')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Report denied', 'Report')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Note denied', 'Note')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Override denied', 'Override')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Target denied', 'Target')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Port List denied', 'Port List')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Credential denied', 'Credential')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Scan Config denied', 'Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Alert denied', 'Alert')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Schedule denied', 'Schedule')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Report Format denied', 'Report Format')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Slave denied', 'Slave')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Agent denied', 'Agent')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Scanner denied', 'Scanner')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Filter denied', 'Filter')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Tag denied', 'Tag')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Permission denied', 'Permission')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit User denied', 'User')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Group denied', 'Group')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Role denied', 'Role')"/>

  <xsl:value-of select="gsa:i18n ('Cannot modify Task', 'Task')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Report', 'Report')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Note', 'Note')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Override', 'Override')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Target', 'Target')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Port List', 'Port List')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Credential', 'Credential')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Scan Config', 'Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Alert', 'Alert')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Schedule', 'Schedule')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Report Format', 'Report Format')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Slave', 'Slave')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Agent', 'Agent')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Scanner', 'Scanner')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Filter', 'Filter')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Tag', 'Tag')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Permission', 'Permission')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify User', 'User')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Group', 'Group')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Role', 'Role')"/>

  <xsl:value-of select="gsa:i18n ('Task may not be cloned', 'Task')"/>
  <xsl:value-of select="gsa:i18n ('Report may not be cloned', 'Report')"/>
  <xsl:value-of select="gsa:i18n ('Note may not be cloned', 'Note')"/>
  <xsl:value-of select="gsa:i18n ('Override may not be cloned', 'Override')"/>
  <xsl:value-of select="gsa:i18n ('Target may not be cloned', 'Target')"/>
  <xsl:value-of select="gsa:i18n ('Port List may not be cloned', 'Port List')"/>
  <xsl:value-of select="gsa:i18n ('Credential may not be cloned', 'Credential')"/>
  <xsl:value-of select="gsa:i18n ('Scan Config may not be cloned', 'Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('Alert may not be cloned', 'Alert')"/>
  <xsl:value-of select="gsa:i18n ('Schedule may not be cloned', 'Schedule')"/>
  <xsl:value-of select="gsa:i18n ('Report Format may not be cloned', 'Report Format')"/>
  <xsl:value-of select="gsa:i18n ('Slave may not be cloned', 'Slave')"/>
  <xsl:value-of select="gsa:i18n ('Agent may not be cloned', 'Agent')"/>
  <xsl:value-of select="gsa:i18n ('Scanner may not be cloned', 'Scanner')"/>
  <xsl:value-of select="gsa:i18n ('Filter may not be cloned', 'Filter')"/>
  <xsl:value-of select="gsa:i18n ('Tag may not be cloned', 'Tag')"/>
  <xsl:value-of select="gsa:i18n ('Permission may not be cloned', 'Permission')"/>
  <xsl:value-of select="gsa:i18n ('User may not be cloned', 'User')"/>
  <xsl:value-of select="gsa:i18n ('Group may not be cloned', 'Group')"/>
  <xsl:value-of select="gsa:i18n ('Role may not be cloned', 'Role')"/>

  <xsl:value-of select="gsa:i18n ('Task must be owned or global', 'Task')"/>
  <xsl:value-of select="gsa:i18n ('Report must be owned or global', 'Report')"/>
  <xsl:value-of select="gsa:i18n ('Note must be owned or global', 'Note')"/>
  <xsl:value-of select="gsa:i18n ('Override must be owned or global', 'Override')"/>
  <xsl:value-of select="gsa:i18n ('Target must be owned or global', 'Target')"/>
  <xsl:value-of select="gsa:i18n ('Port List must be owned or global', 'Port List')"/>
  <xsl:value-of select="gsa:i18n ('Credential must be owned or global', 'Credential')"/>
  <xsl:value-of select="gsa:i18n ('Scan Config must be owned or global', 'Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('Alert must be owned or global', 'Alert')"/>
  <xsl:value-of select="gsa:i18n ('Schedule must be owned or global', 'Schedule')"/>
  <xsl:value-of select="gsa:i18n ('Report Format must be owned or global', 'Report Format')"/>
  <xsl:value-of select="gsa:i18n ('Slave must be owned or global', 'Slave')"/>
  <xsl:value-of select="gsa:i18n ('Agent must be owned or global', 'Agent')"/>
  <xsl:value-of select="gsa:i18n ('Scanner must be owned or global', 'Scanner')"/>
  <xsl:value-of select="gsa:i18n ('Filter must be owned or global', 'Filter')"/>
  <xsl:value-of select="gsa:i18n ('Tag must be owned or global', 'Tag')"/>
  <xsl:value-of select="gsa:i18n ('Permission must be owned or global', 'Permission')"/>
  <xsl:value-of select="gsa:i18n ('User must be owned or global', 'User')"/>
  <xsl:value-of select="gsa:i18n ('Group must be owned or global', 'Group')"/>
  <xsl:value-of select="gsa:i18n ('Role must be owned or global', 'Role')"/>
</xsl:template>

<!-- "Edit ..." label like "Edit Task" -->
<xsl:template name="type-edit">
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
</xsl:template>


<!--
  Permission Descriptions
-->
<xsl:template name="permission-descriptions">
  <!-- super -->
  <xsl:value-of select="gsa:i18n ('has super access', 'Permission Description')"/>
  <!-- authenticate -->
  <xsl:value-of select="gsa:i18n ('may login', 'Permission Description')"/>
  <!-- commands -->
  <xsl:value-of select="gsa:i18n ('may run multiple OMP commands as one', 'Permission Description')"/>

  <!-- create_... -->
  <xsl:value-of select="gsa:i18n ('may create a new agent', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new alert', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new scan config', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new filter', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new group', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new credential', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new note', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new override', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new permission', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new port list', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new port range', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new report', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new report format', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new role', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new scanner', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new schedule', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new slave', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new tag', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new target', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new task', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may create a new user', 'Permission Description')"/>

  <!-- delete_... -->
  <xsl:value-of select="gsa:i18n ('may delete agent %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete alert %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete scan config %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete filter %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete group %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete credential %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete note %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete override %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete permission %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete port list %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete port range %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete report %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete report format %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete role %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete scanner %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete schedule %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete slave %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete tag %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete target %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete task %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete user %1', 'Permission Description')"/>

  <xsl:value-of select="gsa:i18n ('may delete an existing agent', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing alert', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing scan config', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing filter', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing group', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing credential', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing note', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing override', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing permission', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing port list', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing port range', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing report', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing report format', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing role', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing scanner', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing schedule', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing slave', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing tag', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing target', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing task', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing user', 'Permission Description')"/>

  <!-- describe_... -->
  <xsl:value-of select="gsa:i18n ('may get details about the authentication configuration', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may get details about the CERT feed', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may get details about the NVT feed', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may get details about the SCAP feed', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may get details about %1', 'Permission Description')"/>

  <!-- empty_trashcan -->
  <xsl:value-of select="gsa:i18n ('may empty the trashcan', 'Permission Description')"/>

  <!-- get_... -->
  <xsl:value-of select="gsa:i18n ('has read access to agent %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to alert %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to scan config %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to filter %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to group %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to credential %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to note %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to NVT %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to override %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to permission %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to port list %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to port range %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to report %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to report format %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to role %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to scanner %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to schedule %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to slave %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to system report %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to tag %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to target %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to task %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to user %1', 'Permission Description')"/>

  <xsl:value-of select="gsa:i18n ('has read access to agents', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to alerts', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to scan configs', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to filters', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to groups', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to SecInfo', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to credentials', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to notes', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to NVTs', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to NVT families', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may get NVT feed version information', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to overrides', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to permissions', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to port lists', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to port ranges', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to reports', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to report formats', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to roles', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to scanners', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to schedules', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to slaves', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to system reports', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to tags', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to targets', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to tasks', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has read access to users', 'Permission Description')"/>

  <!-- help -->
  <xsl:value-of select="gsa:i18n ('may get the help text', 'Permission Description')"/>

  <!-- modify_... -->
  <xsl:value-of select="gsa:i18n ('has write access to agent %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to alert %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to scan config %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to filter %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to group %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to credential %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to note %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to override %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to permission %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to port list %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to port range %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to report %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to report format %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to role %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to scanner %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to schedule %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to slave %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to system report %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to tag %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to target %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to task %1', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to user %1', 'Permission Description')"/>

  <xsl:value-of select="gsa:i18n ('has write access to agents', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to alerts', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to the authentication configuration', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to scan configs', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to filters', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to groups', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to credentials', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to notes', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to overrides', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to permissions', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to port lists', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to port ranges', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to reports', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to report formats', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to roles', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to scanners', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to schedules', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to slaves', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to system reports', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to tags', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to targets', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to tasks', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('has write access to users', 'Permission Description')"/>

  <!-- restore -->
  <xsl:value-of select="gsa:i18n ('may restore items from the trashcan', 'Permission Description')"/>

  <!-- resume_task -->
  <xsl:value-of select="gsa:i18n ('may resume tasks', 'Permission Description')"/>

  <!-- run_wizard -->
  <xsl:value-of select="gsa:i18n ('may run wizards', 'Permission Description')"/>

  <!-- start_task -->
  <xsl:value-of select="gsa:i18n ('may start tasks', 'Permission Description')"/>

  <!-- stop_task -->
  <xsl:value-of select="gsa:i18n ('may stop tasks', 'Permission Description')"/>

  <!-- sync_... -->
  <xsl:value-of select="gsa:i18n ('may sync the CERT feed', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may sync the NVT feed', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may sync the SCAP feed', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may sync %1', 'Permission Description')"/>

  <!-- test_alert -->
  <xsl:value-of select="gsa:i18n ('may test alerts', 'Permission Description')"/>

  <!-- verify_... -->
  <xsl:value-of select="gsa:i18n ('may verify agents', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may verify report formats', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may verify scanners', 'Permission Description')"/>
  <xsl:value-of select="gsa:i18n ('may verify %1', 'Permission Description')"/>

</xsl:template>

<!-- A bulk delete confirmation message like "3 Tasks will be deleted" -->
<xsl:template name="type-bulk-delete-confirm">
  <xsl:value-of select="gsa:n-i18n ('%1 Task will be deleted', '%1 Tasks will be deleted', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Report will be deleted', '%1 Reports will be deleted', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Note will be deleted', '%1 Notes will be deleted', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Override will be deleted', '%1 Overrides will be deleted', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Target will be deleted', '%1 Targets will be deleted', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Port List will be deleted', '%1 Port Lists will be deleted', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Credential will be deleted', '%1 Credentials will be deleted', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Scan Config will be deleted', '%1 Scan Configs will be deleted', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Alert will be deleted', '%1 Alerts will be deleted', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Schedule will be deleted', '%1 Schedules will be deleted', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Report Format will be deleted', '%1 Report Formats will be deleted', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Slave will be deleted', '%1 Slaves will be deleted', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Agent will be deleted', '%1 Agents will be deleted', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Scanner will be deleted', '%1 Scanners will be deleted', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Filter will be deleted', '%1 Filters will be deleted', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Tags will be deleted', '%1 Tags will be deleted', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Permissions will be deleted', '%1 Permissions will be deleted', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 User will be deleted', '%1 Users will be deleted', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Group will be deleted', '%1 Groups will be deleted', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Role will be deleted', '%1 Roles will be deleted', 0, 'Bulk Action')"/>
</xsl:template>

<!-- A bulk trash confirmation message like "3 Tasks will be moved to the trashcan" -->
<xsl:template name="type-bulk-trash-confirm">
  <xsl:value-of select="gsa:n-i18n ('%1 Task will be moved to the trashcan', '%1 Tasks will be moved to the trashcan', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Report will be moved to the trashcan', '%1 Report will be moved to the trashcan', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Note will be moved to the trashcan', '%1 Notes will be moved to the trashcan', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Override will be moved to the trashcan', '%1 Overrides will be moved to the trashcan', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Target will be moved to the trashcan', '%1 Targets will be moved to the trashcan', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Port List will be moved to the trashcan', '%1 Port Lists will be moved to the trashcan', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Credential will be moved to the trashcan', '%1 Credentials will be moved to the trashcan', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Scan Config will be moved to the trashcan', '%1 Scan Configs will be moved to the trashcan', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Alert will be moved to the trashcan', '%1 Alerts will be moved to the trashcan', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Schedule will be moved to the trashcan', '%1 Schedules will be moved to the trashcan', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Report Format will be moved to the trashcan', '%1 Report Formats will be moved to the trashcan', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Slave will be moved to the trashcan', '%1 Slaves will be moved to the trashcan', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Agent will be moved to the trashcan', '%1 Agents will be moved to the trashcan', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Scanner will be moved to the trashcan', '%1 Scanners will be moved to the trashcan', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Filter will be moved to the trashcan', '%1 Filters will be moved to the trashcan', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Tags will be moved to the trashcan', '%1 Tags will be moved to the trashcan', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Permissions will be moved to the trashcan', '%1 Permissions will be moved to the trashcan', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 User will be moved to the trashcan', '%1 Users will be moved to the trashcan', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Group will be moved to the trashcan', '%1 Groups will be moved to the trashcan', 0, 'Bulk Action')"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Role will be moved to the trashcan', '%1 Roles will be moved to the trashcan', 0, 'Bulk Action')"/>
</xsl:template>

<!-- Bulk action names -->
<xsl:template name="bulk-actions">
  <xsl:value-of select="gsa:i18n ('Move selection to trashcan', 'Bulk Action')"/>
  <xsl:value-of select="gsa:i18n ('Move all filtered to trashcan', 'Bulk Action')"/>
  <xsl:value-of select="gsa:i18n ('Move page contents to trashcan', 'Bulk Action')"/>

  <xsl:value-of select="gsa:i18n ('Delete selection', 'Bulk Action')"/>
  <xsl:value-of select="gsa:i18n ('Delete all filtered', 'Bulk Action')"/>
  <xsl:value-of select="gsa:i18n ('Delete page contents', 'Bulk Action')"/>

  <xsl:value-of select="gsa:i18n ('Export selection', 'Bulk Action')"/>
  <xsl:value-of select="gsa:i18n ('Export all filtered', 'Bulk Action')"/>
  <xsl:value-of select="gsa:i18n ('Export page contents', 'Bulk Action')"/>
</xsl:template>

<!-- Scan status names -->
<xsl:template name="status">
  <xsl:value-of select="gsa:i18n ('Uploading', 'Status')"/>
  <xsl:value-of select="gsa:i18n ('Container', 'Status')"/>
  <xsl:value-of select="gsa:i18n ('Delete Requested', 'Status')"/>
  <xsl:value-of select="gsa:i18n ('Ultimate Delete Requested', 'Status')"/>
  <xsl:value-of select="gsa:i18n ('Done', 'Status')"/>
  <xsl:value-of select="gsa:i18n ('New', 'Status')"/>
  <xsl:value-of select="gsa:i18n ('Running', 'Status')"/>
  <xsl:value-of select="gsa:i18n ('Stopped', 'Status')"/>
  <xsl:value-of select="gsa:i18n ('Internal Error', 'Status')"/>
</xsl:template>

<!-- Trust status -->
<xsl:template name="trust">
  <xsl:value-of select="gsa:i18n ('unknown', 'Trust')"/>
  <xsl:value-of select="gsa:i18n ('yes', 'Trust')"/>
  <xsl:value-of select="gsa:i18n ('no', 'Trust')"/>
</xsl:template>

</xsl:stylesheet>