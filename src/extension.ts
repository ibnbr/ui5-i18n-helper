import * as vscode from 'vscode';
import { I18NHelper } from './I18NHelper';

export function activate(context: vscode.ExtensionContext) {
	let extension = new I18NHelper();

	let disposable = vscode.commands.registerCommand('ui5-i18n-helper.i18n', () => {
		extension.execute();
	});

	context.subscriptions.push(disposable);

	let disposable2 = vscode.commands.registerCommand('ui5-i18n-helper.i18nfocused', () => {
		extension.executeFocusedEditor();
	});

	context.subscriptions.push(disposable2);
}


export function deactivate() {}
