// Função getNormalizedSentido (permanece a mesma, fora da classe)
function getNormalizedSentido(angle) {
    let normalized = angle % 360;
    if (normalized < 0) {
        normalized += 360;
    }
    if (normalized === 360) {
        normalized = 0;
    }
    return normalized;
}

class Robot {
    #x;
    #y;

    constructor(x, y, size) {
        this.#x = x;
        this.#y = y;
        this.x = x;
        this.y = y;
        this.size = size;
        this.image = robotImage; // Certifique-se que robotImage está definida globalmente

        this.sentido = 90;
        this.previousSentido = 90;
        this.speed = 1; // Velocidade de movimento do robô (pixels por frame de lógica)

        // Estados de animação
        this.isMoving = false;
        this.isRotating = false;

        //sons do robo
        this.robot_souds = {
            movimento: loadSound('audio/robot_rotate.mp3'),
            robot_rotate: loadSound('audio/robot_movimentos.mp3'),
        }

        // Controle de animação
        this.currentFrame = 1;
        this.frameCount = 0;

        // ---- MODIFICADO: Controle de velocidade de animação individual e granular ----
        this.animationSpeeds = {
            // Velocidades para as animações de andar
            andar_direita: 6,
            andar_baixo: 4,
            andar_cima: 4,
            // Velocidades para as animações de rotação
            rotate_baixo: 2.7,                // Ex: Animação para virar para baixo
            rotate_cima: 2.7,                 // Ex: Animação para virar para cima
            rotate_direita_esquerda: 12,     // Ex: Animação mais rápida para virar de lado
            // Velocidade para a animação de idle
            idle: 8,
            // Velocidade padrão caso alguma animação específica não esteja listada
            default: 10
        };

        this.targetPosition = 0;

        // Controle de Delay para Animação de Idle
        this.idleDelayDuration = 2000;
        this.timeEnteredPotentialIdleState = 0;
        this.isPendingIdle = false;
        this.isIdle = true;

        // novo: armazena a última animação válida
        this.lastAnim = null;
    }

    updateState() {
        if (!this.isMoving && !this.isRotating) {
            if (!this.isIdle && !this.isPendingIdle) {
                this.isPendingIdle = true;
                this.timeEnteredPotentialIdleState = millis(); // Função p5.js
                this.currentFrame = 1;
                this.frameCount = 0;
            }
        } else {
            this.isIdle = false;
            this.isPendingIdle = false;
            this.timeEnteredPotentialIdleState = 0;
        }
    }

    handleIdleTransition() {
        if (this.isPendingIdle && !this.isIdle) {
            if (millis() - this.timeEnteredPotentialIdleState >= this.idleDelayDuration) {
                this.isIdle = true;
                this.isPendingIdle = false;
                this.currentFrame = 1;
                this.frameCount = 0;
            }
        }
    }

