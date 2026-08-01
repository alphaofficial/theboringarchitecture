import { useEffect, useRef } from 'react';

const CONNECTIONS = [
	'M230 161H300',
	'M405 192V275',
	'M510 306H610',
	'M715 275V192',
	'M820 161H900',
];

const NODES = [
	{ x: 60, y: 130, width: 170, label: 'request', tone: 'cyan' },
	{ x: 300, y: 130, width: 210, label: 'router (express)', tone: 'violet' },
	{ x: 300, y: 275, width: 210, label: 'controller', tone: 'coral' },
	{ x: 610, y: 275, width: 210, label: 'primitives', tone: 'coral' },
	{ x: 610, y: 130, width: 210, label: 'inertia', tone: 'violet' },
	{ x: 900, y: 130, width: 160, label: 'response', tone: 'cyan' },
];

/**
 * Renders the application request lifecycle as an animated SVG flow.
 *
 * @returns {import('react').ReactElement} Request-to-response architecture diagram.
 */
export default function SystemDiagram() {
	const pathRefs = useRef([]);
	const pulseRef = useRef(null);

	useEffect(() => {
		const stageDuration = 1250;
		const cycleDuration = stageDuration * CONNECTIONS.length;
		const startedAt = performance.now();
		let frame;

		const animate = (now) => {
			const cycleTime = (now - startedAt) % cycleDuration;
			const stage = Math.floor(cycleTime / stageDuration);
			const progress = (cycleTime % stageDuration) / stageDuration;
			const path = pathRefs.current[stage];
			const pulse = pulseRef.current;

			if (path && pulse) {
				const length = path.getTotalLength();
				const point = path.getPointAtLength(length * progress);
				const fade = Math.min(progress / 0.08, (1 - progress) / 0.08, 1);
				pulse.setAttribute('transform', `translate(${point.x} ${point.y})`);
				pulse.style.opacity = String(Math.max(0, fade));
			}

			frame = requestAnimationFrame(animate);
		};

		frame = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(frame);
	}, []);

	return (
		<figure
			aria-labelledby="system-diagram-title"
			className="request-flow mx-auto mt-12 hidden md:block sm:mt-16"
			data-testid="how-it-works-pipeline"
		>
			<figcaption id="system-diagram-title" className="sr-only">
				A request moves through the Express router, controller, runtime primitives, Inertia, and finally to the response.
			</figcaption>

			<svg viewBox="0 0 1120 430" className="block h-auto w-full" aria-hidden="true" focusable="false">
				<defs>
					<marker id="flow-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse">
						<path d="M1.5 1.5 8 5 1.5 8.5" className="request-flow-arrowhead" />
					</marker>
					<filter id="pulse-glow" x="-300%" y="-300%" width="600%" height="600%">
						<feGaussianBlur stdDeviation="2.5" result="blur" />
						<feMerge>
							<feMergeNode in="blur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				<rect x="25" y="50" width="1070" height="350" rx="24" className="request-flow-boundary" />
				<g className="request-flow-heading">
					<rect x="410" y="27" width="300" height="48" rx="24" />
					<text x="560" y="58" textAnchor="middle">Application architecture</text>
				</g>

				<g className="request-flow-connections" aria-hidden="true">
					{CONNECTIONS.map((path, index) => (
						<path
							key={path}
							ref={(element) => { pathRefs.current[index] = element; }}
							d={path}
							className="request-flow-link"
							markerEnd="url(#flow-arrow)"
						/>
					))}
					<g ref={pulseRef} className="request-flow-pulse">
						<circle r="9" className="request-flow-pulse-halo" filter="url(#pulse-glow)" />
						<circle r="5" className="request-flow-pulse-core" />
					</g>
				</g>

				<g className="request-flow-nodes">
					{NODES.map((node) => <FlowNode key={node.label} {...node} />)}
				</g>
			</svg>
		</figure>
	);
}

function FlowNode({ x, y, width, label, tone }) {
	return (
		<g className={`request-flow-node request-flow-node-${tone}`}>
			<rect x={x} y={y} width={width} height="62" rx="10" className="request-flow-node-surface" />
			<text x={x + width / 2} y={y + 39} textAnchor="middle">{label}</text>
		</g>
	);
}
