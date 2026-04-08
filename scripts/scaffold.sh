#!/usr/bin/env bash
# Hatch scaffold — generate pages, controllers, and routes.
#
# Usage:
#   scripts/scaffold.sh page <Name> [path]
#   scripts/scaffold.sh controller <Name>
#   scripts/scaffold.sh route <method> <path> <Controller.action> [--auth|--guest]
#
# Examples:
#   scripts/scaffold.sh page Posts                       # page + controller + GET /posts
#   scripts/scaffold.sh page Auth/Profile /profile       # nested page
#   scripts/scaffold.sh controller Billing                # controller only
#   scripts/scaffold.sh route get /health Public.health   # route only

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PAGES_DIR="$ROOT/src/views/pages"
CTRL_DIR="$ROOT/src/controllers"
ROUTES_FILE="$ROOT/src/routes/route.ts"

red()   { printf '\033[31m%s\033[0m\n' "$*" >&2; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
info()  { printf '  %s\n' "$*"; }

die() { red "error: $*"; exit 1; }

# --- helpers ---------------------------------------------------------------

# PascalCase guard
assert_pascal() {
	case "$1" in
		[A-Z]*) ;;
		*) die "name must be PascalCase: $1" ;;
	esac
}

# Name -> kebab path segment (Posts -> posts, BlogPosts -> blog-posts)
kebab() {
	printf '%s' "$1" \
		| sed -E 's/([a-z0-9])([A-Z])/\1-\2/g' \
		| tr '[:upper:]' '[:lower:]'
}

# basename of a page path: Auth/Profile -> Profile
basename_of() { printf '%s' "${1##*/}"; }

# Insert a route line before `export default route;`
insert_route_line() {
	local line="$1"
	grep -qF "$line" "$ROUTES_FILE" && { info "route already present, skipping"; return; }
	# Insert a blank separator only if the previous line isn't already blank
	awk -v ins="$line" '
		/^export default route;/ && !done {
			print ins
			print ""
			done = 1
		}
		{ print }
	' "$ROUTES_FILE" > "$ROUTES_FILE.tmp"
	mv "$ROUTES_FILE.tmp" "$ROUTES_FILE"
	info "updated src/routes/route.ts"
}

ensure_import() {
	local import_line="$1"
	grep -qF "$import_line" "$ROUTES_FILE" && return
	# Insert after the last existing import line
	awk -v ins="$import_line" '
		/^import / { last = NR }
		{ lines[NR] = $0 }
		END {
			for (i = 1; i <= NR; i++) {
				print lines[i]
				if (i == last) print ins
			}
		}
	' "$ROUTES_FILE" > "$ROUTES_FILE.tmp"
	mv "$ROUTES_FILE.tmp" "$ROUTES_FILE"
}

# --- generators ------------------------------------------------------------

make_controller() {
	local name="$1"              # Posts  or  Billing
	local file="$CTRL_DIR/${name}Controller.ts"
	if [ -e "$file" ]; then
		info "controller exists: ${name}Controller.ts"
		return
	fi
	cat > "$file" <<TS
import { Request, Response } from 'express';
import { BaseController } from './BaseController';

export class ${name}Controller extends BaseController {
	static async index(req: Request, res: Response) {
		const instance = new ${name}Controller();
		return await instance.render(req, res, '${name}', {
			title: '${name}',
		});
	}
}
TS
	green "created src/controllers/${name}Controller.ts"
}

make_page() {
	local page_path="$1"         # Posts  or  Auth/Profile
	local base
	base="$(basename_of "$page_path")"
	local dir="$PAGES_DIR"
	case "$page_path" in
		*/*) dir="$PAGES_DIR/${page_path%/*}" ;;
	esac
	mkdir -p "$dir"
	local file="$dir/${base}.tsx"
	if [ -e "$file" ]; then
		info "page exists: ${page_path}.tsx"
		return
	fi
	cat > "$file" <<TSX
import { Head } from '@inertiajs/react';

interface Props {
	title: string;
}

export default function ${base}({ title }: Props) {
	return (
		<>
			<Head title="${base}" />
			<div className="min-h-screen bg-gray-50">
				<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
					<h1 className="text-3xl font-light">{title}</h1>
					<p className="mt-4 text-gray-600">
						Edit <code>src/views/pages/${page_path}.tsx</code> to get started.
					</p>
				</main>
			</div>
		</>
	);
}
TSX
	green "created src/views/pages/${page_path}.tsx"
}

add_route() {
	local method="$1"            # get/post/put/delete
	local url="$2"               # /posts
	local target="$3"            # Posts.index
	local guard="$4"             # auth | guest | ""

	case "$method" in
		get|post|put|patch|delete) ;;
		*) die "unknown http method: $method" ;;
	esac

	local ctrl="${target%.*}"
	local action="${target#*.}"
	[ "$ctrl" = "$target" ] && die "route target must be Controller.action (got: $target)"

	ensure_import "import { ${ctrl}Controller } from '../controllers/${ctrl}Controller';"

	local middleware=""
	case "$guard" in
		auth)  middleware=", auth" ;;
		guest) middleware=", guest" ;;
	esac

	local line="route.${method}('${url}'${middleware}, ${ctrl}Controller.${action});"
	insert_route_line "$line"
}

# --- commands --------------------------------------------------------------

cmd_page() {
	local name="${1:-}"
	[ -z "$name" ] && die "usage: scaffold.sh page <Name> [path]"
	assert_pascal "$(basename_of "$name")"

	local base
	base="$(basename_of "$name")"
	local url="${2:-/$(kebab "$base")}"

	make_controller "$base"
	make_page "$name"
	add_route get "$url" "${base}.index" ""
	green "done. visit ${url}"
}

cmd_controller() {
	local name="${1:-}"
	[ -z "$name" ] && die "usage: scaffold.sh controller <Name>"
	assert_pascal "$name"
	make_controller "$name"
}

cmd_route() {
	local method="${1:-}"
	local url="${2:-}"
	local target="${3:-}"
	local guard=""
	case "${4:-}" in
		--auth)  guard=auth ;;
		--guest) guard=guest ;;
		"")      ;;
		*)       die "unknown flag: $4" ;;
	esac
	[ -z "$method" ] || [ -z "$url" ] || [ -z "$target" ] && \
		die "usage: scaffold.sh route <method> <path> <Controller.action> [--auth|--guest]"
	add_route "$method" "$url" "$target" "$guard"
}

# --- entrypoint ------------------------------------------------------------

sub="${1:-}"
shift || true
case "$sub" in
	page)       cmd_page "$@" ;;
	controller) cmd_controller "$@" ;;
	route)      cmd_route "$@" ;;
	""|-h|--help)
		sed -n '2,14p' "$0" | sed 's/^# \{0,1\}//'
		;;
	*) die "unknown command: $sub" ;;
esac