    /**
     * Determina qual conjunto de sprites e qual velocidade de animação usar.
     * @returns {object} { spriteArray, maxFrames, useScale, currentAnimSpeed }
     */
    getCurrentAnimation() {
        // se está aguardando idle, retorna sempre a última animação
        if (this.isPendingIdle && this.lastAnim) {
            return this.lastAnim;
        }

        let spriteArray, maxFrames;
        let useScale = false;
        let currentAnimSpeed = this.animationSpeeds.default; // Padrão inicial

        const normSentido = getNormalizedSentido(this.sentido);

        if (this.isRotating) {
            const normPrevSentido = getNormalizedSentido(this.previousSentido);
            
            if (normPrevSentido === 0 && normSentido === 90) { // Direita para Baixo
                spriteArray = fase1.sprite_rotate_baixo;
                currentAnimSpeed = this.animationSpeeds.rotate_baixo || this.animationSpeeds.default;
            } else if (normPrevSentido === 0 && normSentido === 270) { // Direita para Cima
                spriteArray = fase1.sprite_rotate_cima;
                currentAnimSpeed = this.animationSpeeds.rotate_cima || this.animationSpeeds.default;
            } else if (normPrevSentido === 180 && normSentido === 90) { // Esquerda para Baixo
                spriteArray = fase1.sprite_rotate_baixo;
                useScale = true;
                currentAnimSpeed = this.animationSpeeds.rotate_baixo || this.animationSpeeds.default;
            } else if (normPrevSentido === 180 && normSentido === 270) { // Esquerda para Cima
                spriteArray = fase1.sprite_rotate_cima;
                useScale = true;
                currentAnimSpeed = this.animationSpeeds.rotate_cima || this.animationSpeeds.default;
            } else if ((normPrevSentido === 90 && normSentido === 0) || (normPrevSentido === 90 && normSentido === 180) || // Baixo para Direita/Esquerda
                       (normPrevSentido === 270 && normSentido === 0) || (normPrevSentido === 270 && normSentido === 180)) { // Cima para Direita/Esquerda
                spriteArray = fase1.sprite_rotate_direita_esquerda;
                currentAnimSpeed = this.animationSpeeds.rotate_direita_esquerda || this.animationSpeeds.default;
                if (normSentido === 180) { // Se virou para a esquerda (a partir de cima ou baixo)
                    useScale = true; // Assumindo que o sprite é para a direita e precisa ser espelhado
                }
                // Se a rotação é de 90 para 0 (baixo para direita) ou 270 para 0 (cima para direita), não precisa de useScale (a menos que o sprite base seja para esquerda)
                // Se a rotação é de 90 para 180 (baixo para esquerda) ou 270 para 180 (cima para esquerda)
                 if ((normPrevSentido === 90 && normSentido === 180) || (normPrevSentido === 270 && normSentido === 180)){
                    useScale = true;
                 } else if ((normPrevSentido === 90 && normSentido === 0) || (normPrevSentido === 270 && normSentido === 0)){
                    useScale = false; // ou depende da orientação base do seu sprite_rotate_direita_esquerda
                 }

            } else {
                console.warn(`Rotação não mapeada: ${normPrevSentido} -> ${normSentido}. Usando sprite de idle padrão.`);
                spriteArray = fase1.sprite_idle;
                currentAnimSpeed = this.animationSpeeds.idle || this.animationSpeeds.default;
            }
        } else if (this.isMoving) {
            if (normSentido === 0) { // Direita
                spriteArray = fase1.sprite_andar_direita;
                currentAnimSpeed = this.animationSpeeds.andar_direita || this.animationSpeeds.default;
            } else if (normSentido === 180) { // Esquerda
                spriteArray = fase1.sprite_andar_direita; // Reutiliza o sprite da direita e espelha
                useScale = true;
                currentAnimSpeed = this.animationSpeeds.andar_direita || this.animationSpeeds.default; // Usa a mesma velocidade
            } else if (normSentido === 90) { // Baixo
                spriteArray = fase1.sprite_andar_baixo;
                currentAnimSpeed = this.animationSpeeds.andar_baixo || this.animationSpeeds.default;
            } else if (normSentido === 270) { // Cima
                spriteArray = fase1.sprite_andar_cima;
                currentAnimSpeed = this.animationSpeeds.andar_cima || this.animationSpeeds.default;
            } else {
                 spriteArray = fase1.sprite_idle; // Fallback
                 currentAnimSpeed = this.animationSpeeds.idle || this.animationSpeeds.default;
            }
        } else if (this.isIdle) {
            spriteArray = fase1.sprite_idle;
            currentAnimSpeed = this.animationSpeeds.idle || this.animationSpeeds.default;
            // if (normSentido === 180) { useScale = true; } // Opcional para idle
        } else if (this.isPendingIdle) {
            // Frame estático, velocidade não afeta a progressão aqui devido à lógica em updateAnimation
            currentAnimSpeed = this.animationSpeeds.idle || this.animationSpeeds.default;
            if (fase1.sprite_idle && fase1.sprite_idle.length > 1 && fase1.sprite_idle[1]) {
                spriteArray = [null, fase1.sprite_idle[1]];
            } else if (fase1.sprite_andar_baixo && fase1.sprite_andar_baixo.length > 1 && fase1.sprite_andar_baixo[1]) {
                spriteArray = [null, fase1.sprite_andar_baixo[1]];
            } else {
                spriteArray = [null, this.image];
            }
            // if (normSentido === 180) { useScale = true; } // Opcional
        } else { // Estado não coberto
            currentAnimSpeed = this.animationSpeeds.idle || this.animationSpeeds.default;
             if (fase1.sprite_idle && fase1.sprite_idle.length > 1 && fase1.sprite_idle[1]) {
                spriteArray = [null, fase1.sprite_idle[1]];
            } else if (fase1.sprite_andar_baixo && fase1.sprite_andar_baixo.length > 1 && fase1.sprite_andar_baixo[1]) {
                spriteArray = [null, fase1.sprite_andar_baixo[1]];
            } else {
                spriteArray = [null, this.image];
            }
        }

        // Validação do spriteArray e fallback
        if (!spriteArray || spriteArray.length <= 1) {
            let estadoMsg = this.isRotating ? "rotacionando" : (this.isMoving ? "movendo" : (this.isIdle ? "idle ativo" : (this.isPendingIdle ? "pending idle" : "desconhecido")));
            console.error(`Array de sprite '${spriteArray}' inválido ou vazio para o estado '${estadoMsg}'. Sentido: ${normSentido}. Usando fallback.`);
            if (fase1.sprite_idle && fase1.sprite_idle.length > 1) {
                 spriteArray = fase1.sprite_idle;
                 currentAnimSpeed = this.animationSpeeds.idle || this.animationSpeeds.default;
            } else if (fase1.sprite_andar_baixo && fase1.sprite_andar_baixo.length > 1) {
                 spriteArray = fase1.sprite_andar_baixo;
                 currentAnimSpeed = this.animationSpeeds.andar_baixo || this.animationSpeeds.default;
            } else {
                 spriteArray = [null, this.image];
                 currentAnimSpeed = this.animationSpeeds.default;
            }
            useScale = false;
            if (spriteArray.length <=1 && this.image) spriteArray = [null, this.image];
        }
        
        maxFrames = spriteArray.length - 1;
        if (maxFrames < 1) maxFrames = 1;

        // antes de retornar, cacheia o resultado
        const animResult = { spriteArray, maxFrames, useScale, currentAnimSpeed };
        this.lastAnim = animResult;
        return animResult;
    }

