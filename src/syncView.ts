
import * as vscode from "vscode";

export interface SyncActionNode { id: string; label: string; command: string }

export class SyncTree implements vscode.TreeDataProvider<SyncActionNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  refreshTree(): void { this._onDidChangeTreeData.fire(); }

  getTreeItem(element: SyncActionNode): vscode.TreeItem {
    return this.getTreeItemForAction(element);
  }

  async getChildren(): Promise<SyncActionNode[]> {
    return this.getActionNodes();
  }

  getTreeItemForAction(element: SyncActionNode): vscode.TreeItem {
    const item = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.None);
    if (element.id === "toggleAutoSync") {
      item.command = { command: "microPythonHelper.toggleWorkspaceAutoSync", title: element.label };
      item.iconPath = new vscode.ThemeIcon("sync");
    } else {
      item.command = { command: "microPythonHelper.runFromView", title: element.label, arguments: [element.command] };
      if (element.id === "baseline") item.iconPath = new vscode.ThemeIcon("cloud-upload");
      if (element.id === "baselineFromBoard") item.iconPath = new vscode.ThemeIcon("cloud-download");
      if (element.id === "checkDiffs") item.iconPath = new vscode.ThemeIcon("diff");
      if (element.id === "syncDiffsLocalToBoard") item.iconPath = new vscode.ThemeIcon("cloud-upload");
      if (element.id === "syncDiffsBoardToLocal") item.iconPath = new vscode.ThemeIcon("cloud-download");
      if (element.id === "deleteAllBoard") item.iconPath = new vscode.ThemeIcon("trash", new vscode.ThemeColor("charts.red"));
    }
    return item;
  }

  async getActionNodes(): Promise<SyncActionNode[]> {
    // Determina el estado actual de autosync para mostrarlo en el label
    let autoSyncLabel = "Toggle AutoSync";
    try {
      const ws = vscode.workspace.workspaceFolders?.[0];
      if (ws) {
        const cfg = require('fs').existsSync(ws.uri.fsPath + '/.mpy-workbench/config.json')
          ? JSON.parse(require('fs').readFileSync(ws.uri.fsPath + '/.mpy-workbench/config.json', 'utf8'))
          : {};
        const enabled = typeof cfg.autoSyncOnSave === 'boolean'
          ? cfg.autoSyncOnSave
          : vscode.workspace.getConfiguration().get<boolean>('microPythonHelper.autoSyncOnSave', false);
        autoSyncLabel = enabled ? 'AutoSync: ON (click to disable)' : 'AutoSync: OFF (click to enable)';
      }
    } catch {}
    return [
      { id: "toggleAutoSync", label: autoSyncLabel, command: "microPythonHelper.toggleWorkspaceAutoSync" },
      { id: "baseline", label: "Upload all files (Local → Board)", command: "microPythonHelper.syncBaseline" },
      { id: "baselineFromBoard", label: "Download all files (Board → Local)", command: "microPythonHelper.syncBaselineFromBoard" },
      { id: "checkDiffs", label: "Check for differences (local vs board)", command: "microPythonHelper.checkDiffs" },
      { id: "syncDiffsLocalToBoard", label: "Sync changed Files Local → Board", command: "microPythonHelper.syncDiffsLocalToBoard" },
      { id: "syncDiffsBoardToLocal", label: "Sync changed Files Board → Local", command: "microPythonHelper.syncDiffsBoardToLocal" },
      { id: "deleteAllBoard", label: "Delete ALL files on Board", command: "microPythonHelper.deleteAllBoard" }
    ];
  }
}
