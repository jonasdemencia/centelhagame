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
        
        this.inicializar();
    }

    inicializar() {
        // Cena
        this.scene = new THREE.Scene();
        
        // Câmera
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.offsetWidth / this.container.offsetHeight,
            0.1,
            1000
        );
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('three-canvas'),
            antialias: true 
        });
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        
        // Esfera invertida (jogador dentro)
        const sphereGeometry = new THREE.SphereGeometry(50, 64, 64);
        sphereGeometry.scale(-1, 1, 1);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
        this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.scene.add(this.sphere);
        
        // Controles
        this.setupControls();
        
        // Resize
        window.addEventListener('resize', () => this.onResize());
        
        // Iniciar loop
        this.animate();
        // ADICIONE ISTO - Raycaster para cliques
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    this.container.addEventListener('click', (e) => this.onClick(e));
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            const speed = 0.05;
            if (e.key === 'ArrowUp') this.rotX += speed;
            if (e.key === 'ArrowDown') this.rotX -= speed;
            if (e.key === 'ArrowLeft') this.rotY += speed;
            if (e.key === 'ArrowRight') this.rotY -= speed;
        });
        
        // Mouse drag (opcional)
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
        
        ctx.font = 'bold 48px VT323, monospace';
        ctx.fillStyle = '#ffd700';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Quebrar texto em linhas
        const words = texto.split(' ');
        let line = '';
        let y = 128;
        const lineHeight = 40;
        
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
        // Limpar textos anteriores
        this.textMeshes.forEach(mesh => this.scene.remove(mesh));
        this.textMeshes = [];
        this.opcoes = opcoes;
        
        // Posições para até 6 opções
        const posicoes = [
            { pos: [0, 0, -40], rot: [0, 0, 0] },           // Frente
            { pos: [-40, 0, 0], rot: [0, Math.PI/2, 0] },   // Esquerda
            { pos: [40, 0, 0], rot: [0, -Math.PI/2, 0] },   // Direita
            { pos: [0, 0, 40], rot: [0, Math.PI, 0] },      // Trás
            { pos: [0, 30, 0], rot: [-Math.PI/4, 0, 0] },   // Cima
            { pos: [0, -30, 0], rot: [Math.PI/4, 0, 0] }    // Baixo
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

    onClick(event) {
    // Calcular posição do mouse normalizada
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Atualizar raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Verificar interseções com textos
    const intersects = this.raycaster.intersectObjects(this.textMeshes);
    
    if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const opcao = clickedMesh.userData.opcao;
        
        // Disparar evento customizado
        const event = new CustomEvent('opcaoClicada3D', { detail: opcao });
        document.dispatchEvent(event);
    }
}


    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.camera.rotation.x = this.rotX;
        this.camera.rotation.y = this.rotY;
        
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
