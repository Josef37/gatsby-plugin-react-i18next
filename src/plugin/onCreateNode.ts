import type {CreateNodeArgs, Node} from 'gatsby';
import type {FileSystemNode, PluginOptions, LocaleNodeInput} from '../types';
import {DEFAULT_SOURCE_NAME, NODE_TYPE} from '../constants';

export const shouldOnCreateNode = (
  {node}: {node: Node},
  {localeJsonSourceName = DEFAULT_SOURCE_NAME}: PluginOptions
) => {
  return (
    node.internal.type === 'File' &&
    node.sourceInstanceName === localeJsonSourceName &&
    node.internal.mediaType === `application/json`
  );
};

export const onCreateNode = async (
  args: CreateNodeArgs<FileSystemNode>,
  pluginOptions: PluginOptions
) => {
  const {node, actions, loadNodeContent, createNodeId, createContentDigest, reporter} = args;
  const {absolutePath, relativeDirectory, name, id} = node;
  const {verbose = true} = pluginOptions;

  const activityTimer = verbose
    ? reporter.activityTimer(
        `gatsby-plugin-react-i18next: create node: ${relativeDirectory}/${name}`
      )
    : null;
  activityTimer?.start();

  // Assigning `relativeDirectory` requires that there are no sub-directories
  // and each directory is named exactly like the language string.
  const language = relativeDirectory;
  const content = await loadNodeContent(node);

  // verify & canonicalize indent. (do not care about key order)
  let data: string;
  try {
    data = JSON.stringify(JSON.parse(content), undefined, '');
  } catch {
    const error = new Error(`Unable to parse JSON for file ${node.absolutePath}`);
    activityTimer?.panic(error);
    throw error;
  }

  const {createNode, createParentChildLink} = actions;

  const localeNode: LocaleNodeInput = {
    id: createNodeId(`${id} >>> Locale`),
    children: [],
    parent: id,
    internal: {
      type: NODE_TYPE,
      contentDigest: createContentDigest(data)
    },
    language: language,
    ns: name,
    data,
    fileAbsolutePath: absolutePath
  };

  createNode(localeNode);

  createParentChildLink({parent: node, child: localeNode});

  activityTimer?.end();
};
