/**
 * Lint config for the MimirAPI n8n community node. Uses
 * eslint-plugin-n8n-nodes-base to enforce n8n's node + credential conventions.
 */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
    extraFileExtensions: ['.json'],
  },
  plugins: ['n8n-nodes-base'],
  extends: ['plugin:n8n-nodes-base/nodes', 'plugin:n8n-nodes-base/credentials'],
  rules: {
    // The credentials preset is contradictory for community packages:
    // `cred-class-field-documentation-url-miscased` demands a camelCase slug
    // while `cred-class-field-documentation-url-not-http-url` demands an HTTP
    // URL, and `-missing` forbids omitting the field — no value satisfies all
    // three. The miscased rule's own docs scope it to "nodes in the main
    // repository" (its implementation just fails to check — the
    // isCommunityCredential guard is a tautology), and n8n's community-node
    // docs specify documentationUrl as a URL, so we keep the URL rules
    // enforcing and switch off the main-repo-only one.
    'n8n-nodes-base/cred-class-field-documentation-url-miscased': 'off',
  },
};
