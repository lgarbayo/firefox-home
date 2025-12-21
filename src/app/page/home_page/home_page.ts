import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';

interface BackgroundConfig {
    gradient: string[];
    mountains?: { color: string; opacity?: number; points: [number, number][] }[];
    orbs?: { color: string; radius: number; speed: number; offset: number; orbit?: [number, number] }[];
    particles?: { count: number; speed: [number, number]; size: [number, number]; color?: string; drift?: [number, number] };
    webs?: WebConfig;
    flames?: FlameConfig[];
}

interface WebConfig {
    count: number;
    speed: number;
    color?: string;
    linkColor?: string;
    linkDistance?: number;
    jitter?: number;
}

interface FlameConfig {
    color: string;
    width: number;
    height: number;
    base: [number, number];
    sway: number;
    speed: number;
}

interface Particle {
    x: number;
    y: number;
    speed: number;
    drift: number;
    size: number;
}

interface WebNode {
    x: number;
    y: number;
    vx: number;
    vy: number;
}

const DEFAULT_BACKGROUND: BackgroundConfig = {
    gradient: ['#020202', '#090b11', '#151821', '#1f232f'],
    mountains: [
        {
            color: '#0d0f14',
            opacity: 0.9,
            points: [
                [-1, 0.75],
                [-0.55, 0.55],
                [-0.2, 0.68],
                [0.15, 0.5],
                [0.45, 0.65],
                [1, 0.78],
                [1, 1],
                [-1, 1]
            ]
        },
        {
            color: '#1c202b',
            opacity: 0.65,
            points: [
                [-1, 0.85],
                [-0.6, 0.6],
                [-0.1, 0.8],
                [0.2, 0.62],
                [0.55, 0.82],
                [1, 0.88],
                [1, 1],
                [-1, 1]
            ]
        }
    ],
    orbs: [
        { color: 'rgba(160,200,255,0.35)', radius: 0.22, speed: 0.1, offset: 0, orbit: [0.4, 0.22] },
        { color: 'rgba(120,150,200,0.3)', radius: 0.18, speed: -0.14, offset: 0.5, orbit: [0.3, 0.18] }
    ],
    particles: {
        count: 60,
        speed: [0.01, 0.03],
        size: [1.5, 4],
        color: 'rgba(240,240,255,0.18)',
        drift: [-0.02, 0.02]
    },
    webs: {
        count: 90,
        speed: 25,
        color: 'rgba(210,210,220,0.85)',
        linkColor: 'rgba(110,212,255,0.35)',
        linkDistance: 240,
        jitter: 20
    }
};

@Component({
    selector: 'app-home-page',
    standalone: true,
    templateUrl: './home_page.html',
    styleUrls: ['./home_page.css']
})
export class HomePageComponent implements AfterViewInit, OnDestroy {
    @ViewChild('searchBox') private searchInput?: ElementRef<HTMLInputElement>;
    @ViewChild('bgCanvas', { static: true }) private bgCanvas?: ElementRef<HTMLCanvasElement>;

    private backgroundFrame?: number;
    private particles: Particle[] = [];
    private webNodes: WebNode[] = [];
    private backgroundConfig: BackgroundConfig = DEFAULT_BACKGROUND;
    private resizeHandler?: () => void;

    ngAfterViewInit(): void {
        queueMicrotask(() => {
            this.searchInput?.nativeElement.focus();
            this.setupBackground();
        });
    }

    ngOnDestroy(): void {
        if (this.backgroundFrame) cancelAnimationFrame(this.backgroundFrame);
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
    }

    search(q: string) {
        const query = encodeURIComponent((q ?? '').trim());
        if (!query) return;
        window.location.href = `https://www.google.com/search?q=${query}`;
    }

