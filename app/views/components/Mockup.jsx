import { useState } from 'react';
const IDE_FILES = {
    'public.js': {
        lang: 'JavaScript',
        lines: [
            { n: 1, t: <><span className="text-[#6a9955]">// app/controllers/public.js</span></> },
            { n: 2, t: <><span className="text-[#c586c0]">import</span> {'{'} renderPage {'}'} <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]">&apos;@/primitives/inertia&apos;</span></> },
            { n: 3, t: '' },
            { n: 4, t: <><span className="text-[#c586c0]">export function</span> <span className="text-[#dcdcaa]">index</span>(req, res) {'{'}</> },
            { n: 5, t: <span className="pl-4"><span className="text-[#c586c0]">return</span> <span className="text-[#dcdcaa]">renderPage</span>(req, res, <span className="text-[#ce9178]">&apos;Home&apos;</span>, {'{'}</span> },
            { n: 6, t: <span className="pl-8">timestamp: <span className="text-[#c586c0]">new</span> <span className="text-[#4ec9b0]">Date</span>().<span className="text-[#dcdcaa]">toISOString</span>(),</span> },
            { n: 7, t: <span className="pl-4">{'}'})</span> },
            { n: 8, t: '}' },
        ],
    },
    'users.js': {
        lang: 'JavaScript',
        lines: [
            { n: 1, t: <><span className="text-[#6a9955]">// app/controllers/users.js</span></> },
            { n: 2, t: <><span className="text-[#c586c0]">import</span> {'{'} renderPage {'}'} <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]">&apos;@/primitives/inertia&apos;</span></> },
            { n: 3, t: '' },
            { n: 4, t: <><span className="text-[#c586c0]">const</span> users = [{'{'} id: <span className="text-[#b5cea8]">1</span>, name: <span className="text-[#ce9178]">&apos;Alice&apos;</span> {'}'}]</> },
            { n: 5, t: '' },
            { n: 6, t: <><span className="text-[#c586c0]">export function</span> <span className="text-[#dcdcaa]">index</span>(req, res) {'{'}</> },
            { n: 7, t: <span className="pl-4"><span className="text-[#c586c0]">return</span> <span className="text-[#dcdcaa]">renderPage</span>(req, res, <span className="text-[#ce9178]">&apos;Users&apos;</span>, {'{'} users {'}'})</span> },
            { n: 8, t: '}' },
            { n: 9, t: '' },
            { n: 10, t: <><span className="text-[#c586c0]">export function</span> <span className="text-[#dcdcaa]">show</span>(req, res) {'{'}</> },
            { n: 11, t: <span className="pl-4"><span className="text-[#c586c0]">const</span> user = users.<span className="text-[#dcdcaa]">find</span>(entry =&gt; entry.id === <span className="text-[#dcdcaa]">parseInt</span>(req.params.id))</span> },
            { n: 12, t: <span className="pl-4"><span className="text-[#c586c0]">return</span> <span className="text-[#dcdcaa]">renderPage</span>(req, res, <span className="text-[#ce9178]">&apos;User&apos;</span>, {'{'} user {'}'})</span> },
            { n: 13, t: '}' },
        ],
    },
    'auth.js': {
        lang: 'JavaScript',
        lines: [
            { n: 1, t: <><span className="text-[#6a9955]">// app/controllers/auth.js</span></> },
            { n: 2, t: <><span className="text-[#c586c0]">import</span> {'{'} renderPage {'}'} <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]">&apos;@/primitives/inertia&apos;</span></> },
            { n: 3, t: <><span className="text-[#c586c0]">import</span> variables <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]">&apos;@/config/variables&apos;</span></> },
            { n: 4, t: <><span className="text-[#c586c0]">import</span> {'{'} loginUser, registerUser {'}'} <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]">&apos;@/core/auth&apos;</span></> },
            { n: 5, t: <><span className="text-[#c586c0]">import</span> {'{'} readLogin, readRegister {'}'} <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]">&apos;@/controllers/auth&apos;</span></> },
            { n: 6, t: '' },
            { n: 7, t: '' },
            { n: 8, t: <><span className="text-[#c586c0]">export function</span> <span className="text-[#dcdcaa]">showLogin</span>(req, res) {'{'} <span className="text-[#c586c0]">return</span> <span className="text-[#dcdcaa]">renderPage</span>(req, res, <span className="text-[#ce9178]">&apos;Auth/Login&apos;</span>) {'}'}</> },
            { n: 9, t: <><span className="text-[#c586c0]">export async function</span> <span className="text-[#dcdcaa]">login</span>(req, res) {'{'} <span className="text-[#6a9955]">/* ... */</span> {'}'}</> },
            { n: 10, t: <><span className="text-[#c586c0]">export function</span> <span className="text-[#dcdcaa]">showRegister</span>(req, res) {'{'} <span className="text-[#6a9955]">/* ... */</span> {'}'}</> },
            { n: 11, t: <><span className="text-[#c586c0]">export async function</span> <span className="text-[#dcdcaa]">register</span>(req, res) {'{'} <span className="text-[#6a9955]">/* ... */</span> {'}'}</> },
            { n: 12, t: <><span className="text-[#c586c0]">export async function</span> <span className="text-[#dcdcaa]">forgotPassword</span>(req, res) {'{'} <span className="text-[#6a9955]">/* ... */</span> {'}'}</> },
            { n: 13, t: <><span className="text-[#c586c0]">export async function</span> <span className="text-[#dcdcaa]">resetPassword</span>(req, res) {'{'} <span className="text-[#6a9955]">/* ... */</span> {'}'}</> },
            { n: 14, t: <><span className="text-[#c586c0]">export async function</span> <span className="text-[#dcdcaa]">verifyEmail</span>(req, res) {'{'} <span className="text-[#6a9955]">/* ... */</span> {'}'}</> },
            { n: 15, t: <><span className="text-[#c586c0]">export function</span> <span className="text-[#dcdcaa]">dashboard</span>(req, res) {'{'} <span className="text-[#6a9955]">/* ... */</span> {'}'}</> },
            { n: 16, t: <><span className="text-[#c586c0]">export async function</span> <span className="text-[#dcdcaa]">logout</span>(req, res) {'{'} <span className="text-[#6a9955]">/* ... */</span> {'}'}</> },
        ],
    },
    'route.js': {
        lang: 'JavaScript',
        lines: [
            { n: 1, t: <><span className="text-[#c586c0]">import</span> {'{'} Router {'}'} <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]">&apos;express&apos;</span></> },
            { n: 2, t: <><span className="text-[#c586c0]">import</span> * <span className="text-[#c586c0]">as</span> publicPages <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]">&apos;@/controllers/public&apos;</span></> },
            { n: 3, t: <><span className="text-[#c586c0]">import</span> * <span className="text-[#c586c0]">as</span> auth <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]">&apos;@/controllers/auth&apos;</span></> },
            { n: 4, t: <><span className="text-[#c586c0]">import</span> * <span className="text-[#c586c0]">as</span> users <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]">&apos;@/controllers/users&apos;</span></> },
            { n: 5, t: <><span className="text-[#c586c0]">import</span> {'{'} auth, guest {'}'} <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]">&apos;@/middleware/auth&apos;</span></> },
            { n: 6, t: '' },
            { n: 7, t: <><span className="text-[#c586c0]">const</span> route = <span className="text-[#dcdcaa]">Router</span>()</> },
            { n: 8, t: '' },
            { n: 9, t: <><span className="text-[#6a9955]">// Public</span></> },
            { n: 10, t: <>route.<span className="text-[#dcdcaa]">get</span>(<span className="text-[#ce9178]">&apos;/&apos;</span>, publicPages.index)</> },
            { n: 11, t: '' },
            { n: 12, t: <><span className="text-[#6a9955]">// Auth</span></> },
            { n: 13, t: <>route.<span className="text-[#dcdcaa]">get</span>(<span className="text-[#ce9178]">&apos;/login&apos;</span>, guest, auth.showLogin)</> },
            { n: 14, t: <>route.<span className="text-[#dcdcaa]">post</span>(<span className="text-[#ce9178]">&apos;/login&apos;</span>, guest, auth.login)</> },
            { n: 15, t: <>route.<span className="text-[#dcdcaa]">get</span>(<span className="text-[#ce9178]">&apos;/register&apos;</span>, guest, auth.showRegister)</> },
            { n: 16, t: '' },
            { n: 17, t: <><span className="text-[#6a9955]">// Protected</span></> },
            { n: 18, t: <>route.<span className="text-[#dcdcaa]">get</span>(<span className="text-[#ce9178]">&apos;/home&apos;</span>, authGuard, auth.dashboard)</> },
            { n: 19, t: <>route.<span className="text-[#dcdcaa]">get</span>(<span className="text-[#ce9178]">&apos;/users&apos;</span>, authGuard, users.index)</> },
            { n: 20, t: <>route.<span className="text-[#dcdcaa]">get</span>(<span className="text-[#ce9178]">&apos;/users/:id&apos;</span>, authGuard, users.show)</> },
            { n: 21, t: '' },
            { n: 22, t: <><span className="text-[#c586c0]">export default</span> route</> },
        ],
    },
    'Dashboard.jsx': {
        lang: 'JavaScript React',
        lines: [
            { n: 1, t: <><span className="text-[#c586c0]">import</span> Navigation <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]">&apos;@/views/components/Navigation&apos;</span></> },
            { n: 2, t: <><span className="text-[#c586c0]">import</span> {'{'} usePage {'}'} <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]">&apos;@inertiajs/react&apos;</span></> },
            { n: 3, t: '' },
            { n: 4, t: <><span className="text-[#c586c0]">export default function</span> <span className="text-[#dcdcaa]">Dashboard</span>() {'{'}</> },
            { n: 5, t: <span className="pl-4"><span className="text-[#c586c0]">const</span> {'{'} props {'}'} = <span className="text-[#dcdcaa]">usePage</span>()</span> },
            { n: 6, t: <span className="pl-4"><span className="text-[#c586c0]">const</span> {'{'} user {'}'} = props</span> },
            { n: 7, t: '' },
            { n: 8, t: <span className="pl-4"><span className="text-[#c586c0]">return</span> (</span> },
            { n: 9, t: <span className="pl-8"><span className="text-[#808080]">&lt;</span><span className="text-[#569cd6]">div</span><span className="text-[#808080]">&gt;</span></span> },
            { n: 10, t: <span className="pl-12"><span className="text-[#808080]">&lt;</span><span className="text-[#4ec9b0]">Navigation</span> <span className="text-[#808080]">/&gt;</span></span> },
            { n: 11, t: <span className="pl-12"><span className="text-[#808080]">&lt;</span><span className="text-[#569cd6]">h2</span><span className="text-[#808080]">&gt;</span>User Information<span className="text-[#808080]">&lt;/</span><span className="text-[#569cd6]">h2</span><span className="text-[#808080]">&gt;</span></span> },
            { n: 12, t: <span className="pl-12"><span className="text-[#808080]">&lt;</span><span className="text-[#569cd6]">p</span><span className="text-[#808080]">&gt;</span>{'{'}user?.name{'}'}<span className="text-[#808080]">&lt;/</span><span className="text-[#569cd6]">p</span><span className="text-[#808080]">&gt;</span></span> },
            { n: 13, t: <span className="pl-12"><span className="text-[#808080]">&lt;</span><span className="text-[#569cd6]">p</span><span className="text-[#808080]">&gt;</span>{'{'}user?.email{'}'}<span className="text-[#808080]">&lt;/</span><span className="text-[#569cd6]">p</span><span className="text-[#808080]">&gt;</span></span> },
            { n: 14, t: <span className="pl-8"><span className="text-[#808080]">&lt;/</span><span className="text-[#569cd6]">div</span><span className="text-[#808080]">&gt;</span></span> },
            { n: 15, t: <span className="pl-4">)</span> },
            { n: 16, t: '}' },
        ],
    },
    'Users.jsx': {
        lang: 'JavaScript React',
        lines: [
            { n: 1, t: <><span className="text-[#c586c0]">import</span> {'{'} Link {'}'} <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]">&apos;@inertiajs/react&apos;</span></> },
            { n: 2, t: '' },
            { n: 3, t: '' },
            { n: 4, t: '' },
            { n: 5, t: '' },
            { n: 6, t: '' },
            { n: 7, t: <><span className="text-[#c586c0]">export default function</span> <span className="text-[#dcdcaa]">Users</span>({'{'} users {'}'}) {'{'}</> },
            { n: 8, t: <span className="pl-4"><span className="text-[#c586c0]">return</span> (</span> },
            { n: 9, t: <span className="pl-8"><span className="text-[#808080]">&lt;</span><span className="text-[#569cd6]">ul</span><span className="text-[#808080]">&gt;</span></span> },
            { n: 10, t: <span className="pl-12">{'{'}users.<span className="text-[#dcdcaa]">map</span>(u =&gt; (</span> },
            { n: 11, t: <span className="pl-16"><span className="text-[#808080]">&lt;</span><span className="text-[#569cd6]">li</span> <span className="text-[#9cdcfe]">key</span>={'{'}u.id{'}'}<span className="text-[#808080]">&gt;</span></span> },
            { n: 12, t: <span className="pl-20"><span className="text-[#808080]">&lt;</span><span className="text-[#4ec9b0]">Link</span> <span className="text-[#9cdcfe]">href</span>={'{'}<span className="text-[#ce9178]">{"`/users/${'{'}u.id${'}'}`"}</span>{'}'}<span className="text-[#808080]">&gt;</span>{'{'}u.name{'}'}<span className="text-[#808080]">&lt;/</span><span className="text-[#4ec9b0]">Link</span><span className="text-[#808080]">&gt;</span></span> },
            { n: 13, t: <span className="pl-16"><span className="text-[#808080]">&lt;/</span><span className="text-[#569cd6]">li</span><span className="text-[#808080]">&gt;</span></span> },
            { n: 14, t: <span className="pl-12">)){'}'}  </span> },
            { n: 15, t: <span className="pl-8"><span className="text-[#808080]">&lt;/</span><span className="text-[#569cd6]">ul</span><span className="text-[#808080]">&gt;</span></span> },
            { n: 16, t: <span className="pl-4">)</span> },
            { n: 17, t: '}' },
        ],
    },
    'index.js': {
        lang: 'JavaScript',
        lines: [
            { n: 1, t: <><span className="text-[#c586c0]">import</span> express <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]">&apos;express&apos;</span></> },
            { n: 2, t: <><span className="text-[#c586c0]">import</span> routes <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]">&apos;@/router/route&apos;</span></> },
            { n: 3, t: <><span className="text-[#c586c0]">import</span> {'{'} applyInertia {'}'} <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]">&apos;@/middleware/inertia&apos;</span></> },
            { n: 4, t: '' },
            { n: 5, t: <><span className="text-[#c586c0]">const</span> app = <span className="text-[#dcdcaa]">express</span>()</> },
            { n: 6, t: '' },
            { n: 7, t: <>app.<span className="text-[#dcdcaa]">use</span>(<span className="text-[#dcdcaa]">applyInertia</span>)</> },
            { n: 8, t: <>app.<span className="text-[#dcdcaa]">use</span>(routes)</> },
            { n: 9, t: '' },
            { n: 10, t: <>app.<span className="text-[#dcdcaa]">listen</span>(<span className="text-[#b5cea8]">3000</span>)</> },
        ],
    },
    'User.js': {
        lang: 'JavaScript',
        lines: [
            { n: 1, t: <><span className="text-[#c586c0]">export class</span> <span className="text-[#4ec9b0]">User</span> {'{'}</> },
            { n: 2, t: <span className="pl-4">emailVerifiedAt</span> },
            { n: 3, t: <span className="pl-4">rememberToken</span> },
            { n: 4, t: <span className="pl-4">createdAt = <span className="text-[#c586c0]">new</span> <span className="text-[#4ec9b0]">Date</span>()</span> },
            { n: 5, t: <span className="pl-4">updatedAt = <span className="text-[#c586c0]">new</span> <span className="text-[#4ec9b0]">Date</span>()</span> },
            { n: 6, t: '' },
            { n: 7, t: '' },
            { n: 8, t: '' },
            { n: 9, t: '' },
            { n: 10, t: '' },
            { n: 11, t: <span className="pl-4"><span className="text-[#dcdcaa]">constructor</span>(id, name, email, password) {'{'}</span> },
            { n: 12, t: <span className="pl-8"><span className="text-[#569cd6]">this</span>.id = id</span> },
            { n: 13, t: <span className="pl-8"><span className="text-[#569cd6]">this</span>.name = name</span> },
            { n: 14, t: <span className="pl-8"><span className="text-[#569cd6]">this</span>.email = email</span> },
            { n: 15, t: <span className="pl-8"><span className="text-[#569cd6]">this</span>.password = password</span> },
            { n: 16, t: <span className="pl-4">{'}'}</span> },
            { n: 17, t: '}' },
        ],
    },
    'PasswordReset.js': {
        lang: 'JavaScript',
        lines: [
            { n: 1, t: <><span className="text-[#c586c0]">export class</span> <span className="text-[#4ec9b0]">PasswordReset</span> {'{'}</> },
            { n: 2, t: <span className="pl-4">email</span> },
            { n: 3, t: <span className="pl-4">tokenHash</span> },
            { n: 4, t: <span className="pl-4">createdAt = <span className="text-[#c586c0]">new</span> <span className="text-[#4ec9b0]">Date</span>()</span> },
            { n: 5, t: '}' },
        ],
    },
    'Session.js': {
        lang: 'JavaScript',
        lines: [
            { n: 1, t: <><span className="text-[#c586c0]">export class</span> <span className="text-[#4ec9b0]">Session</span> {'{'}</> },
            { n: 2, t: <span className="pl-4">id</span> },
            { n: 3, t: <span className="pl-4">userId</span> },
            { n: 4, t: <span className="pl-4">ipAddress</span> },
            { n: 5, t: <span className="pl-4">userAgent</span> },
            { n: 6, t: <span className="pl-4">payload</span> },
            { n: 7, t: <span className="pl-4">lastActivity</span> },
            { n: 8, t: '}' },
        ],
    },
    'orm.config.js': {
        lang: 'JavaScript',
        lines: [
            { n: 1, t: <><span className="text-[#c586c0]">import</span> {'{'} defineConfig {'}'} <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]">&apos;@mikro-orm/core&apos;</span></> },
            { n: 2, t: <><span className="text-[#c586c0]">import</span> {'{'} SqliteDriver {'}'} <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]">&apos;@mikro-orm/sqlite&apos;</span></> },
            { n: 3, t: '' },
            { n: 4, t: <><span className="text-[#c586c0]">export default</span> <span className="text-[#dcdcaa]">defineConfig</span>({'{'}</> },
            { n: 5, t: <span className="pl-4">driver: SqliteDriver,</span> },
            { n: 6, t: <span className="pl-4">dbName: <span className="text-[#ce9178]">&apos;app.db&apos;</span>,</span> },
            { n: 7, t: <span className="pl-4">entities: [<span className="text-[#ce9178]">&apos;./dist/models&apos;</span>],</span> },
            { n: 8, t: <span className="pl-4">migrations: {'{'} path: <span className="text-[#ce9178]">&apos;./db/migrations&apos;</span> {'}'},</span> },
            { n: 9, t: '{\'}\')' },
        ],
    },
    'Mailer.js': {
        lang: 'JavaScript',
        lines: [
            { n: 1, t: <><span className="text-[#c586c0]">import</span> nodemailer <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]">&apos;nodemailer&apos;</span></> },
            { n: 2, t: '' },
            { n: 3, t: <><span className="text-[#c586c0]">export class</span> <span className="text-[#4ec9b0]">Mailer</span> {'{'}</> },
            { n: 4, t: <span className="pl-4"><span className="text-[#c586c0]">static async</span> <span className="text-[#dcdcaa]">send</span>(to, subject, html) {'{'}</span> },
            { n: 5, t: <span className="pl-8"><span className="text-[#c586c0]">const</span> transport = nodemailer.<span className="text-[#dcdcaa]">createTransport</span>(config.mail)</span> },
            { n: 6, t: <span className="pl-8"><span className="text-[#c586c0]">await</span> transport.<span className="text-[#dcdcaa]">sendMail</span>({'{'} to, subject, html {'}'})</span> },
            { n: 7, t: <span className="pl-4">{'}'}</span> },
            { n: 8, t: '}' },
        ],
    },
    'sendWelcomeEmail.js': {
        lang: 'JavaScript',
        lines: [
            { n: 1, t: <><span className="text-[#c586c0]">import</span> {'{'} Mailer {'}'} <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]">&apos;@/mail/Mailer&apos;</span></> },
            { n: 2, t: <><span className="text-[#c586c0]">import</span> {'{'} User {'}'} <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]">&apos;@/models/User&apos;</span></> },
            { n: 3, t: '' },
            { n: 4, t: <><span className="text-[#c586c0]">export default async function</span> <span className="text-[#dcdcaa]">SendWelcomeEmail</span>(user) {'{'}</> },
            { n: 5, t: <span className="pl-4"><span className="text-[#c586c0]">await</span> Mailer.<span className="text-[#dcdcaa]">send</span>(user.email, <span className="text-[#ce9178]">&apos;Welcome!&apos;</span>, <span className="text-[#ce9178]">{"`Welcome, ${'{'}user.name${'}'}`"}</span>)</span> },
            { n: 6, t: '}' },
        ],
    },
    'processUpload.js': {
        lang: 'JavaScript',
        lines: [
            { n: 1, t: <><span className="text-[#c586c0]">import</span> {'{'} Storage {'}'} <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]">&apos;@/primitives/storage&apos;</span></> },
            { n: 2, t: '' },
            { n: 3, t: <><span className="text-[#c586c0]">export default async function</span> <span className="text-[#dcdcaa]">ProcessUpload</span>(payload) {'{'}</> },
            { n: 4, t: <span className="pl-4"><span className="text-[#c586c0]">const</span> file = <span className="text-[#c586c0]">await</span> Storage.<span className="text-[#dcdcaa]">get</span>(payload.path)</span> },
            { n: 5, t: <span className="pl-4"><span className="text-[#c586c0]">await</span> Storage.<span className="text-[#dcdcaa]">put</span>(payload.key, file)</span> },
            { n: 6, t: '}' },
        ],
    },
    'pages.js': {
        lang: 'JavaScript',
        lines: [
            { n: 1, t: <><span className="text-[#6a9955]">// Auto-generated page registry</span></> },
            { n: 2, t: '' },
            { n: 3, t: <><span className="text-[#c586c0]">export const</span> pages = {'{'}</> },
            { n: 4, t: <span className="pl-4"><span className="text-[#ce9178]">&apos;Home&apos;</span>: () =&gt; <span className="text-[#c586c0]">import</span>(<span className="text-[#ce9178]">&apos;@/app/views/pages/Home&apos;</span>),</span> },
            { n: 5, t: <span className="pl-4"><span className="text-[#ce9178]">&apos;Dashboard&apos;</span>: () =&gt; <span className="text-[#c586c0]">import</span>(<span className="text-[#ce9178]">&apos;@/app/views/pages/Dashboard&apos;</span>),</span> },
            { n: 6, t: <span className="pl-4"><span className="text-[#ce9178]">&apos;Users&apos;</span>: () =&gt; <span className="text-[#c586c0]">import</span>(<span className="text-[#ce9178]">&apos;@/app/views/pages/Users&apos;</span>),</span> },
            { n: 7, t: <span className="pl-4"><span className="text-[#ce9178]">&apos;Auth/Login&apos;</span>: () =&gt; <span className="text-[#c586c0]">import</span>(<span className="text-[#ce9178]">&apos;@/app/views/pages/Auth/Login&apos;</span>),</span> },
            { n: 8, t: <span className="pl-4"><span className="text-[#ce9178]">&apos;Auth/Register&apos;</span>: () =&gt; <span className="text-[#c586c0]">import</span>(<span className="text-[#ce9178]">&apos;@/app/views/pages/Auth/Register&apos;</span>),</span> },
            { n: 9, t: '}' },
        ],
    },
    'variables.js': {
        lang: 'JavaScript',
        lines: [
            { n: 1, t: <><span className="text-[#c586c0]">function</span> <span className="text-[#dcdcaa]">readNumber</span>(key, fallback) {'{'}</> },
            { n: 2, t: <span className="pl-4"><span className="text-[#c586c0]">const</span> raw = process.env[key]</span> },
            { n: 3, t: <span className="pl-4"><span className="text-[#c586c0]">const</span> value = raw ? <span className="text-[#dcdcaa]">Number</span>(raw) : fallback</span> },
            { n: 4, t: <span className="pl-4"><span className="text-[#c586c0]">if</span> (<span className="text-[#dcdcaa]">Number</span>.<span className="text-[#dcdcaa]">isNaN</span>(value)) <span className="text-[#c586c0]">throw</span> <span className="text-[#c586c0]">new</span> <span className="text-[#dcdcaa]">Error</span>(<span className="text-[#ce9178]">&apos;PORT must be a number&apos;</span>)</span> },
            { n: 5, t: <span className="pl-4"><span className="text-[#c586c0]">return</span> value</span> },
            { n: 6, t: '}' },
            { n: 7, t: '' },
            { n: 8, t: <><span className="text-[#c586c0]">export default</span> {'{'}</> },
            { n: 9, t: <span className="pl-4">NODE_ENV: process.env.NODE_ENV ?? <span className="text-[#ce9178]">&apos;development&apos;</span>,</span> },
            { n: 10, t: <span className="pl-4">PORT: <span className="text-[#dcdcaa]">readNumber</span>(<span className="text-[#ce9178]">&apos;PORT&apos;</span>, <span className="text-[#b5cea8]">3000</span>),</span> },
        ],
    },
};
const IDE_TREE = [
    { name: 'src', indent: 0, folder: 'src', defaultOpen: true },
    { name: 'controllers', indent: 1, folder: 'controllers', defaultOpen: true },
    { name: 'public.js', indent: 2, fileId: 'public.js' },
    { name: 'users.js', indent: 2, fileId: 'users.js' },
    { name: 'auth.js', indent: 2, fileId: 'auth.js' },
    { name: 'database', indent: 1, folder: 'database', defaultOpen: false },
    { name: 'migrations', indent: 2, folder: 'migrations', defaultOpen: false },
    { name: 'orm.config.js', indent: 2, fileId: 'orm.config.js' },
    { name: 'models', indent: 1, folder: 'models', defaultOpen: false },
    { name: 'User.js', indent: 2, fileId: 'User.js' },
    { name: 'PasswordReset.js', indent: 2, fileId: 'PasswordReset.js' },
    { name: 'Session.js', indent: 2, fileId: 'Session.js' },
    { name: 'router', indent: 1, folder: 'router', defaultOpen: true },
    { name: 'route.js', indent: 2, fileId: 'route.js' },
    { name: 'views', indent: 1, folder: 'views', defaultOpen: true },
    { name: 'pages', indent: 2, folder: 'pages', defaultOpen: true },
    { name: 'Dashboard.jsx', indent: 3, fileId: 'Dashboard.jsx' },
    { name: 'Users.jsx', indent: 3, fileId: 'Users.jsx' },
    { name: 'config', indent: 1, folder: 'config', defaultOpen: false },
    { name: 'pages.js', indent: 2, fileId: 'pages.js' },
    { name: 'variables.js', indent: 2, fileId: 'variables.js' },
    { name: 'mail', indent: 1, folder: 'mail', defaultOpen: false },
    { name: 'Mailer.js', indent: 2, fileId: 'Mailer.js' },
    { name: 'templates', indent: 2, folder: 'templates', defaultOpen: false },
    { name: 'jobs', indent: 1, folder: 'jobs', defaultOpen: false },
    { name: 'sendWelcomeEmail.js', indent: 2, fileId: 'sendWelcomeEmail.js' },
    { name: 'processUpload.js', indent: 2, fileId: 'processUpload.js' },
    { name: 'index.js', indent: 1, fileId: 'index.js' },
];
/**
 * Renders the interactive IDE preview used on the landing page.
 *
 * @returns {import('react').ReactElement} File tree, editor tabs, and selected code sample.
 */
export default function IDEMockup() {
    const [activeFile, setActiveFile] = useState('public.js');
    const [openFolders, setOpenFolders] = useState(() => {
        const init = {};
        IDE_TREE.forEach(e => { if (e.folder)
            init[e.folder] = !!e.defaultOpen; });
        return init;
    });
    const file = IDE_FILES[activeFile];
    const toggleFolder = (key) => {
        setOpenFolders(prev => ({ ...prev, [key]: !prev[key] }));
    };
    const isVisible = (entry) => {
        if (entry.indent === 0)
            return true;
        const idx = IDE_TREE.indexOf(entry);
        let parentIndent = entry.indent - 1;
        for (let i = idx - 1; i >= 0; i--) {
            const parent = IDE_TREE[i];
            if (parent.folder && parent.indent === parentIndent) {
                if (!openFolders[parent.folder])
                    return false;
                if (parentIndent === 0)
                    return true;
                parentIndent--;
            }
        }
        return true;
    };
    return (<figure aria-labelledby="how-it-works-pipeline-title" className="mx-auto mt-16 overflow-hidden rounded-xl border border-border shadow-sm" data-testid="how-it-works-pipeline">
			<figcaption id="how-it-works-pipeline-title" className="sr-only">
				From install to running app in three steps
			</figcaption>
			
			<div className="flex items-center justify-between bg-[#323233] px-4 py-2">
				<div className="flex items-center gap-x-2">
					<div className="flex gap-1.5" aria-hidden="true">
						<span className="h-3 w-3 rounded-full bg-[#ff5f57]"/>
						<span className="h-3 w-3 rounded-full bg-[#febc2e]"/>
						<span className="h-3 w-3 rounded-full bg-[#28c840]"/>
					</div>
					<span className="ml-3 font-mono text-[11px] text-[#8b8b8b]">{activeFile} — my-app</span>
				</div>
			</div>
			<div className="flex" style={{ minHeight: '600px' }}>
				
				<div className="hidden w-56 shrink-0 border-r border-[#2d2d2d] bg-[#252526] py-2 md:block">
					<div className="px-4 pb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-[#8b8b8b]">
						Explorer
					</div>
					{IDE_TREE.filter(isVisible).map((f, i) => {
            const isFile = !!f.fileId;
            const isFolder = !!f.folder;
            const isActive = f.fileId === activeFile;
            return (<div key={i} style={{ paddingLeft: `${12 + f.indent * 12}px` }} className={`flex items-center gap-x-1.5 py-[2px] font-mono text-xs select-none ${isActive ? 'bg-[#37373d] text-white' : 'text-[#cccccc]'} ${isFile || isFolder ? 'cursor-pointer hover:bg-[#2a2d2e]' : ''}`} onClick={() => {
                    if (isFolder)
                        toggleFolder(f.folder);
                    else if (isFile)
                        setActiveFile(f.fileId);
                }}>
								{isFolder ? (<span className="text-[10px] text-[#8b8b8b]">{openFolders[f.folder] ? '▾' : '▸'}</span>) : (<span className="text-[10px] text-[#519aba]">&#9679;</span>)}
								<span>{f.name}</span>
							</div>);
        })}
				</div>
				
				<div className="min-w-0 flex-1 bg-[#1e1e1e]">
					
					<div className="flex border-b border-[#2d2d2d]">
						<div className="flex items-center gap-x-2 border-b-2 border-white bg-[#1e1e1e] px-4 py-2 font-mono text-xs text-white">
							<span className="text-[10px] text-[#519aba]">{activeFile.endsWith('.jsx') ? 'TSX' : 'TS'}</span>
							{activeFile}
						</div>
					</div>
					
					<div className="overflow-x-auto py-2">
						{file.lines.map((line) => (<div key={line.n} className="flex font-mono text-[13px] leading-6">
								<span className="w-10 shrink-0 select-none pr-4 text-right text-[#5a5a5a]">{line.n}</span>
								<span className="text-[#d4d4d4]">{line.t || '\u00A0'}</span>
							</div>))}
					</div>
				</div>
			</div>
			
			<div className="flex items-center justify-between bg-[#007acc] px-4 py-0.5 font-mono text-[10px] text-white">
				<span>{file.lang}</span>
				<span>Ln 1, Col 1</span>
			</div>
		</figure>);
}