    display() {
        this.handleIdleTransition();
        const anim = this.getCurrentAnimation();

        if (this.currentFrame > anim.maxFrames || this.currentFrame < 1) {
            this.currentFrame = 1;
        }

        //verificando se o robo sai da tela
        if (this.x < 540 || this.x > 1440 || this.y < 0 || this.y > 900) {
            console.warn("O robô saiu da tela! Corrigindo posição.");
            fase1.reinitialize();
        }

        const currentSpriteImage = anim.spriteArray[this.currentFrame];

        if (!currentSpriteImage) {
            console.error(`Imagem do sprite no frame ${this.currentFrame} é indefinida! Usando imagem de fallback.`);
            imageMode(CENTER);
            push();
            translate(this.x, this.y);
            if (anim.useScale) scale(-1, 1);
            image(this.image, 0, 0, 95, 80);
            pop();
            this.updateAnimation();
            return;
        }

        //som do robo, parametro é o clear por isso passamos false
        this.robotSound(false);

        imageMode(CENTER);
        push();
        translate(this.x, this.y);
        if (anim.useScale) {
            scale(-1, 1);
        }
        image(currentSpriteImage, 0, 0, 95, 80);
        pop();

        this.updateAnimation();
    }


    robotSound(clear){
        //executando sons com base no estado
        if (clear) {
            this.robot_souds.movimento.stop();
            this.robot_souds.robot_rotate.stop();
        }

        if (this.isMoving && !this.isRotating) {
            if (!this.robot_souds.movimento.isPlaying()) {
                this.robot_souds.robot_rotate.stop();
                this.robot_souds.movimento.play();
            }
        } else if (this.isRotating) {
            if (!this.robot_souds.robot_rotate.isPlaying()) {
                this.robot_souds.movimento.stop();
                this.robot_souds.robot_rotate.play();
            }
        }

    }