    @HostListener('document:paste', ['$event'])
    handlePaste(event: ClipboardEvent) {
        const text = event.clipboardData?.getData('text') ?? '';
        const input = this.searchInput?.nativeElement;
        if (!input || !text.trim()) return;

        event.preventDefault();
        const targetIsInput = event.target === input;
        const selectionStart = targetIsInput ? input.selectionStart ?? input.value.length : input.value.length;
        const selectionEnd = targetIsInput ? input.selectionEnd ?? input.value.length : input.value.length;

        const value = input.value;
        input.value = `${value.slice(0, selectionStart)}${text}${value.slice(selectionEnd)}`;

        const caret = selectionStart + text.length;
        input.setSelectionRange?.(caret, caret);
        input.focus();
    }

    private async setupBackground() {
        try {
            const response = await fetch('anime-bg.json');
            if (response.ok) {
                this.backgroundConfig = await response.json();
            }
        } catch (error) {
            console.warn('Falling back to default background animation', error);
        }

        const canvas = this.bgCanvas?.nativeElement;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio ?? 1;
        const resize = () => {
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
            this.initWebNodes(width, height);
        };

        resize();
        this.resizeHandler = resize;
        window.addEventListener('resize', resize);

        this.particles = this.createParticles(this.backgroundConfig.particles);
        this.initWebNodes(canvas.clientWidth, canvas.clientHeight);

        let lastTime = performance.now();
        const render = (time: number) => {
            const delta = (time - lastTime) / 1000;
            lastTime = time;
            this.drawBackground(ctx, canvas.clientWidth, canvas.clientHeight, time / 1000, delta);
            this.backgroundFrame = requestAnimationFrame(render);
        };

        this.backgroundFrame = requestAnimationFrame(render);
    }

