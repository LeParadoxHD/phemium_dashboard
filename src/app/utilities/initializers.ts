import { NgxMonacoEditorConfig } from 'ngx-monaco-editor-v2';

export function monacoInitializer(config: NgxMonacoEditorConfig) {
  return (): Promise<any> => {
    return new Promise<void>((resolve: any) => {
      const baseUrl = config.baseUrl || './assets';
      if (typeof (<any>window).monaco === 'object') {
        resolve();
        return;
      }
      const onGotAmdLoader: any = (require?: any) => {
        let usedRequire = require || (<any>window).require;
        let requireConfig = { paths: { vs: `${baseUrl}/monaco/min/vs` } };

        // Load monaco
        usedRequire.config(requireConfig);
        usedRequire([`vs/editor/editor.main`], () => {
          if (typeof config.onMonacoLoad === 'function') {
            config.onMonacoLoad();
          }
          (<any>window).monaco.editor.defineTheme('dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
              'editor.background': '#212529'
            }
          });
          resolve();
        });
      };

      if (config.monacoRequire) {
        onGotAmdLoader(config.monacoRequire);
        // Load AMD loader if necessary
      } else if (!(<any>window).require) {
        const loaderScript: HTMLScriptElement = document.createElement('script');
        loaderScript.type = 'text/javascript';
        loaderScript.src = `${baseUrl}/monaco/min/vs/loader.js`;
        loaderScript.addEventListener('load', () => {
          onGotAmdLoader();
        });
        document.body.appendChild(loaderScript);
        // Load AMD loader without over-riding node's require
      } else if (!(<any>window).require.config) {
        var src = `${baseUrl}/monaco/min/vs/loader.js`;

        var loaderRequest = new XMLHttpRequest();
        loaderRequest.addEventListener('load', () => {
          let scriptElem = document.createElement('script');
          scriptElem.type = 'text/javascript';
          scriptElem.text = [
            // Monaco uses a custom amd loader that over-rides node's require.
            // Keep a reference to node's require so we can restore it after executing the amd loader file.
            'var nodeRequire = require;',
            loaderRequest.responseText.replace('"use strict";', ''),
            // Save Monaco's amd require and restore Node's require
            'var monacoAmdRequire = require;',
            'require = nodeRequire;',
            'require.nodeRequire = require;'
          ].join('\n');
          document.body.appendChild(scriptElem);
          onGotAmdLoader((<any>window).monacoAmdRequire);
        });
        loaderRequest.open('GET', src);
        loaderRequest.send();
      } else {
        onGotAmdLoader();
      }
    });
  };
}
