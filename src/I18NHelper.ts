import * as _ from 'lodash';
import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';

enum TOKEN {
    undef = 1,
    inactive,
    active,
    ignore
};

interface Token {
    type: TOKEN;
    name: string;
    value: string;
    line: string;
};


export class I18NHelper {
    i18nCodeTokens: Array<string> = [];
    i18nFileTokens: Array<Token> = [];

    config: vscode.WorkspaceConfiguration;
    appended: number = 0;
    activated: number = 0;
    deactivated: number = 0;

    constructor() {

    }

    executeFocusedEditor() {
        this.config = vscode.workspace.getConfiguration('ui15.i18n.helper');
        this.appended = 0;
        this.activated = 0;
        this.deactivated = 0;
        Promise.all([
            this.searchForTokensInI18N(),
            this.searchForTokensInCode(vscode.window.activeTextEditor.document)
        ]).then(data => {
            this.saveFile(false);
        });
    }

    execute() {
        this.config = vscode.workspace.getConfiguration('ui15.i18n.helper');
        this.appended = 0;
        this.activated = 0;
        this.deactivated = 0;
        Promise.all([
            this.searchForTokensInI18N(),
            this.searchForTokensInCode()
        ]).then(data => {
            this.saveFile(true);
        });

    }
    saveFile(deactiveTokens: boolean) {
        let msg;
        let rootPath = (vscode.workspace.workspaceFolders) ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';
        let outputFile = <string>path.join(rootPath, this.config.get("outputFileName"));
        let finalTokens = this.mergeTokens(deactiveTokens);
        if (this.i18nCodeTokens.length === 0) {
            vscode.window.showInformationMessage("No File Found to find Tokens!");
            return;
        }
        try {
            fs.writeFileSync(outputFile, finalTokens.join('\n') + '\n');
        } catch (e) {
            vscode.window.showInformationMessage("Error Saving final I18N File");
        }
        if (deactiveTokens) {
            msg = `I18N Tokens: ${this.appended} Added,  ${this.activated} Activated, ${this.deactivated} Deactivate`;
        } else {
            msg = `I18N Tokens: ${this.appended} Added,  ${this.activated} Activated`;
        }
        vscode.window.showInformationMessage(msg);
    }

    async searchForTokensInI18N() {
        let rootPath = (vscode.workspace.workspaceFolders) ? vscode.workspace.workspaceFolders[0].uri.path : '';
        let i18nFile = vscode.Uri.file(path.join(rootPath, this.config.get("outputFileName")));
        let outputPattern = "^(#*)([^= ]+) *= *([^#]*)(#*)";
        try {
            await vscode.workspace.fs.readFile(i18nFile).then((file: Uint8Array) => {
                this.i18nFileTokens = _.chain(file.toString().split("\n"))
                    .map((row) => {
                        let match = row.match(outputPattern);
                        let retval: Token = {} as Token;
                        retval.type = TOKEN.undef;
                        retval.line = row;
                        if (match !== null) {
                            if (match[4] === "#") {
                                retval.type = TOKEN.ignore;
                            } else if (match[1] === "#") {
                                retval.type = TOKEN.inactive;
                            } else {
                                retval.type = TOKEN.active;
                            }
                            retval.name = match[2];
                            retval.value = match[3];
                        }
                        return retval;
                    }).dropRightWhile(function (token) {
                        return token.line === '';
                    }).value();
                return this.i18nFileTokens;
            });
        } catch (error) {
            vscode.window.showInformationMessage(`File ${i18nFile} not found`);
        }
    }

    async searchForTokensInCode(document?: vscode.TextDocument) {
        if (document) {
            this.searchForTokensinCode([document.uri]);
        } else {
            await this.searchForFiles()
                .then(filesUri => this.searchForTokensinCode(filesUri));
        }
    }

    async searchForFiles(): Promise<vscode.Uri[]> {
        let filesUri: vscode.Uri[] = [];
        let arSearchFiles: string[] = this.config.get('searchFiles') || [""];
        for (let i in arSearchFiles) {
            await vscode.workspace.findFiles(<string>arSearchFiles[i]).then((uris: vscode.Uri[]) => {
                uris.forEach((uri: vscode.Uri) => {
                    filesUri.push(uri);
                });
            });
        }
        return filesUri;
    }

    async searchForTokensinCode(filesUri: vscode.Uri[]) {
        let patterns: string[];
        let ext: string;
        for (let i in filesUri) {
            ext = path.extname(filesUri[i].path).toLowerCase();
            if (ext === '.json') {
                patterns = <string[]>this.config.get('jsonPattern');
            } else if (ext === '.xml' || ext === '.html') {
                patterns = <string[]>this.config.get('xmlhtmlPattern');
            } if (ext === '.js') {
                patterns = <string[]>this.config.get('jsPattern');
            }
            await vscode.workspace.fs.readFile(filesUri[i]).then((file: Uint8Array) => {
                patterns.forEach(pattern => {
                    let matches = file.toString().match(new RegExp(pattern, 'gm')) || [];
                    matches.forEach((matchedString: string) => {
                        this.i18nCodeTokens = this.i18nCodeTokens.concat(<string[]>((new RegExp(pattern)).exec(matchedString.toString()).slice(1)));
                    });
                });
            });
        }
    }

    mergeTokens(deactiveTokens: boolean) {
        const defaultTranslation = this.config.get("defaultTranslation");

        //Find new Tokens to Add
        let tokensToAdd = _.chain(this.i18nCodeTokens)
            .filter((token) => {
                return _.find(this.i18nFileTokens, (v) => {
                    return (v.type === TOKEN.ignore || v.type === TOKEN.active || v.type === TOKEN.inactive) && v.name === token;
                }) === undefined;
            })
            .uniqWith(_.isEqual)
            .map((token) => {
                //log('APPEND token ' + gutil.colors.cyan(token));
                this.appended++;
                return {
                    type: TOKEN.active,
                    line: token + "=" + (defaultTranslation ? defaultTranslation : token),
                    name: token,
                    value: token
                };
            }).value();

        //Find Tokens to deactive
        if (deactiveTokens) {
            _.chain(this.i18nFileTokens).filter((token) => {
                return token.type === TOKEN.active &&
                    /*                _.find(config.noDeactivateTokens, function (v) {
                                        return v === token.name;
                                    }) === undefined &&*/
                    _.find(this.i18nCodeTokens, (v) => {
                        return v == token.name;
                    }) === undefined;
            }).map((token) => {
                //log('DEACTIVATE token ' + gutil.colors.cyan(token.name));
                this.deactivated++;
                token.line = "#" + token.line;
            }).value();
        }

        //Find Tokens to active
        _.chain<Token>(this.i18nFileTokens).filter((token: Token): any => {
            return token.type === TOKEN.inactive
                && _.find(this.i18nCodeTokens, (v) => {
                    return v === token.name;
                });
        }).map((token) => {
            //log('ACTIVATE token ' + gutil.colors.cyan(token.name));
            this.activated++;
            token.line = token.line.substr(1);
        }).value();

        let ret = _.chain(this.i18nFileTokens)
            .concat(tokensToAdd)
            .map((token) => {
                return token.line;
            }).value();
        return ret;
    }
}