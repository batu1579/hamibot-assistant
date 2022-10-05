import * as vscode from 'vscode';

import { registerCommand } from './command/command';
import { HamibotConfig } from './lib/projectConfig';

export async function activate(context: vscode.ExtensionContext) {
	console.log('hamibot-assistant is now active!');

	// 创建当前工作区的配置文件
	globalThis.currentConfig = await HamibotConfig.newConfigFile();

	// 注册指令
	registerCommand(context);
}

// export function deactivate(arg: [number, number]) {}
