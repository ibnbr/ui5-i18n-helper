import * as vscode from 'vscode';
import { I18NHelper } from './I18NHelper';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('ui5-i18n-helper.i18n', () => {
		let a = new I18NHelper();
		a.execute();
	});

	context.subscriptions.push(disposable);
}


export function deactivate() {}
