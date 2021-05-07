# Extension ui5-18n-helper

![Icon](/img/icon.png)

This extension help with the translation in OpenUI5 or SAPUI5 applications. Extensions searches on view and souce code of project for translations tokens and automatically update the translation file.

It was based on the gulp plugin [gulp-i18n-ui5](https://github.com/norbertvolf/gulp-i18n-ui5).

# Usage

Open the command bar (CTRL+SHIFT+P) and type Verify UI5 I18N Tokens
![Usage](/img/usage.gif)


# Extension Config

* Path to I18N file: 
 > default: "src/i18n/i18n.properties"
* Default translation text for new tokens, if empty default translation will be the token
> default: ""
* Glob pattern to search files
>default:
```
    "src/**/*.js"
    "src/manifest.json"
    "src/**/*.xml"
    "src/**/*.html"
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


