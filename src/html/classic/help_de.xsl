<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
      version="1.0"
      xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
      xmlns:gsa="http://openvas.org"
      extension-element-prefixes="gsa">
      <xsl:output
      method="html"
      doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
      doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN"
      encoding="UTF-8"/>
<!--
Greenbone Security Assistant
$Id$
Description: German Help documents for GSA.

Authors:
Timo Pollmeier <timo.pollmeier@greenbone.net>

Copyright:
Copyright (C) 2014 Greenbone Networks GmbH

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License version 2,
or, at your option, any later version as published by the Free
Software Foundation

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
-->

<xsl:include href="help.xsl"/>

<xsl:template name="availability_de">
  <xsl:param name="command" select="GET_TASKS"/>
  <xsl:choose>
    <xsl:when test="/envelope/capabilities/help_response/schema/command[name=$command]">
    </xsl:when>
    <xsl:otherwise>
      <p>
        <b>Anmerkung:</b> Diese Funktion ist mit der aktuellen Verbindung zum OMP-Server nicht verfügbar.
      </p>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="filtering_de">
  <a name="filtering"></a>
  <h3>Filter</h3>
  <p>
    Der Filter-Abschnitt des Fensters zeigt, wie die angezeigte Liste
    ausgewählt wurde.
  </p>
  <p>
    Wenn Sie einen der Werte im Feld "Filter" und klickt auf auf das
    Aktualisieren-Icon <img src="/img/refresh.png" alt="Aktualisieren"
    title="Aktualisieren"/>, wird die angezeigte Liste aktualisiert.
    Die Syntax des Filters ist auf der Seite
    "<a href="/help/powerfilter.html?token={/envelope/token}">Powerfilter</a>"
    beschrieben.
  </p>
  <p>
    Wenn Sie einen Namen in das zweite Feld eintragen und das Neu-Icon
    <img src="/img/new.png"
         alt="Neuen Filter aus aktuellem Suchausdruck erzeugen"
         title="Neuen Filter aus aktuellem Suchausdruck erzeugen"/>
    drücken, wird ein neuer Filter aus dem Suchausdruck erzeugt,
    der aktuell auf die Liste angewendet wird.
  </p>
  <p>
    Der aktuelle Filter kann auch geändert werden, indem Sie einen Filter
    aus der Dropdown-Liste rechts auswählen und das Aktualisieren-Icon
    <img src="/img/refresh.png" alt="Aktualisieren" title="Aktualisieren"/>
    drücken.
  </p>
  <p>
    Wenn Sie auf das Listen-Icon
    <img src="/img/list.png" border="0" alt="Filter"/>
    drücken, gelangen Sie zu einer vollständigen Liste aller Filter
    auf der <a href="filters.html?token={/envelope/token}">Filter</a>-Seite.
  </p>
</xsl:template>

<xsl:template name="sorting_de">
  <a name="sorting"></a>
  <h3>Sortieren</h3>
  <p>
    Die Sortierung der Tabelle kann geändert werden, indem Sie auf einen
    Spaltenkopf klicken.
    Die Aktuelle Sortierspalte erscheint als Schlüsselwort im Powerfilter, z.B.
    in der Form "sort=name" oder "sort-reverse=name".
  </p>
</xsl:template>

