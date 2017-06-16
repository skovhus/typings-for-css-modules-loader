import cssLoader from 'css-loader';
import cssLocalsLoader from 'css-loader/locals';
import loaderUtils from 'loader-utils';
import 'colour';

import {
  generateGenericExportInterface,
  filenameToTypingsFilename,
} from './cssModuleToInterface';
import * as persist from './persist';
import loggerCreator from './logger';

function delegateToCssLoader(ctx, input, callback) {
  ctx.async = () => callback;
  cssLoader.call(ctx, input);
}

module.exports = function(input) {
  if(this.cacheable) this.cacheable();

  // mock async step 1 - css loader is async, we need to intercept this so we get async ourselves
  const callback = this.async();

  const query = loaderUtils.parseQuery(this.query);
  const logger = loggerCreator(query.silent);

  const moduleMode = query.modules || query.module;
  if (!moduleMode) {
    logger('warn','Typings for CSS-Modules: option `modules` is not active - skipping extraction work...'.red);
    return delegateToCssLoader(this, input, callback);
  }

  // mock async step 2 - offer css loader a "fake" callback
  this.async = () => (err, content) => {
    if (err) {
      return callback(err);
    }
    const filename = this.resourcePath;
    const cssModuleInterfaceFilename = filenameToTypingsFilename(filename);

    const keyRegex = /"([^\\"]+)":/g;
    let match;
    const cssModuleKeys = [];

    while (match = keyRegex.exec(content)) {
      if (cssModuleKeys.indexOf(match[1]) < 0) {
        cssModuleKeys.push(match[1]);
      }
    }

    let cssModuleDefinition;
    cssModuleDefinition = generateGenericExportInterface(cssModuleKeys, filename);
    persist.writeToFileIfChanged(cssModuleInterfaceFilename, cssModuleDefinition);
    // mock async step 3 - make `async` return the actual callback again before calling the 'real' css-loader
    delegateToCssLoader(this, input, callback);
  };
  cssLocalsLoader.call(this, input);
};
