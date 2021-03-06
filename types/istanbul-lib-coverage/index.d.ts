declare module 'istanbul-lib-coverage' {
	export class CoverageSummary {
		lines: any[];
		statements: any[];
		branches: any[];
		functions: any[];
	}

	export class CoverageMap {
		addFileCoverage(pathOrObject: string | object): void;
		files(): string[];
		fileCoverageFor(filename: string): FileCoverage;
		merge(data: object | CoverageMap): void;
	}

	export class FileCoverage {
		toSummary(): CoverageSummary;
	}

	export function createCoverageMap(data?: any): CoverageMap;
	export function createCoverageSummary(): CoverageSummary;
	export function createFileCoverage(pathOrObject: string | object): FileCoverage;
}
