/** @type {import('@commitlint/types').UserConfig} */
export default {
	extends: ["@commitlint/config-conventional"],
	rules: {
		"type-enum": [
			2,
			"always",
			[
				"feat", // new feature
				"fix", // bug fix
				"docs", // documentation only
				"style", // formatting, no logic change
				"refactor", // code change that isn't fix or feat
				"perf", // performance improvement
				"test", // adding or fixing tests
				"chore", // build, deps, tooling
				"revert", // revert a commit
				"ci", // CI/CD changes
			],
		],
		"type-case": [2, "always", "lower-case"],
		"type-empty": [2, "never"],
		"subject-empty": [2, "never"],
		"subject-full-stop": [2, "never", "."],
		"header-max-length": [2, "always", 100],
	},
};
