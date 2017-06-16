import path from 'path';

const cssModuleToTypescriptInterfaceProperties = (cssModuleKeys, indent = '  ') => {
  return cssModuleKeys
    .map((key) => `${indent}'${key}': string;`)
    .join('\n');
};

export const filenameToTypingsFilename = (filename) => {
  const dirName = path.dirname(filename);
  const baseName = path.basename(filename);
  return path.join(dirName, `${baseName}.flow`);
};

export const generateGenericExportInterface = (cssModuleKeys, filename, indent) => {
  const interfaceProperties = cssModuleToTypescriptInterfaceProperties(cssModuleKeys, indent);
  return (
`// @flow
declare module.exports: {|
${interfaceProperties}
|};
`);
};
