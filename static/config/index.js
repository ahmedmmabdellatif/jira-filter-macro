import ForgeUI, { render, TextField, ConfigForm } from '@forge/ui';

const Config = () => {
  return (
    <ConfigForm>
      <TextField name="jql" label="Enter JQL query" />
    </ConfigForm>
  );
};

export const config = render(<Config />);