    private drawBackground(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        time: number,
        delta: number
    ) {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        const colors = this.backgroundConfig.gradient;
        colors.forEach((color, index) => {
            const stop = colors.length === 1 ? 1 : index / (colors.length - 1);
            gradient.addColorStop(stop, color);
        });
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        this.backgroundConfig.mountains?.forEach((mountain) => {
            const opacity = mountain.opacity ?? 0.8;
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            mountain.points.forEach(([normX, normY], index) => {
                const x = ((normX + 1) / 2) * width;
                const y = normY * height;
                if (index === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.fillStyle = mountain.color;
            ctx.fill();
            ctx.globalAlpha = 1;
        });

        this.drawNetwork(ctx, width, height, delta);
        this.drawFlames(ctx, width, height, time);

        this.backgroundConfig.orbs?.forEach((orb) => {
            const orbitX = orb.orbit?.[0] ?? 0.3;
            const orbitY = orb.orbit?.[1] ?? 0.2;
            const centerX = width * 0.5;
            const centerY = height * 0.5;
            const x = centerX + Math.sin(time * orb.speed + orb.offset) * width * orbitX;
            const y = centerY + Math.cos(time * orb.speed + orb.offset) * height * orbitY;
            const radius = orb.radius * Math.min(width, height);

            const radial = ctx.createRadialGradient(x, y, 0, x, y, radius);
            radial.addColorStop(0, orb.color);
            radial.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = radial;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        });

        this.updateParticles(ctx, width, height, delta);
    }

    private createParticles(settings?: BackgroundConfig['particles']): Particle[] {
        const count = settings?.count ?? 40;
        const speedRange = settings?.speed ?? [0.01, 0.03];
        const driftRange = settings?.drift ?? [-0.01, 0.01];
        const sizeRange = settings?.size ?? [1, 3];

        return Array.from({ length: count }, () => ({
            x: Math.random(),
            y: Math.random(),
            speed: this.randomBetween(speedRange[0], speedRange[1]),
            drift: this.randomBetween(driftRange[0], driftRange[1]),
            size: this.randomBetween(sizeRange[0], sizeRange[1])
        }));
    }

    private initWebNodes(width: number, height: number) {
        const conf = this.backgroundConfig.webs;
        if (!conf) {
            this.webNodes = [];
            return;
        }
        const speed = conf.speed ?? 30;
        this.webNodes = Array.from({ length: conf.count ?? 40 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() * 2 - 1) * speed,
            vy: (Math.random() * 2 - 1) * speed
        }));
    }

    private drawFlames(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
        const flames = this.backgroundConfig.flames;
        if (!flames?.length) return;

        flames.forEach((flame, index) => {
            const baseX = flame.base[0] * width;
            const baseY = flame.base[1] * height;
            const flameWidth = flame.width * width;
            const flameHeight = flame.height * height;
            const sway = Math.sin(time * flame.speed + index) * flame.sway * flameWidth;

            const gradient = ctx.createLinearGradient(baseX, baseY, baseX, baseY - flameHeight);
            gradient.addColorStop(0, 'rgba(0,0,0,0)');
            gradient.addColorStop(0.3, flame.color);
            gradient.addColorStop(1, 'rgba(255,255,255,0.05)');

            ctx.fillStyle = gradient;
            ctx.globalCompositeOperation = 'lighter';
            ctx.beginPath();
            ctx.moveTo(baseX - flameWidth * 0.5, baseY);
            ctx.bezierCurveTo(
                baseX - flameWidth * 0.8,
                baseY - flameHeight * 0.35,
                baseX - flameWidth * 0.2 + sway,
                baseY - flameHeight * 0.7,
                baseX + sway * 0.3,
                baseY - flameHeight
            );
            ctx.bezierCurveTo(
                baseX + flameWidth * 0.2 + sway,
                baseY - flameHeight * 0.7,
                baseX + flameWidth * 0.7,
                baseY - flameHeight * 0.35,
                baseX + flameWidth * 0.5,
                baseY
            );
            ctx.closePath();
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        });
    }

    private updateParticles(ctx: CanvasRenderingContext2D, width: number, height: number, delta: number) {
        const settings = this.backgroundConfig.particles;
        const color = settings?.color ?? 'rgba(255,255,255,0.15)';

        ctx.fillStyle = color;
        this.particles.forEach((particle) => {
            particle.y += particle.speed * delta;
            particle.x += particle.drift * delta;

            if (particle.y > 1) particle.y = 0;
            if (particle.y < 0) particle.y = 1;
            if (particle.x > 1) particle.x = 0;
            if (particle.x < 0) particle.x = 1;

            const px = particle.x * width;
            const py = particle.y * height;
            ctx.beginPath();
            ctx.arc(px, py, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    private drawNetwork(ctx: CanvasRenderingContext2D, width: number, height: number, delta: number) {
        const conf = this.backgroundConfig.webs;
        if (!conf || !this.webNodes.length) return;

        const linkDistance = conf.linkDistance ?? 200;
        const nodeColor = conf.color ?? 'rgba(220,220,220,0.8)';
        const linkColor = conf.linkColor ?? 'rgba(255,255,255,0.15)';
        const jitter = conf.jitter ?? 20;

        this.webNodes.forEach((node) => {
            node.x += node.vx * delta;
            node.y += node.vy * delta;
            node.vx += (Math.random() - 0.5) * jitter * delta;
            node.vy += (Math.random() - 0.5) * jitter * delta;

            if (node.x < 0 || node.x > width) node.vx *= -1;
            if (node.y < 0 || node.y > height) node.vy *= -1;
            node.x = Math.max(Math.min(node.x, width), 0);
            node.y = Math.max(Math.min(node.y, height), 0);
        });

        ctx.fillStyle = nodeColor;
        this.webNodes.forEach((node) => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.strokeStyle = linkColor;
        for (let i = 0; i < this.webNodes.length; i++) {
            const a = this.webNodes[i];
            for (let j = i + 1; j < this.webNodes.length; j++) {
                const b = this.webNodes[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.hypot(dx, dy);
                if (dist < linkDistance) {
                    ctx.globalAlpha = 1 - dist / linkDistance;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1;
    }

    private randomBetween(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }
}
