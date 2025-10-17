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
            'esquerda': { x: 0, y: Math.PI/2 },
            'direita': { x: 0, y: -Math.PI/2 },
            'cima': { x: Math.PI/3, y: 0 },
            'baixo': { x: -Math.PI/3, y: 0 }
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
        
        const sphereGeometry = new THREE.SphereGeometry(50, 64, 64);
        sphereGeometry.scale(-1, 1, 1);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
        this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.scene.add(this.sphere);
        
        this.setupControls();
        
        window.addEventListener('resize', () => this.onResize());
        
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.container.addEventListener('click', (e) => this.onClick(e));
        this.container.addEventListener('mousemove', (e) => this.onMouseMove(e));
        
        this.criarSetas();
        this.animate();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            const speed = 0.05;
            if (e.key === 'w' || e.key === 'W') this.rotX += speed;
            if (e.key === 's' || e.key === 'S') this.rotX -= speed;
            if (e.key === 'a' || e.key === 'A') this.rotY += speed;
            if (e.key === 'd' || e.key === 'D') this.rotY -= speed;
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
            }
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
    }

    criarTexto(texto, size = 1) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 256;
        
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, 512, 256);
        
        ctx.font = 'bold 60px VT323, monospace';
        ctx.fillStyle = '#ffd700';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const words = texto.split(' ');
        let line = '';
        let y = 128;
        const lineHeight = 70;
        
        words.forEach(word => {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > 480 && line !== '') {
                ctx.fillText(line, 256, y);
                line = word + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        });
        ctx.fillText(line, 256, y);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ 
            map: texture, 
            side: THREE.DoubleSide, 
            transparent: true 
        });
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(size * 10, size * 5), 
            material
        );
        
        return plane;
    }

    carregarOpcoes(opcoes) {
        this.textMeshes.forEach(mesh => this.scene.remove(mesh));
        this.textMeshes = [];
        this.opcoes = opcoes;
        
        const posicoes = [
            { pos: [0, 0, -40], rot: [0, 0, 0] },
            { pos: [-40, 0, 0], rot: [0, Math.PI/2, 0] },
            { pos: [40, 0, 0], rot: [0, -Math.PI/2, 0] },
            { pos: [0, 0, 40], rot: [0, Math.PI, 0] },
            { pos: [0, 30, 0], rot: [-Math.PI/4, 0, 0] },
            { pos: [0, -30, 0], rot: [Math.PI/4, 0, 0] }
        ];
        
        opcoes.forEach((opcao, index) => {
            if (index >= posicoes.length) return;
            
            const textMesh = this.criarTexto(opcao.texto);
            const pos = posicoes[index];
            textMesh.position.set(...pos.pos);
            textMesh.rotation.set(...pos.rot);
            textMesh.userData = { opcao, index };
            
            this.scene.add(textMesh);
            this.textMeshes.push(textMesh);
        });
    }

    // CÓDIGO DE SUBSTITUIÇÃO 1
criarSetas() {
    const simbolos = ['←', '→', '↑', '↓'];
    // Posições ajustadas para ficarem mais próximas da câmera
    const posicoes = [
        [-4, 0, -10],  // Esquerda
        [4, 0, -10],   // Direita
        [0, 3, -10],   // Cima
        [0, -3, -10]   // Baixo
    ];

    simbolos.forEach((simbolo, i) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 128;
        // Fundo removido para melhor integração visual
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
            opacity: 0.7 // Opacidade inicial
        });

        const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material); // Tamanho reduzido
        plane.position.set(...posicoes[i]);
        plane.userData = { simbolo, direcao: null };

        // A MUDANÇA CRÍTICA: Adiciona a seta à câmera, não à cena.
        this.camera.add(plane); 
        this.setas.push(plane);
    });

    // Adiciona a câmera (com as setas filhas) à cena
    this.scene.add(this.camera);
}

    detectarDirecao() {
        const threshold = 0.5;
        const rx = this.camera.rotation.x;
        const ry = this.camera.rotation.y;
        
        if (Math.abs(rx) > Math.abs(ry)) {
            if (rx > threshold) return 'cima';
            if (rx < -threshold) return 'baixo';
        }
        
        const yNorm = ((ry % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        if (yNorm < Math.PI/4 || yNorm > 7*Math.PI/4) return 'frente';
        if (yNorm > 3*Math.PI/4 && yNorm < 5*Math.PI/4) return 'tras';
        if (yNorm > Math.PI/4 && yNorm < 3*Math.PI/4) return 'esquerda';
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
                
                if (progress < 1) {
                    requestAnimationFrame(animar);
                } else {
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
            if (seta.userData.direcao) {
                this.rotacionarPara(seta.userData.direcao);
            }
            return;
        }
        
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
        
        this.container.style.cursor = (intersectsSetas.length > 0 || intersectsOpcoes.length > 0) ? 'pointer' : 'default';
        
        this.textMeshes.forEach(mesh => mesh.material.opacity = 0.7);
        if (intersectsOpcoes.length > 0) {
            intersectsOpcoes[0].object.material.opacity = 1.0;
        }
        
        this.setas.forEach(seta => seta.material.opacity = 0.7);
        if (intersectsSetas.length > 0) {
            intersectsSetas[0].object.material.opacity = 1.0;
        }
    }

    // CÓDIGO DE SUBSTITUIÇÃO 2
animate() {
    requestAnimationFrame(() => this.animate());

    // Removemos a condição 'if (!this.animando)'
    // A câmera agora sempre segue os valores de rotação, que são suavizados pela função de animação.
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
