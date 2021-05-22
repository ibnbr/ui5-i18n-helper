# Extension ui5-18n-helper

![Icon](/img/icon.png)

This extension help with the translation in OpenUI5 or SAPUI5 applications. Extensions searches on view and souce code of project for translations tokens and automatically update the translation file.

It was based on the gulp plugin [gulp-i18n-ui5](https://github.com/norbertvolf/gulp-i18n-ui5).

# Usage

Open the command bar (CTRL+SHIFT+P) and choose one of the commands
*UI5 I18N> Verify I18N Tokens in entire Project - This command search all code for Tokens to Add/Activate/Deactivate
*UI5 I18N> Verify I18N Tokens on focused Editor - This command search only the file of focused Editor for Tokens to Add/Activate
![Usage](/img/usage.gif)


# Extension Config

* Path to I18N file: 
 > default: "src/i18n/i18n.properties"
* Default translation text for new tokens, if empty default translation will be the token
> default: ""
* Glob pattern to search files
>default:
```
    "**/*.js"
    "manifest.json"
    "**/*.xml"
    "**/*.html"
```
* Pattern for *.HTML and *.XML files
>default:
```
    "'i18n>([^']+)'"
    "\\{i18n>([^}]+)\\}"
    "\\{@i18n>(@[^}]+)\\}"
```
* Pattern for *.JSON files
>default:
```
    "\\{\\{([^}]+)\\}\\}"
    "\\{@i18n>([^}]+)\\}"
```
* Pattern for *.JS files
>default:
```
    "(?:getText|__)\\([\"']([^\"']+)[\"']"
    "(?:nGetText)\\([\"']([^\"']+)[\"'], *[\"']([^\"']+)[\"']"
```


# TODO
*Ignore Tokens in commented Source
*Option to delete token instead of deactivate
*And More???