import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';

/**
 * This file defines the Forge backend resolver for the Jira Filter replica macro.
 * The resolver exposes a single function (`getJiraIssues`) that executes a
 * JQL query and returns a subset of fields specified by the macro configuration.
 *
 * Note: Backend files in Forge projects must use the `.js` extension. Using
 * `.jsx` can cause bundling errors because the Forge bundler treats JSX
 * differently and will not automatically stub the built‑in `@forge/*` modules.
 */
const resolver = new Resolver();

resolver.define('getJiraIssues', async (req) => {
  const { jql, columns } = req.payload;

  if (!jql) {
    return { issues: [], total: 0, error: 'JQL query is required.' };
  }

  try {
    const response = await api
      .asUser()
      .requestJira(route`/rest/api/3/search?jql=${encodeURIComponent(jql)}&fields=${columns.join(',')}`);

    const data = await response.json();

    if (!response.ok) {
      console.error('Jira API Error:', JSON.stringify(data, null, 2));
      const errorMessage = data.errorMessages ? data.errorMessages.join(' ') : `HTTP ${response.status}`;
      return { issues: [], total: 0, error: `Failed to fetch from Jira: ${errorMessage}` };
    }

    const issues = data.issues.map(issue => {
      let mappedIssue = { key: issue.key };
      columns.forEach(col => {
        mappedIssue[col] = issue.fields[col];
      });
      return mappedIssue;
    });

    return {
      issues: issues,
      total: data.total,
      error: null
    };

  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return { issues: [], total: 0, error: 'An unexpected error occurred while fetching issues.' };
  }
});

export const run = resolver.getDefinitions();