import api, { route } from "@forge/api";

// Main function to resolve the macro
export const run = async (request) => {
  const jql = request.extension.params.jql || "project = DEMO";
  const response = await api.asApp().requestJira(route`/rest/api/3/search`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
    params: {
      jql,
    },
  });

  const data = await response.json();

  const issuesHtml = data.issues.map(issue => `<p>${issue.fields.summary} (Key: ${issue.key})</p>`).join('');

  return {
    body: `<div>${issuesHtml}</div>`,
  };
};

// Configuration function for macro
export const config = async (request) => {
  return {
    body: `
      <div>
        <label for="jql">JQL Query:</label>
        <input type="text" id="jql" name="jql" value="" />
      </div>
    `,
  };
};
