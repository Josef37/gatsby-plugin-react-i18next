import {forTesting} from './wrapPageElement';

const {
  redirectToUserLocale,
  getTranslationResources,
  getLocaleNodesFromData,
  validateLocaleNodes,
  normalizeLocaleNodes,
} = forTesting;

describe('redirectToUserLocale', () => {
  // TODO
  it.todo('should work');
});

describe('getTranslationResources', () => {
  // TODO
  it.todo('should work');
});

describe('getLocaleNodesFromData', () => {
  it('should get correct node name', () => {
    const data = {
      'node-name-1': {nodes: ['node-1']},
      'node-name-2': {nodes: ['node-2']},
    };

    expect(getLocaleNodesFromData(data, 'node-name-1')).toEqual(['node-1']);
  });

  it('should prefer edges query', () => {
    const data = {
      'node-name': {
        nodes: ['node-1', 'node-2'],
        edges: [{node: 'node-3'}, {node: 'node-4'}],
      },
    };

    expect(getLocaleNodesFromData(data, 'node-name')).toEqual(['node-3', 'node-4']);
  });

  it('should return empty array when not finding anything', () => {
    const data = {
      'wrong-name': {nodes: ['node-1']},
    };

    expect(getLocaleNodesFromData(data, 'node-name')).toEqual([]);
  });
});

describe('validateLocaleNodes', () => {
  const defaultNode = {
    language: 'de',
    data: '{}',
    namespace: 'common',
  };

  it('should only allow arrays', () => {
    const node = {...defaultNode};
    expect(validateLocaleNodes(node)).toBe(false);
  });

  it('should allow both namespace fields', () => {
    const nodes = [
      {...defaultNode},
      {...defaultNode, namespace: undefined, ns: defaultNode.namespace},
    ];
    expect(validateLocaleNodes(nodes)).toBe(true);
  });

  it('should expect strings', () => {
    const node: any = {language: 123, data: 123, namespace: 123};
    expect(validateLocaleNodes([node])).toBe(false);

    node.language = defaultNode.language;
    expect(validateLocaleNodes([node])).toBe(false);

    node.data = defaultNode.data;
    expect(validateLocaleNodes([node])).toBe(false);

    node.namespace = defaultNode.namespace;
    expect(validateLocaleNodes([node])).toBe(true);
  });
});

describe('normalizeLocaleNodes', () => {
  const defaultNode = {
    language: 'de',
    data: '{}',
    namespace: 'common',
  };
  const defaultNamespace = 'default-namespace';

  it('should do nothing for correct format', () => {
    const node = {...defaultNode};
    expect(normalizeLocaleNodes([node], defaultNamespace)).toEqual([node]);
  });

  it('should strip too much content', () => {
    const node = {...defaultNode, foo: 'bar', other: 'stuff'};
    expect(normalizeLocaleNodes([node], defaultNamespace)).toEqual([defaultNode]);
  });

  it('should translate `ns` field', () => {
    const node: any = {...defaultNode, ns: defaultNode.namespace};
    delete node.namespace;
    expect(normalizeLocaleNodes([node], defaultNamespace)).toEqual([defaultNode]);
  });

  it('should fall back to default namespace', () => {
    const node: any = {...defaultNode};
    delete node.namespace;
    expect(normalizeLocaleNodes([node], defaultNamespace)).toEqual([
      {...node, namespace: defaultNamespace},
    ]);
  });

  it('should work for multipe elements', () => {
    const nodes = [
      {...defaultNode, foo: 'bar'},
      {...defaultNode, namespace: undefined, ns: defaultNode.namespace},
    ];
    expect(normalizeLocaleNodes(nodes, defaultNamespace)).toEqual([defaultNode, defaultNode]);
  });
});
