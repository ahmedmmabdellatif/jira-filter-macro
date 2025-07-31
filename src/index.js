import Resolver from '@forge/resolver';
import api from '@forge/api';

const resolver = new Resolver();

resolver.define('main', async (req) => {
  const jql = req.context.extension.config.jql || 'project = ABC ORDER BY created DESC';
  const res = await api.asApp().requestJira('/rest/api/3/search?jql=' + encodeURIComponent(jql));
  const data = await res.json();
  if (!data.issues) return 'No issues found or JQL invalid.';
  return data.issues.map(i => `${i.key}: ${i.fields.summary}`).join('\n');
});

export const handler = resolver.getDefinitions();