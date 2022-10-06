import { ExtensionContext, commands } from 'vscode';

import { registerCommand } from './command/command';
import { HamibotConfig } from './lib/projectConfig';

export async function activate(context: ExtensionContext) {
	console.log('hamibot-assistant is now active!');

	// 创建当前工作区的配置文件
	globalThis.currentConfig = await HamibotConfig.newConfigFile();

	// 创建指令显示判断上下文
	commands.executeCommand(
		'setContext',
		'hamibot-assistant.isProjectFolder',
		global.currentConfig.isInProjectFolder()
	);

	// 注册指令
	registerCommand(context);
}

export function deactivate() {
	console.log('hamibot-assistant is now deactivated!');
}
