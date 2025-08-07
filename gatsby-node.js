const {pluginOptionsSchema} = require('./dist/plugin/pluginOptionsSchema');
const {onCreatePage} = require('./dist/plugin/onCreatePage');
const {onCreateNode} = require('./dist/plugin/onCreateNode');
const {shouldOnCreateNode} = require('./dist/plugin/onCreateNode');

exports.pluginOptionsSchema = pluginOptionsSchema;
exports.onCreatePage = onCreatePage;
exports.onCreateNode = onCreateNode;
exports.shouldOnCreateNode = shouldOnCreateNode;
