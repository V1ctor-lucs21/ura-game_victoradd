var debug = true; // Variável de depuração
class Cenario {
    constructor(tamanhoBloco, numLinhas, numColunas) {
        this.tamanhoBloco = tamanhoBloco;
        this.numLinhas = numLinhas;
        this.numColunas = numColunas;

        // Carrega as imagens dos obstáculos
        this.imagensObstaculos = {
            cone: loadImage('assets/colisoes/cone.png'),
            mato: loadImage('assets/colisoes/mato.png'),
            pedra_carvao: loadImage('assets/colisoes/pedra1.png'),
            pedra_granito: loadImage('assets/colisoes/pedra2.png')
        };

        // Fator de redução (dividir por 2)
        this.fatorReduzir = 2; // Fator de redução para o tamanho dos obstáculos

        this.grid = this.gerarGrid(); // Gera a grid com blocos e obstáculos fixos
    }

    // Função para gerar a grid com caminho (0) e obstáculos (objetos que contêm tipo)
    gerarGrid() {
        let grid = [];
        for (let i = 0; i < this.numLinhas; i++) {
            let linha = [];
            for (let j = 0; j < this.numColunas; j++) {
                let tipoBloco = this.sortearTipoBloco();
                if (tipoBloco === 0) {
                    linha.push(0); // Caminho
                } else {
                    let obstaculoSorteado = this.obterObstaculoAleatorio();
                    linha.push({ tipo: obstaculoSorteado }); // Obstáculo
                }
            }
            grid.push(linha);
        }

        // Função para garantir que o tesouro tenha espaço ao redor
        const garantirEspacoAoRedorDoTesouro = (x, y) => {
            const direcoes = [
                [-1, 0], [1, 0], [0, -1], [0, 1], // cima, baixo, esquerda, direita
            ];
            for (let [dx, dy] of direcoes) {
                let novoX = x + dx;
                let novoY = y + dy;
                if (novoX >= 0 && novoX < this.numColunas && novoY >= 0 && novoY < this.numLinhas) {
                    grid[novoY][novoX] = 0; // Garante que ao menos uma célula ao redor seja caminho
                }
            }
        };

        // Verifica a posição do baú e garante espaço ao redor
        let [bauX, bauY] = [Math.floor(this.eixoX / this.tamanhoBloco), Math.floor(this.eixoY / this.tamanhoBloco)];
        garantirEspacoAoRedorDoTesouro(bauX, bauY);

        return grid;
    }

    sortearTipoBloco() {
        return random() < 0.8 ? 0 : 1; // 80% de chance de ser caminho
    }

    // Retorna um tipo de obstáculo aleatório
    obterObstaculoAleatorio() {
        const tiposObstaculos = ['cone', 'mato', 'pedra_carvao', 'pedra_granito'];
        const indiceAleatorio = Math.floor(Math.random() * tiposObstaculos.length);
        return tiposObstaculos[indiceAleatorio];
    }

    exibirCenario(textura) {
        imageMode(CENTER);
        let offsetX = 540; // Início da área do cenário em x
        let larguraCenario = this.numColunas * this.tamanhoBloco;
        let alturaCenario = this.numLinhas * this.tamanhoBloco;

        if (debug) {
            console.log("Largura do cenário: " + larguraCenario);
            console.log("Altura do cenário: " + alturaCenario);
            debug = false;
        }

        // Dimensões da textura
        let texturaW = textura.width;
        let texturaH = textura.height;

        // Preencher a área do cenário com a textura repetida
        for (let y = 450; y < alturaCenario; y += texturaH) {
            for (let x = offsetX + 450; x < offsetX + larguraCenario; x += texturaW) {
                image(textura, x, y, texturaW, texturaH);
            }
        }

        // Desenhar o grid por cima
        for (let i = 0; i < this.numLinhas; i++) {
            for (let j = 0; j < this.numColunas; j++) {
                let x = j * this.tamanhoBloco + offsetX;
                let y = i * this.tamanhoBloco;
                let tipoBloco = this.grid[i][j];

                // Desenhar a borda do grid (opcional)
                stroke("#f7fafc"); // Cor da borda sutil
                strokeWeight(1); // Borda fina
                noFill();
                rect(x, y, this.tamanhoBloco, this.tamanhoBloco);
                imageMode(CORNER);
                // Desenhar os obstáculos, se houver
                if (tipoBloco !== 0) {
                    let tipoObstaculo = tipoBloco.tipo;
                    let imgObstaculo = this.imagensObstaculos[tipoObstaculo];

                    if (imgObstaculo) {
                        image(
                            imgObstaculo,
                            x,
                            y,
                            this.tamanhoBloco,
                            this.tamanhoBloco
                        );
                    }

                }
            }
        }
    }

    verificarColisao(robot) {
        let colunaAtual = floor((robot.x - 540) / this.tamanhoBloco); // Ajuste para a área do cenário
        let linhaAtual = floor(robot.y / this.tamanhoBloco);

        // Verifica se está dentro dos limites da grid
        if (linhaAtual >= 0 && linhaAtual < this.numLinhas && colunaAtual >= 0 && colunaAtual < this.numColunas) {
            if (this.grid[linhaAtual][colunaAtual] !== 0) {
                console.log("Colisão com obstáculo!");
                return true; // Colidiu com obstáculo
            }
        }
        return false; // Não colidiu
    }
}