export class Visao3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.sphere = null;
        this.textMeshes = [];
        this.rotX = 0;
        this.rotY = 0;
        this.opcoes = [];
        this.direcaoAtual = 'frente';
        this.setas = [];
        this.movimentosValidos = {
            'frente': { '←': 'esquerda', '→': 'direita', '↑': 'cima', '↓': 'baixo' },
            'tras': { '←': 'direita', '→': 'esquerda', '↑': 'cima', '↓': 'baixo' },
            'esquerda': { '←': 'tras', '→': 'frente', '↑': 'cima', '↓': 'baixo' },
            'direita': { '←': 'frente', '→': 'tras', '↑': 'cima', '↓': 'baixo' },
            'cima': { '←': 'esquerda', '→': 'direita', '↑': 'tras', '↓': 'frente' },
            'baixo': { '←': 'esquerda', '→': 'direita', '↑': 'frente', '↓': 'tras' }
        };
        this.rotacoesAlvo = {
            'frente': { x: 0, y: 0 },
            'tras': { x: 0, y: Math.PI },
            'esquerda': { x: 0, y: Math.PI / 2 },
            'direita': { x: 0, y: -Math.PI / 2 },
            'cima': { x: Math.PI / 3, y: 0 },
            'baixo': { x: -Math.PI / 3, y: 0 }
        };
        this.animando = false;

        this.inicializar();
    }

    inicializar() {
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.offsetWidth / this.container.offsetHeight,
            0.1,
            1000
        );

        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('three-canvas'),
            antialias: true
        });
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);

        // 🔹 Criação da esfera realista
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg');
        const sphereGeometry = new THREE.SphereGeometry(50, 64, 64);
        sphereGeometry.scale(-1, 1, 1);
        const sphereMaterial = new THREE.MeshBasicMaterial({ map: texture });
        this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.scene.add(this.sphere);

        this.setupControls();
        window.addEventListener('resize', () => this.onResize());
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.container.addEventListener('click', (e) => this.onClick(e));
        this.container.addEventListener('mousemove', (e) => this.onMouseMove(e));

        this.criarSetas();
        this.carregarOpcoes([
            { texto: 'CIMA' },
            { texto: 'ESQUERDA' },
            { texto: 'DIREITA' },
            { texto: 'BAIXO' }
        ]);
        this.animate();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            const speed = 0.05;
            if (e.key === 'w' || e.key === 'W') this.rotX += speed;
            if (e.key === 's' || e.key === 'S') this.rotX -= speed;
            if (e.key === 'a' || e.key === 'A') this.rotY += speed;
            if (e.key === 'd' || e.key === 'D') this.rotY -= speed;

            // 🧭 Limite vertical - evita piruetas
            this.rotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotX));
        });

        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        this.container.addEventListener('mousedown', () => isDragging = true);
        this.container.addEventListener('mouseup', () => isDragging = false);
        this.container.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - previousMousePosition.x;
                const deltaY = e.clientY - previousMousePosition.y;
                this.rotY -= deltaX * 0.005;
                this.rotX -= deltaY * 0.005;

                // 🧭 Limite vertical também durante o arraste
                this.rotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotX));
            }
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
    }

    criarTexto(texto, size = 1.2) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 256;

        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, 512, 256);

        ctx.font = 'bold 70px VT323, monospace';
        ctx.fillStyle = '#ffd700';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(texto, 256, 128);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true
        });

        return new THREE.Mesh(new THREE.PlaneGeometry(size * 10, size * 5), material);
    }

    carregarOpcoes(opcoes) {
        this.textMeshes.forEach(mesh => this.scene.remove(mesh));
        this.textMeshes = [];

        const posicoes = [
            { pos: [0, 10, -40], rot: [0, 0, 0] }, // cima
            { pos: [-40, 0, 0], rot: [0, Math.PI / 2, 0] }, // esquerda
            { pos: [40, 0, 0], rot: [0, -Math.PI / 2, 0] }, // direita
            { pos: [0, -10, -40], rot: [0, 0, 0] } // baixo
        ];

        opcoes.forEach((opcao, index) => {
            if (index >= posicoes.length) return;
            const textMesh = this.criarTexto(opcao.texto);
            const p = posicoes[index];
            textMesh.position.set(...p.pos);
            textMesh.rotation.set(...p.rot);
            textMesh.userData = { opcao };
            this.scene.add(textMesh);
            this.textMeshes.push(textMesh);
        });
    }

    criarSetas() {
        const simbolos = ['←', '→', '↑', '↓'];
        const posicoes = [
            [-4, 0, -10],
            [4, 0, -10],
            [0, 3, -10],
            [0, -3, -10]
        ];

        simbolos.forEach((simbolo, i) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 128;
            canvas.height = 128;

            ctx.font = 'bold 90px Arial';
            ctx.fillStyle = '#ffd700';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(simbolo, 64, 70);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide,
                opacity: 0.7
            });

            const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
            plane.position.set(...posicoes[i]);
            plane.userData = { simbolo, direcao: null };

            this.camera.add(plane);
            this.setas.push(plane);
        });

        this.scene.add(this.camera);
    }

    detectarDirecao() {
        const rx = this.camera.rotation.x;
        const ry = this.camera.rotation.y;
        const threshold = 0.5;

        if (Math.abs(rx) > Math.abs(ry)) {
            if (rx > threshold) return 'cima';
            if (rx < -threshold) return 'baixo';
        }

        const yNorm = ((ry % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        if (yNorm < Math.PI / 4 || yNorm > 7 * Math.PI / 4) return 'frente';
        if (yNorm > 3 * Math.PI / 4 && yNorm < 5 * Math.PI / 4) return 'tras';
        if (yNorm > Math.PI / 4 && yNorm < 3 * Math.PI / 4) return 'esquerda';
        return 'direita';
    }

    atualizarSetas() {
        const novaDirecao = this.detectarDirecao();
        if (novaDirecao !== this.direcaoAtual) {
            this.direcaoAtual = novaDirecao;
        }

        const movimentos = this.movimentosValidos[this.direcaoAtual];
        this.setas.forEach(seta => {
            const direcaoAlvo = movimentos[seta.userData.simbolo];
            seta.visible = !!direcaoAlvo;
            seta.userData.direcao = direcaoAlvo;
        });
    }

    async rotacionarPara(direcao) {
        if (this.animando) return;
        this.animando = true;

        const alvo = this.rotacoesAlvo[direcao];
        const inicio = { x: this.rotX, y: this.rotY };
        const duracao = 500;
        const startTime = Date.now();

        return new Promise(resolve => {
            const animar = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duracao, 1);
                const eased = 1 - Math.pow(1 - progress, 3);

                this.rotX = inicio.x + (alvo.x - inicio.x) * eased;
                this.rotY = inicio.y + (alvo.y - inicio.y) * eased;

                if (progress < 1) requestAnimationFrame(animar);
                else {
                    this.animando = false;
                    resolve();
                }
            };
            animar();
        });
    }

   onClick(event) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const setasVisiveis = this.setas.filter(s => s.visible);
    const intersectsSetas = this.raycaster.intersectObjects(setasVisiveis);

    if (intersectsSetas.length > 0) {
        const seta = intersectsSetas[0].object;
        const simbolo = seta.userData.simbolo;

        const stepY = Math.PI / 2; // 90 graus por clique (horizontal)
        const stepX = Math.PI / 6; // 30 graus por clique (vertical leve)

        switch (simbolo) {
            case '←':
                this.rotY += stepY; // gira livremente à esquerda
                break;
            case '→':
                this.rotY -= stepY; // gira livremente à direita
                break;
            case '↑':
                this.rotX = Math.min(this.rotX + stepX, Math.PI / 3); // olha pra cima com limite
                break;
            case '↓':
                this.rotX = Math.max(this.rotX - stepX, -Math.PI / 3); // olha pra baixo com limite
                break;
        }

        return;
    }

    // (mantém a lógica de clique nos textos)
    const intersects = this.raycaster.intersectObjects(this.textMeshes);
    if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const opcao = clickedMesh.userData.opcao;
        const event = new CustomEvent('opcaoClicada3D', { detail: opcao });
        document.dispatchEvent(event);
    }
}



    onMouseMove(event) {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const setasVisiveis = this.setas.filter(s => s.visible);
        const intersectsSetas = this.raycaster.intersectObjects(setasVisiveis);
        const intersectsOpcoes = this.raycaster.intersectObjects(this.textMeshes);

        this.container.style.cursor = (intersectsSetas.length > 0 || intersectsOpcoes.length > 0)
            ? 'pointer'
            : 'default';

        this.textMeshes.forEach(mesh => mesh.material.opacity = 0.7);
        if (intersectsOpcoes.length > 0) intersectsOpcoes[0].object.material.opacity = 1.0;

        this.setas.forEach(seta => seta.material.opacity = 0.7);
        if (intersectsSetas.length > 0) intersectsSetas[0].object.material.opacity = 1.0;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.camera.rotation.x = this.rotX;
        this.camera.rotation.y = this.rotY;
        this.atualizarSetas();
        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    }

    destruir() {
        window.removeEventListener('resize', () => this.onResize());
        this.renderer.dispose();
    }
}
