import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const ROOT = join(__dirname, '..', '..');
const README_PATH = join(ROOT, 'README.md');
const DOCS_DIR = join(ROOT, 'docs');

function readText(path: string): string {
	return readFileSync(path, 'utf-8');
}

function githubSlug(heading: string): string {
	return heading
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function extractHeadings(markdown: string): string[] {
	const headings: string[] = [];
	const lines = markdown.split('\n');
	for (const line of lines) {
		const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
		if (match) {
			headings.push(match[2].trim());
		}
	}
	return headings;
}

function extractTocLinks(markdown: string): { label: string; anchor: string }[] {
	const links: { label: string; anchor: string }[] = [];
	const inToc = (() => {
		let inside = false;
		return (line: string) => {
			if (/^##\s+Table of contents/i.test(line)) {
				inside = true;
				return inside;
			}
			if (inside && /^##\s+/.test(line) && !/^##\s+Table of contents/i.test(line)) {
				inside = false;
			}
			return inside;
		};
	})();

	const lines = markdown.split('\n');
	for (const line of lines) {
		if (!inToc(line)) continue;
		const match = /\[([^\]]+)\]\(#([^)]+)\)/g;
		let m: RegExpExecArray | null;
		while ((m = match.exec(line)) !== null) {
			links.push({ label: m[1], anchor: m[2] });
		}
	}
	return links;
}

function listMarkdownFiles(dir: string): string[] {
	if (!exists(dir)) return [];
	const out: string[] = [];
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			out.push(...listMarkdownFiles(full));
		} else if (entry.endsWith('.md')) {
			out.push(full);
		}
	}
	return out;
}

function exists(path: string): boolean {
	try {
		statSync(path);
		return true;
	} catch {
		return false;
	}
}

describe('README documentation', () => {
	const readme = readText(README_PATH);
	const headings = extractHeadings(readme);
	const headingAnchors = new Set(headings.map(githubSlug));

	describe('table of contents', () => {
		const tocLinks = extractTocLinks(readme);

		it('has a table of contents section', () => {
			expect(tocLinks.length).toBeGreaterThan(0);
		});

		it('every TOC link points to a heading that exists', () => {
			const missing = tocLinks.filter((l) => !headingAnchors.has(l.anchor));
			expect(missing).toEqual([]);
		});
	});

	describe('retired docs', () => {
		const retiredPaths = [
			'docs/DEVELOPER_GUIDE.md',
			'docs/UPGRADE_SSR.md',
		];

		it('retired doc files do not exist on disk', () => {
			for (const p of retiredPaths) {
				expect(exists(join(ROOT, p))).toBe(false);
			}
		});

		it('no repository file links to a retired doc', () => {
			const allFiles = [
				README_PATH,
				...listMarkdownFiles(DOCS_DIR),
				join(ROOT, 'install.sh'),
			];
			const offenders: string[] = [];
			for (const file of allFiles) {
				if (!exists(file)) continue;
				const text = readText(file);
				for (const p of retiredPaths) {
					if (text.includes(p)) {
						offenders.push(`${file} references ${p}`);
					}
				}
			}
			expect(offenders).toEqual([]);
		});
	});

	describe('local README links', () => {
		const linkRe = /\]\((?!https?:\/\/|#|mailto:)([^)]+)\)/g;
		const linkTargets = new Set<string>();
		let m: RegExpExecArray | null;
		while ((m = linkRe.exec(readme)) !== null) {
			const target = m[1].split('#')[0].trim();
			if (target) linkTargets.add(target);
		}

		it('every local link target in the README exists on disk', () => {
			const missing: string[] = [];
			for (const target of linkTargets) {
				const full = join(ROOT, target);
				if (!exists(full)) missing.push(target);
			}
			expect(missing).toEqual([]);
		});
	});
});
