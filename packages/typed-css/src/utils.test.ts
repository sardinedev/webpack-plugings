import { describe, expect, it } from "vitest";
import {
	buildDefaultExport,
	buildNamedExports,
	buildTsExports,
	buildbanner,
	getCssModuleKeys,
	isReservedKeyword,
	sanitiseKebabCase,
} from "./utils";

describe("Get CSS Module Keys", () => {
	it("should return undefined if no CSS module is found", () => {
		const cssModuleOutput = `
      options { banner: 'This file is automatically generated.' }
      module.exports = {
      };
      
      module.exports.__checksum = "ae6837329564"
    `;
		const cssModuleKeys = getCssModuleKeys(cssModuleOutput);
		expect(cssModuleKeys).toBe(undefined);
	});

	it("should return an array of CSS Modules keys", () => {
		const cssModuleOutput = `
      options { banner: 'This file is automatically generated.' }
      getCssModuleKeys // Exports
      module.exports = {
              "main": "page_main__ibFHK",
              "description": "page_description__s_Lqk",
              "code": "page_code__Cdcue",
      };
      
      module.exports.__checksum = "ae6837329564"
    `;
		const cssModuleKeys = getCssModuleKeys(cssModuleOutput);
		expect(cssModuleKeys).toEqual(["main", "description", "code"]);
	});
});

describe("Build banner", () => {
	it("should return the default banner message if no options are passed", () => {
		const expectedBanner =
			"// This is an auto generated file.\n// Please do not edit.\n\n";
		const banner = buildbanner();
		expect(banner).toBe(expectedBanner);
	});

	it("should return the default banner message if banner prop is not present", () => {
		const expectedBanner =
			"// This is an auto generated file.\n// Please do not edit.\n\n";
		const banner = buildbanner({});
		expect(banner).toBe(expectedBanner);
	});

	it("should return an empty string if banner prop is set to false", () => {
		const banner = buildbanner({ banner: false });
		expect(banner).toBe("");
	});

	it("should return a custom string if banner prop is provided", () => {
		const banner = buildbanner({ banner: "Custom banner" });
		expect(banner).toBe("// Custom banner\n\n");
	});
});

describe("Check reserved JavaScript keywords", () => {
	it("should return true if the selector is a reserved keyword", () => {
		const reservedKeyword = "class";
		const isReserved = isReservedKeyword(reservedKeyword);
		expect(isReserved).toBe(true);
	});

	it("should return false if the selector is not a reserved keyword", () => {
		const reservedKeyword = "custom";
		const isReserved = isReservedKeyword(reservedKeyword);
		expect(isReserved).toBe(false);
	});
});

describe("Build named exports", () => {
	it("should return an empty string if no keys are passed", () => {
		const namedExports = buildNamedExports([]);
		expect(namedExports).toBe("");
	});

	it("should return a string with the named exports", () => {
		const keys = ["key1", "key2", "key3"];
		const namedExports = buildNamedExports(keys);
		const expectedNamedExports =
			"export const key1: string;\nexport const key2: string;\nexport const key3: string;\n";
		expect(namedExports).toBe(expectedNamedExports);
	});

	it("should return a string with the commented reserved keyword named exports", () => {
		const keys = ["class", "key2", "key3"];
		const namedExports = buildNamedExports(keys);
		const expectedNamedExports = `// Hey, Typed CSS here! Just to let you know I commented this type because it's a reserved Javascript keyword.\n// export const class: string;\nexport const key2: string;\nexport const key3: string;\n`;
		expect(namedExports).toBe(expectedNamedExports);
	});

	it("should comment out kebab-case names and explain why", () => {
		const keys = ["key1", "key2", "my-class"];
		const namedExports = buildNamedExports(keys);
		const expectedNamedExports =
			"export const key1: string;\nexport const key2: string;\n// Hey, Typed CSS here! Just to let you know I commented this type because it contains a hyphen.\n// export const my-class: string;\n";
		expect(namedExports).toBe(expectedNamedExports);
	});
});

describe("Build default exports", () => {
	it("should return an empty string if no keys are passed", () => {
		const defaultExports = buildDefaultExport([]);
		expect(defaultExports).toBe("");
	});

	it("should return a string with the default exports", () => {
		const keys = ["key1", "key2", "key3"];
		const defaultExports = buildDefaultExport(keys);
		const expectedDefaultExports =
			"declare const styles: {\n\tkey1: string;\n\tkey2: string;\n\tkey3: string;\n};\n\nexport default styles;\n";
		expect(defaultExports).toBe(expectedDefaultExports);
	});

	it("should return a string with the default exports even if contains reserved javascript names", () => {
		const keys = ["class", "key2", "key3"];
		const defaultExports = buildDefaultExport(keys);
		const expectedDefaultExports =
			"declare const styles: {\n\tclass: string;\n\tkey2: string;\n\tkey3: string;\n};\n\nexport default styles;\n";
		expect(defaultExports).toBe(expectedDefaultExports);
	});

	it("should return a string with sanatised kebab names", () => {
		const keys = ["class", "key2", "my-class"];
		const defaultExports = buildDefaultExport(keys);
		const expectedDefaultExports = `declare const styles: {\n\tclass: string;\n\tkey2: string;\n\t"my-class": string;\n};\n\nexport default styles;\n`;
		expect(defaultExports).toBe(expectedDefaultExports);
	});
});

describe("Build TypeScript exports", () => {
	it("should return an empty string if modules array is empty", () => {
		const tsExports = buildTsExports([]);
		expect(tsExports).toBe("");
	});

	it("should return a string with both named and default exports", () => {
		const tsExports = buildTsExports(["key1", "key2", "key3"]);
		const expected =
			"export const key1: string;\nexport const key2: string;\nexport const key3: string;\n\ndeclare const styles: {\n\tkey1: string;\n\tkey2: string;\n\tkey3: string;\n};\n\nexport default styles;\n";
		expect(tsExports).toBe(expected);
	});

	it("should return a string with both named and default exports alphabetically sorted", () => {
		const tsExports = buildTsExports(["a", "c", "b"]);
		const expected =
			"export const a: string;\nexport const b: string;\nexport const c: string;\n\ndeclare const styles: {\n\ta: string;\n\tb: string;\n\tc: string;\n};\n\nexport default styles;\n";
		expect(tsExports).toBe(expected);
	});
});

describe("Sanitise kebab-case class names", () => {
	it("should return a string wrapped in quotes", () => {
		const kebabClass = "class-name";
		const expected = `"class-name"`;
		const sanitised = sanitiseKebabCase(kebabClass);
		expect(sanitised).toBe(expected);
	});

	it("should return the original string", () => {
		const kebabClass = "hello";
		const expected = "hello";
		const sanitised = sanitiseKebabCase(kebabClass);
		expect(sanitised).toBe(expected);
	});
});