<xsl:template mode="help" match="*">
  <div class="gb_window_part_center">Hilfe: Seite Nicht gefunden</div>
  <div class="gb_window_part_content">
    <div style="text-align:left">
      <h1>Seite nicht gefunden</h1>

      <p>
        Die von Ihnen angeforderte Hilfeseite konnte nicht gefunden werden.
        Falls Sie über einen Link zu dieser Seite gelangt sind, hat sich die
        Adresse der Hilfeseite möglicherweise geändert. In diesem Fall benutzen
        Sie bitte das
        <a href="contents.html?token={/envelope/token}">Inhaltsverzeichnis</a>
        um zu der Seite zu gelangen, nach der Sie gesucht haben.
      </p>

      <p>
        Wir bitten für die Unannehmlichkeiten um Entschuldigung.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="tasks.html">
  <div class="gb_window_part_center">Hilfe: Aufgaben
    <a href="/omp?cmd=get_tasks&amp;token={/envelope/token}"
       title="Tasks" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="Tasks"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">Hilfe-Inhaltsverzeichnis</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_de">
        <xsl:with-param name="command" select="'GET_TASKS'"/>
      </xsl:call-template>

      <a name="tasks"></a>
      <h1>Aufgaben</h1>
      <p>
       Diese Tabelle bietet einen Überblick über alle konfigurierten
       <a href="glossary.html?token={/envelope/token}#task">Aufgaben</a> und
       fasst die wichtigsten Aspekte der einzelnen zusammen.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Spalte</td>
          <td>Beschreibung</td>
        </tr>
        <tr class="odd">
          <td>Aufgabe</td>
          <td>
            Zeigt den Namen der Aufgabe. Namen sind
            nicht notwendigerweise einzigartig,
            so dass der gleiche Name mehrfach auftauchen
            kann. Eine interne ID unterscheidet die Aufgaben.
            <br/>
            Wenn ein Kommentar für die Aufgabe vorhanden ist, wird dieser
            in Klammern unter dem Namen angezeigt.
            <div>
              Die rechte Seite dieser Spalte kann mehrere Icons enthalten:
              <table style="margin-left: 10px">
                <tr>
                  <td valign="top">
                    <img src="/img/alterable.png"
                         border="0"
                         alt="Aufgabe ist änderbar"
                         title="Aufgabe ist änderbar"/>
                  </td>
                  <td>
                    Die Aufgabe ist änderbar. Dies ermöglicht es, Eigenschaften
                    zu bearbeiten, die sonst festgesetzt wären, sobald
                    Berichte für die Aufgabe existieren.
                  </td>
                </tr>
                <tr>
                  <td valign="top">
                    <img src="/img/sensor.png"
                         border="0"
                         alt="Aufgabe ist konfiguriert, um auf Slave Beispiel-Slave ausgeführt zu werden"
                         title="Aufgabe ist konfiguriert, um auf Slave Beispiel-Slave ausgeführt zu werden"/>
                  </td>
                  <td>
                    Die Aufgabe is so konfiguriert, dass sie auf einem Slave ausgeführt wird.
                  </td>
                </tr>
                <tr>
                  <td valign="top">
                    <img src="/img/provide_view.png"
                         border="0"
                         alt="Aufgabe sichtbar gemacht für: user1 user2"
                         title="Aufgabe sichtbar gemacht für: user1 user2"/>
                  </td>
                  <td>
                    Die Aufgabe wurde für einen oder mehr Benutzer sichtbar gemacht.
                  </td>
                </tr>
                <tr>
                  <td valign="top">
                    <img src="/img/view_other.png"
                         border="0"
                         alt="Beobachte Aufgabe von Besitzer user1"
                         title="Beobachte Aufgabe von Besitzer user1"/>
                  </td>
                  <td>
                    Die Aufgabe wird nur beobachtet.  Der Besitzer ist ein anderer Benutzer.
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
        <tr class="even">
          <td>Status</td>
          <td>Der Status des aktuellsten Scans der Aufgabe.<br/>
            Ein Klick auf den Fortschrittsbalken führt Sie zum aktuellsten
            Bericht, welcher je nach aktuellem Status des Scans unvollständig
            sein kann.<br/>
            Der Status einer Aufgabe ist einer der folgenden:
            <br/>
            <table>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Läuft gerade">
                    <div class="progressbar_bar" style="width:42px;"></div>
                    <div class="progressbar_text">42 %</div>
                   </div>
                </td><td>
                  Ein aktiver Scan für diese Aufgabe läuft gerade und ist zu 42%
                  abgeschlossen.
                  Der Prozentsatz bezieht sich auf die Anzahl der Hosts multipliziert
                  mit der Anzahl der NVTs. Daher stimmt er möglicherweise nicht
                  völlig mit der Dauer des Scans überein.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Neu">
                    <div class="progressbar_bar_new" style="width:100px;"></div>
                    <div class="progressbar_text"><i><b>Neu</b></i></div>
                  </div>
                </td><td>
                  Die Aufgabe wurde seit der Erstellung noch nicht gestartet.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Angefordert">
                    <div class="progressbar_bar_request" style="width:100px;"></div>
                    <div class="progressbar_text">Angefordert</div>
                  </div>
                </td><td>
                  Diese Aufgabe wurde soeben erst gestartet und bereitet vor,
                  die Scan-Engine mit dem Scan zu beauftragen.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Löschen Angefordert">
                    <div class="progressbar_bar_request" style="width:100px;"></div>
                    <div class="progressbar_text">Löschen Angefordert</div>
                  </div>
                </td><td>
                  Der Benutzer hat die Aufgabe kürzlich gelöscht. Der
                  Manager-Server bereinigt momentan die Datenbank, was eine
                  gewisse Zeit dauern kann, da auch alle mit der Aufgabe
                  verbundenen Berichte entfernt werden.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Stopp Angefordert">
                    <div class="progressbar_bar_request" style="width:100px;"></div>
                    <div class="progressbar_text">Stopp Angefordert</div>
                  </div>
                </td><td>
                  Der Benutzer hat den Scan kürzlich gestoppt. Der Manager-Server
                  hat dieses Kommando zum Scanner gesendet, aber der Scanner
                  hat den Scan noch nicht sauber gestoppt.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Gestoppt">
                    <div class="progressbar_bar_request" style="width:15px;"></div>
                    <div class="progressbar_text">
                      Gestoppt bei <xsl:value-of select="15"/> %
                    </div>
                  </div>
                </td><td>
                  Der letzte Scan dieser Aufgabe wurde vom Benutzer gestoppt.
                  Der Scan war zu 15% abgeschlossen, als er angehalten wurde.
                  Der neueste Bericht kann unvollständig sein.
                  Außerdem kann dieser Status gesetzt sein, wenn der Scan durch
                  beliebige andere Gründe gestoppt wurde, z.B. durch einen
                  Stromausfall. Die Aufgabe bleibt auch nach Neustart des
                  Scanner- oder Manager-Servers, beispielsweise nach einem
                  Reboot, gestoppt.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Pause Angefordert">
                    <div class="progressbar_bar_request" style="width:100px;"></div>
                    <div class="progressbar_text">Pause Angefordert</div>
                  </div>
                </td><td>
                  Der Benutzer hat kürzlich den Scan pausiert. Der Manager-Server
                  hat dieses Kommando zum Scanner gesendet, aber der Scanner
                  hat den Scan noch nicht sauber pausiert.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Pausiert">
                    <div class="progressbar_bar_request" style="width:82px;"></div>
                    <div class="progressbar_text">
                      Pausiert bei <xsl:value-of select="82"/> %
                    </div>
                  </div>
                </td><td>
                  Der letzte Scan dieser Aufgabe wurde vom Benutzer pausiert.
                  Der Scan war zu 15% abgeschlossen, als er pausiert wurde.
                  Der neueste Bericht kann unvollständig sein.
                  Die Aufgabe wird auf gestoppt gesetzt, wenn der Scanner- oder
                  Manager-Server neu gestart wird, z.B. bei einem Reboot.
                  Der Scan-Dienst bleibt im Stand-by aktiv und gibt keinen
                  Speicher frei, so lange die Aufgabe pausiert ist.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Interner Fehler">
                    <div class="progressbar_bar_error" style="width:100px;"></div>
                    <div class="progressbar_text">Interner Fehler</div>
                  </div>
                </td><td>
                  Der letzte Scan dieser Aufgabe hat zu einem Fehler geführt.
                  Der neueste neueste Bericht kann unvollständig sein oder
                  komplett fehlen. Im letzteren Fall stammt der neueste sichtbare
                  Bericht aus einem früheren Scan.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Abgeschlossen">
                    <div class="progressbar_bar_done" style="width:100px;"></div>
                    <div class="progressbar_text">Abgeschlossen</div>
                  </div>
                </td><td>
                  Die Aufgabe hat erfolgreich einen Scan abgeschlossen und einen
                  Bericht erzeugt. Der neueste Bericht ist vollständig in Hinsicht
                  auf die Ziele und die Scan-Konfiguration der Aufgabe.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Container">
                    <div class="progressbar_bar_done" style="width:100px;"></div>
                    <div class="progressbar_text">Container</div>
                  </div>
                </td><td>
                  Die Aufgabe ist eine Container-Aufgabe.
              </td></tr>
            </table>
          </td>
        </tr>
        <tr class="odd">
          <td>Berichte: Gesamt</td>
          <td>Die Anzahl Berichte, die durch Ausführen dieser Aufgabe erzeugt
              wurden. Die erste Zahl gibt an, wie viele Berichte über
              abgeschlossene Scans für die Aufgabe existieren, während die
              Zahl in Klammern auch Berichte unvollständiger Scans beinhaltet.<br/>
              Ein Klick auf eine der Zahlen führt Sie zu einer entsprechenden
              Liste der Berichte.</td>
        </tr>
        <tr class="even">
          <td>Berichte: Letzter</td>
          <td>Datum, wann der letzte abgeschlossene Bericht erzeugt wurde.
              Sie können zu diesem Bericht springen, indem sie auf das Datum
              klicken.</td>
        </tr>
        <tr class="odd">
          <td>Schweregrad</td>
          <td>Der höchste Schweregrad im neuesten Bericht. Der Balken ist
              je nach Schwere-Niveau gefärbt, wie durch die aktuelle
              <a href="/help/my_settings.html?token={/envelope/token}#severity_class">Severity Class</a>
              definiert:
            <br/>
            <table>
              <tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'8.0'"/>
                    <xsl:with-param name="extra_text" select="' (Hoch)'"/>
                    <xsl:with-param name="title" select="'Hoch'"/>
                  </xsl:call-template>
                </td>
                <td>
                  Ein roter Balken wird gezeigt, wenn der maximale Schweregrad
                  im Bereich 'Hoch' liegt.
                </td>
              </tr><tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'5.0'"/>
                    <xsl:with-param name="extra_text" select="' (Mittel)'"/>
                    <xsl:with-param name="title" select="'Mittel'"/>
                  </xsl:call-template>
                </td>
                <td>
                  Ein gelber Balken wird gezeigt, wenn der maximale Schweregrad
                  im Bereich 'Mittel' liegt.
                </td>
              </tr><tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'2.0'"/>
                    <xsl:with-param name="extra_text" select="' (Niedrig)'"/>
                    <xsl:with-param name="title" select="'Niedrig'"/>
                  </xsl:call-template>
                </td>
                <td>
                  Ein blauer Balken wird gezeigt, wenn der maximale Schweregrad
                  im Bereich 'Niedrig' liegt.
                </td>
              </tr><tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'0.0'"/>
                    <xsl:with-param name="extra_text" select="' (Log)'"/>
                    <xsl:with-param name="title" select="'Log'"/>
                  </xsl:call-template>
                </td>
                <td>
                  Ein leerer Balken wird gezeigt, wenn keine Schwachstellen
                  gefunden wurden. Eventuell hat ein NVT Log-Informationen
                  erzeugt, so dass der Bericht nicht unbedingt leer ist.
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr class="even">
          <td>Trend</td>
          <td>Beschreibt die Änderung des Schweregrades vom vorletzten Bericht
              zum aktuellen:
            <br/>
            <table>
              <tr>
                <td valign="top"><img src="/img/trend_up.png"/></td>
                <td>
                  Schweregrad hat zugenommen: Im neuesten Bericht hat mindestens
                  ein NVT für mindestens einen Ziel-Host einen höheren
                  Schweregrad gemeldet als im vorherigen Bericht.
                </td>
              </tr><tr>
                <td valign="top"><img src="/img/trend_more.png"/></td>
                <td>
                  Anzahl Schwachstellen hat zugenommen: Der maximale Schweregrad
                  im neuesten und vorherigen Bericht ist gleich. Allerdings
                  enthält der aktuelle Bericht mehr Sicherheitsmeldungen vom
                  gleichen Schwereniveau als der vorherige.
                </td>
              </tr><tr>
                <td valign="top"><img src="/img/trend_nochange.png"/></td>
                <td>
                  Schwachstellen haben sich nicht geändert: Sowohl der maximale
                  Schweregrad als auch die Schwereniveaus sind im neuesten
                  und vorherigen Bericht identisch.
                </td>
              </tr><tr>
                <td valign="top"><img src="/img/trend_less.png"/></td>
                <td>
                  Anzahl Schwachstellen hat abgenommen: Der maximale Schweregrad
                  im neuesten und vorherigen Bericht ist gleich. Allerdings
                  enthält der aktuelle Bericht weniger Sicherheitsmeldungen vom
                  gleichen Schwereniveau als der vorherige.
                </td>
              </tr><tr>
                <td valign="top"><img src="/img/trend_down.png"/></td>
                <td>
                  Schweregrad hat abgenommen: Im neuesten Bericht ist der
                  höchste gemeldete Schweregrad niedriger als der höchste im
                  vorherigen Bericht.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <xsl:call-template name="filtering_de"/>
      <xsl:call-template name="sorting_de"/>

      <a name="autorefresh"></a>
      <h3>Auto-refresh</h3>
      <p>
       Die Aufgaben-Übersicht erlaubt es Ihnen, ein Zeitintervall
       für ein automatisches Aktualisieren der Seite festzulegen.
       Wählen sie hierzu eines der Intervalle (10 Sekunden, 30 Sekunden
       oder 60 Sekunden) und bestätigen Sie durch Drücken des
       <img src="/img/refresh.png" alt="Aktualisieren" title="Aktualisieren"/>-Icons.
      </p>
      <p>
       Die momentane Auswahl für die aktuelle Seite ist mit einem Haken (&#8730;) markiert.
      </p>
      <p>
       Beachten Sie, dass beim Verlassen der Seite das Aktualisierungsintervall
       auf manuelle Aktualisierung zurückgesetzt wird.
      </p>

      <a name="wizard"></a>
      <h3>Aufgaben-Wizard</h3>
      <p>
       Der Aufgaben-Wizard bietet eine einfache Möglichkeit, eine Aufgabe zu
       erstellen und zu starten, wobei nur eine IP-Adresse oder ein Hostname
       angegeben werden muss.
      </p>
      <p>
       Wenn wenige Aufgaben in der Aufgaben-Tabelle vorhanden sind, wird der
       Aufgaben-Wizard unter der Tabelle angezeigt. Die Benutzereinstellung
       "Wizard Rows" legt die Anzahl Zeilen in der Tabelle fest, oberhalb der
       Wizard standardmäßig ausgeblendet wird.
      </p>
      <p>
       Das Wizard-Icon <img src="/img/wizard.png" alt="Wizard zeigen" title="Wizard zeigen"/>
       führt zu einer eigenständigen Seite, die den Wizard bereitstellt.
      </p>

      <a name="overrides"></a>
      <h3>Übersteuerungen</h3>
      <p>
       Das Icon im Kopf der Schweregrad-Spalte zeigt an, ob die eingerichteten
       <a href="glossary.html?token={/envelope/token}#override">Übersteuerungen</a>
       angewendet werden
       (<img src="/img/enabled.png" alt="Übersteuerungen werden angewendet" title="Übersteuerungen werden angewendet"/>)
       oder nicht (<img src="/img/disabled.png" alt="Keine Übersteuerungen" title="Keine Übersteuerungen"/>).
      </p>
      <p>
       Standardmäßig werden Übersteuerungen angewendet. Indem Sie auf auf das
       Icon klicken, können sie zu einer Ansicht in der keine Übersteuerungen
       angewendet werden und zurück wechseln.
       In der Tabellenansicht können sich beim Umschalten die Schweregrade
       und Trends ändern.
      </p>
      <p>
       Beachten Sie, dass die Auswahl auf das Anwenden von Übersteuerungen
       zurückgesetzt wird, wenn Sie die Seite verlassen. Ausnahmen sind
       die Details-Seite der Aufgabe und Berichte bzw. Berichtlisten.
      </p>

      <a name="actions"></a>
      <h3>Aktionen</h3>

      <h4>Aufgabe starten</h4>
      <p>
       Indem sie auf das Start-Icon <img src="/img/start.png" alt="Starten" title="Starten"/>
       drücken, starten Sie einen neuen Scan. Die Liste der Aufgaben wird
       aktualisiert.
      </p>
      <p>
       Diese Aktion ist nur verfügbar, wenn die Aufgabe den Status "Neu" oder
       "Abgeschlossen" hat und weder an einen Zeitplan gebunden noch eine
       Container-Aufgabe ist.
      </p>

      <h4>Zeitplan-Details</h4>
      <p>
        Wenn Sie auf das "Zeitplan-Details"-Icon <img src="/img/scheduled.png"
          alt="Zeitplan-Details" title="Zeitplan-Details"/> drücken, wechseln
        Sie zu einer Übersicht der Details für den Zeitplan, der für diese
        Aufgabe verwendet wird.
      </p>
      <p>
       Diese Aktion ist nur verfügbar, wenn die Aufgabe an einen Zeitplan
       gebunden ist.
      </p>

      <h4>Aufgabe fortsetzen</h4>
      <p>
       Indem Sie auf das Fortsetzen-Icon <img src="/img/resume.png"
         alt="Fortsetzen" title="Fortsetzen"/> drücken, setzen Sie eine zuvor
       pausierte oder gestoppte Aufgabe fort. Die Liste der Aufgaben wird
       aktualisiert.
      </p>
      <p>
        Diese Aktion ist nur verfügbar, wenn die Aufgabe zuvor angehalten wurde,
        entweder von Hand oder durch die im Zeitplan festgelegte Dauer.
      </p>

      <h4>Aufgabe stoppen</h4>
      <p>
       Indem Sie das Stopp-Icon <img src="/img/stop.png" alt="Stoppen"
       title="Stoppen"/> drücken, stoppen Sie eine laufende Aufgabe.
       Die Liste der Aufgaben wird aktualisiert.
      </p>
      <p>
       Diese Aktion ist nur verfügbar, wenn die Aufgabe entweder läuft oder
       pausiert ist.
      </p>

      <h4>Aufgabe in den Mülleimer verschieben</h4>
      <p>
       Indem Sie das Mülleimer-Icon <img src="/img/trashcan.png"
       alt="Move to Trashcan" title="To Trashcan"/> drücken, verschieben Sie
       den Eintrag in den Mülleimer. Die Liste der Aufgaben wird aktualisiert.
       Beachten Sie, dass alle mit der Aufgabe verbundenen Berichte ebenfalls
       in den Mülleimer verschoben werden.
      </p>
      <p>
       Diese Aktion ist nur verfügbar, wenn die Aufgabe den Status "Neu",
       "Abgeschlossen", "Gestoppt" oder "Container" hat.
      </p>

      <a name="edit_task"></a>
      <h4>Aufgabe bearbeiten</h4>
      <p>
       Indem Sie das "Aufgabe bearbeiten"-Icon <img src="/img/edit.png"
         alt="Aufgabe bearbeiten" title="Aufgabe bearbeiten"/> drücken,
       wechseln Sie zu einer Übersicht zur Konfiguration dieser Aufgabe,
       in der Sie einige Eigenschaften der Aufgabe bearbeiten können.
      </p>
    </div>
  </div>
</xsl:template>


<xsl:template mode="help" match="contents.html">
  <div class="gb_window_part_center">Hilfe: Inhalt</div>
  <div class="gb_window_part_content">
    <div style="text-align:left">

      <h1>Inhalt</h1>
      <p>
       Dies ist das Hilfesystem von Greenbone Security Assistant.
       Kleine
       <a href="/help/contents.html?token={/envelope/token}" title="Hilfe">
       <img src="/img/help.png"/>
       </a>-Icons überall im Web-Interface lassen sie zu den entsprechenden
       Inhalten springen.
       Alternativ können sie auch in der folgenden Struktur blättern.
      </p>

      <div id="list">
        <ul>
          <li> Scan-Management</li>
          <ul>
            <li> <a href="tasks.html?token={/envelope/token}">Aufgaben</a></li>
              <!-- TODO: Translate further -->
              <ul>
                <li> <a href="new_task.html?token={/envelope/token}">New Task</a></li>
                <li> <a href="task_details.html?token={/envelope/token}">Task Details and Reports</a></li>
                <li> <a href="view_report.html?token={/envelope/token}">View Report</a></li>
                  <ul>
                    <li> <a href="result_details.html?token={/envelope/token}">Result Details</a></li>
                  </ul>
              </ul>
            <li> <a href="notes.html?token={/envelope/token}">Notes</a> </li>
              <ul>
                <li> <a href="new_note.html?token={/envelope/token}">New Note</a></li>
                <li> <a href="note_details.html?token={/envelope/token}">Note Details</a></li>
              </ul>
            <li> <a href="overrides.html?token={/envelope/token}">Overrides</a></li>
              <ul>
                <li> <a href="new_override.html?token={/envelope/token}">New Override</a></li>
                <li> <a href="override_details.html?token={/envelope/token}">Override Details</a></li>
              </ul>
          </ul>
          <li> Asset Management</li>
          <ul>
            <li> <a href="hosts.html?token={/envelope/token}">Hosts</a></li>
          </ul>
          <li> SecInfo Management</li>
          <ul>
            <li> <a href="nvts.html?token={/envelope/token}">NVTs</a></li>
              <ul>
                <li> <a href="nvt_details.html?token={/envelope/token}">NVT Details</a></li>
              </ul>
            <li> <a href="cves.html?token={/envelope/token}">CVEs</a></li>
              <ul>
                <li> <a href="cve_details.html?token={/envelope/token}">CVE Details</a></li>
              </ul>
            <li> <a href="cpes.html?token={/envelope/token}">CPEs</a></li>
              <ul>
                <li> <a href="cpe_details.html?token={/envelope/token}">CPE Details</a></li>
              </ul>
            <li> <a href="ovaldefs.html?token={/envelope/token}">OVAL Definitions</a></li>
              <ul>
                <li> <a href="ovaldef_details.html?token={/envelope/token}">OVAL Definition Details</a></li>
              </ul>
            <li> <a href="dfn_cert_advs.html?token={/envelope/token}">DFN-CERT Advisories</a></li>
              <ul>
                <li> <a href="dfn_cert_adv_details.html?token={/envelope/token}">DFN-CERT Advisory Details</a></li>
              </ul>
            <li> <a href="allinfo.html?token={/envelope/token}">All SecInfo</a></li>
          </ul>
          <li> Configuration</li>
          <ul>
            <li> <a href="configs.html?token={/envelope/token}">Scan Configs</a></li>
            <ul>
              <li> <a href="new_config.html?token={/envelope/token}">New Scan Config</a></li>
              <li> <a href="config_details.html?token={/envelope/token}">Scan Config Details</a></li>
              <li> <a href="config_family_details.html?token={/envelope/token}">Scan Config Family Details</a></li>
              <li> <a href="config_nvt_details.html?token={/envelope/token}">Scan Config NVT Details</a></li>
              <li> <a href="config_editor.html?token={/envelope/token}">Scan Config Editor</a></li>
              <li> <a href="config_editor_nvt_families.html?token={/envelope/token}">Scan Config Family Editor</a></li>
              <li> <a href="config_editor_nvt.html?token={/envelope/token}">Scan Config NVT Editor</a></li>
            </ul>
            <li> <a href="targets.html?token={/envelope/token}">Targets</a></li>
              <ul>
                <li> <a href="new_target.html?token={/envelope/token}">New Target</a></li>
                <li> <a href="target_details.html?token={/envelope/token}">Target Details</a></li>
              </ul>
            <li> <a href="lsc_credentials.html?token={/envelope/token}">Credentials</a></li>
              <ul>
                <li> <a href="new_lsc_credential.html?token={/envelope/token}">New Credential</a></li>
                <li> <a href="lsc_credential_details.html?token={/envelope/token}">Credential Details</a></li>
              </ul>
            <li> <a href="agents.html?token={/envelope/token}">Agents</a></li>
              <ul>
                <li> <a href="new_agent.html?token={/envelope/token}">New Agent</a></li>
                <li> <a href="agent_details.html?token={/envelope/token}">Agent Details</a></li>
              </ul>
            <li> <a href="alerts.html?token={/envelope/token}">Alerts</a></li>
              <ul>
                <li> <a href="new_alert.html?token={/envelope/token}">New Alert</a></li>
                <li> <a href="alert_details.html?token={/envelope/token}">Alert Details</a></li>
              </ul>
            <li> <a href="tags.html?token={/envelope/token}">Tags</a></li>
              <ul>
                <li> <a href="new_tag.html?token={/envelope/token}">New Tag</a></li>
                <li> <a href="tag_details.html?token={/envelope/token}">Tag Details</a></li>
              </ul>
            <li> <a href="filters.html?token={/envelope/token}">Filters</a></li>
              <ul>
                <li> <a href="new_filter.html?token={/envelope/token}">New Filter</a></li>
                <li> <a href="filter_details.html?token={/envelope/token}">Filter Details</a></li>
              </ul>
            <li> <a href="schedules.html?token={/envelope/token}">Schedules</a></li>
              <ul>
                <li> <a href="new_schedule.html?token={/envelope/token}">New Schedule</a></li>
                <li> <a href="schedule_details.html?token={/envelope/token}">Schedule Details</a></li>
              </ul>
            <li> <a href="permissions.html?token={/envelope/token}">Permissions</a></li>
              <ul>
                <li> <a href="new_permission.html?token={/envelope/token}">New Permission</a></li>
                <li> <a href="permission_details.html?token={/envelope/token}">Permission Details</a></li>
              </ul>
            <li> <a href="port_lists.html?token={/envelope/token}">Port Lists</a></li>
              <ul>
                <li> <a href="new_port_list.html?token={/envelope/token}">New Port List</a></li>
                <li> <a href="port_list_details.html?token={/envelope/token}">Port List Details</a></li>
              </ul>
            <li> <a href="report_formats.html?token={/envelope/token}">Report Formats</a></li>
              <ul>
                <li> <a href="new_report_format.html?token={/envelope/token}">New Report Format</a></li>
                <li> <a href="report_format_details.html?token={/envelope/token}">Report Format Details</a></li>
              </ul>
            <li> <a href="slaves.html?token={/envelope/token}">Slaves</a></li>
              <ul>
                <li> <a href="new_slave.html?token={/envelope/token}">New Slave</a></li>
                <li> <a href="slave_details.html?token={/envelope/token}">Slave Details</a></li>
              </ul>
          </ul>
          <li> Administration</li>
          <ul>
            <li> <a href="users.html?token={/envelope/token}">Users</a></li>
              <ul>
                <li> <a href="user_details.html?token={/envelope/token}">User Details</a></li>
                <li> <a href="new_user.html?token={/envelope/token}">New User</a></li>
              </ul>
            <li> <a href="groups.html?token={/envelope/token}">Groups</a></li>
              <ul>
                <li> <a href="new_group.html?token={/envelope/token}">New Group</a></li>
                <li> <a href="group_details.html?token={/envelope/token}">Group Details</a></li>
              </ul>
            <li> <a href="roles.html?token={/envelope/token}">Roles</a></li>
              <ul>
                <li> <a href="role_details.html?token={/envelope/token}">Role Details</a></li>
              </ul>
            <li> <a href="feed_management.html?token={/envelope/token}">NVT Feed Management</a></li>
            <li> <a href="scap_management.html?token={/envelope/token}">SCAP Feed Management</a></li>
            <li> <a href="cert_management.html?token={/envelope/token}">CERT Feed Management</a></li>
          </ul>
          <li> Miscellaneous</li>
          <ul>
            <li> <a href="trashcan.html?token={/envelope/token}">Trashcan</a></li>
            <li> <a href="my_settings.html?token={/envelope/token}">My Settings</a></li>
            <li> <a href="performance.html?token={/envelope/token}">Performance</a></li>
            <li> <a href="cvss_calculator.html?token={/envelope/token}">CVSS Calculator</a></li>
            <li> <a href="powerfilter.html?token={/envelope/token}">Powerfilter</a></li>
            <li> <a href="user-tags.html?token={/envelope/token}">User Tags list</a></li>
            <li> <a href="nvts.html?token={/envelope/token}">NVT Details</a></li>
            <li> Protocol Documentation</li>
              <ul>
                <li> <a href="/omp?cmd=get_protocol_doc&amp;token={/envelope/token}">OMP (OpenVAS Management Protocol)</a></li>
              </ul>
            <li> <a href="javascript.html?token={/envelope/token}">JavaScript</a></li>
            <li> <a href="error_messages.html?token={/envelope/token}">Error Messages</a></li>
            <li> <a href="glossary.html?token={/envelope/token}">Glossary</a></li>
          </ul>
        </ul>
      </div>
    </div>
  </div>
</xsl:template>

</xsl:stylesheet>