    updateAnimation() {
        const animData = this.getCurrentAnimation();

        // se está aguardando o idle, congela frame atual
        if (this.isPendingIdle) {
            return;
        }
        // restante do idle “estático”
        if (this.isIdle && animData.maxFrames <= 1) {
            this.currentFrame = 1;
            this.frameCount = 0;
            return;
        }

        if (!animData || !animData.spriteArray || animData.spriteArray.length === 0 || animData.maxFrames === 0) {
            console.warn("updateAnimation: Dados de animação ausentes. Resetando frame.");
            this.currentFrame = 1; this.frameCount = 0;
            if (this.isRotating) { this.isRotating = false; this.updateState(); }
            return;
        }

        if (this.isPendingIdle || (this.isIdle && animData.maxFrames <= 1)) {
            this.currentFrame = 1;
            this.frameCount = 0;
            return;
        }
        
        this.frameCount++;
        if (this.frameCount >= animData.currentAnimSpeed) {
            this.frameCount = 0;
            this.currentFrame++;

            if (this.currentFrame > animData.maxFrames) {
                this.currentFrame = 1; 
                if (this.isRotating) {
                    this.isRotating = false;
                    this.previousSentido = getNormalizedSentido(this.sentido); 
                    this.updateState(); 
                }
            }
        }
    }

    // Métodos move, moverPara, rotacionar permanecem os mesmos da última versão,
    // pois eles controlam o estado, e getCurrentAnimation usa o estado para pegar a velocidade.
    move(reset) {
        const normSentido = getNormalizedSentido(this.sentido);
        let stoppedMovingThisFrame = false;

        if (this.isMoving) {
            if (normSentido === 0) { // Direita
                if (this.x < this.targetPosition) this.x += this.speed;
                if (this.x >= this.targetPosition) { this.x = this.targetPosition; stoppedMovingThisFrame = true; }
            } else if (normSentido === 180) { // Esquerda
                if (this.x > this.targetPosition) this.x -= this.speed;
                if (this.x <= this.targetPosition) { this.x = this.targetPosition; stoppedMovingThisFrame = true; }
            } else if (normSentido === 90) { // Baixo
                if (this.y < this.targetPosition) this.y += this.speed;
                if (this.y >= this.targetPosition) { this.y = this.targetPosition; stoppedMovingThisFrame = true; }
            } else if (normSentido === 270) { // Cima
                if (this.y > this.targetPosition) this.y -= this.speed;
                if (this.y <= this.targetPosition) { this.y = this.targetPosition; stoppedMovingThisFrame = true; }
            } else {
                stoppedMovingThisFrame = true;
            }
            
            if (stoppedMovingThisFrame) {
                this.isMoving = false;
            }
        }

        if (reset === true) {
            this.x = this.#x;
            this.y = this.#y;
            this.sentido = 90; 
            this.previousSentido = 90;
            this.isMoving = false;
            this.isRotating = false;
            this.isPendingIdle = false;
            this.isIdle = true;
            this.timeEnteredPotentialIdleState = 0;
            this.currentFrame = 1;
            this.frameCount = 0;
        }
        
        if (stoppedMovingThisFrame || (!this.isMoving && reset !== true)) { 
             this.updateState();
        }
    }
    
    moverPara(blocoCount) {
        if (blocoCount > 0) {
            const normSentido = getNormalizedSentido(this.sentido);
            if (normSentido === 0) this.targetPosition = this.x + (blocoCount * this.size);
            else if (normSentido === 90) this.targetPosition = this.y + (blocoCount * this.size);
            else if (normSentido === 180) this.targetPosition = this.x - (blocoCount * this.size);
            else if (normSentido === 270) this.targetPosition = this.y - (blocoCount * this.size);
            
            this.isMoving = true;
            this.isIdle = false;
            this.isPendingIdle = false;
            this.timeEnteredPotentialIdleState = 0;
            this.isRotating = false; 
            this.currentFrame = 1; 
            this.frameCount = 0;
        } else {
            this.isMoving = false;
            this.updateState();
        }
    }

    rotacionar(sentidoCmd) {
        this.isMoving = false;
        this.isRotating = true;
        this.isIdle = false;
        this.isPendingIdle = false;
        this.timeEnteredPotentialIdleState = 0;
        this.currentFrame = 1; 
        this.frameCount = 0;
        this.previousSentido = getNormalizedSentido(this.sentido); 
        
        if (sentidoCmd === "clockwise") this.sentido += 90;
        else if (sentidoCmd === "counterclockwise") this.sentido -= 90;
        
        this.sentido = getNormalizedSentido(this.sentido); 
    }
}