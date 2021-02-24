module.exports = {
	root: true,
	env: {
		node: true,
	},
	extends: [
		"eslint:recommended"
	],
	parserOptions: {
		ecmaVersion: 2020,
	},
	rules: {
		"no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
		"no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
		"@typescript-eslint/explicit-module-boundary-types": "off",
	},
	overrides: [
		{
			files: ["**/*.js"],
			rules: {
				"@typescript-eslint/no-this-alis": "off",
				"no-this-alis": "off",
			},
		},
	],
};
