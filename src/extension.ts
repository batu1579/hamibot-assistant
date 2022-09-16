import * as vscode from 'vscode';

import { registerCommand } from "./command/command";

export async function activate(context: vscode.ExtensionContext) {
	console.log('hamibot-assistant is now active!');

	// 注册指令
	registerCommand(context);
}

// export function deactivate(arg: [number, number]) {}
