import type {CreateNodeArgs, Node} from 'gatsby';
import type {FileSystemNode, PluginOptions, LocaleNodeInput} from '../types';
import {DEFAULT_SOURCE_NAME} from '../constants';

export const shouldOnCreateNode = (
  {node}: {node: Node},
  {localeJsonSourceName = DEFAULT_SOURCE_NAME}: PluginOptions
) => {
  if (node.internal.type !== 'File') return false;

  // User explicitly disabled the plugin.
  if (localeJsonSourceName == null) return false;

  if (localeJsonSourceName !== node.sourceInstanceName) return false;

  if (node.internal.mediaType !== `application/json`) return false;

  return true;
};

export const onCreateNode = async (
  // @ts-ignore
  args: CreateNodeArgs<FileSystemNode>,
  pluginOptions: PluginOptions
) => {
  const {node, actions, loadNodeContent, createNodeId, createContentDigest, reporter} = args;
  const {absolutePath, relativeDirectory, name, id} = node;
  const {verbose = true} = pluginOptions;

  let activity;
  if (verbose) {
    activity = reporter.activityTimer(
      `gatsby-plugin-react-i18next: create node: ${relativeDirectory}/${name}`
    );
    activity.start();
  }

  // relativeDirectory name is language name.
  const language = relativeDirectory;
  const content = await loadNodeContent(node);

  // verify & canonicalize indent. (do not care about key order)
  let data: string;
  try {
    data = JSON.stringify(JSON.parse(content), undefined, '');
  } catch {
    const hint = node.absolutePath ? `file ${node.absolutePath}` : `in node ${node.id}`;
    throw new Error(`Unable to parse JSON: ${hint}`);
  }

  const {createNode, createParentChildLink} = actions;

  const localeNode: LocaleNodeInput = {
    id: createNodeId(`${id} >>> Locale`),
    children: [],
    parent: id,
    internal: {
      content: data,
      contentDigest: createContentDigest(data),
      type: `Locale`
    },
    language: language,
    ns: name,
    data,
    fileAbsolutePath: absolutePath
  };

  createNode(localeNode);

  // @ts-ignore
  // staled issue: https://github.com/gatsbyjs/gatsby/issues/19993
  createParentChildLink({parent: node, child: localeNode});

  if (verbose && activity) {
    activity.end();
  }
};
