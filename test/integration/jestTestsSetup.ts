import { getDefaultEnvVars } from "./jestGlobalSetup";

afterAll(() => {
	if (getDefaultEnvVars) {
		process.env = getDefaultEnvVars();
	}
});
