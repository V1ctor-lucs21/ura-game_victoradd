// A classe 'bloco' permanece a mesma que você já tem (a versão mais nova)
class bloco {
    constructor(x, y, text) {
        this.x = x;
        this.y = y;
        this.w = 180;
        this.h = 40;
        this.text = text;
        this.tam = 40; // Para o bloco While
        this.next = null; // Ponteiro para o próximo bloco na LinkedBlocos
        this.whileCont = 1;
        this.whileSequence = false;
    }
    //ssssss
    //lopdiwds
    //ff
    display() {
        imageMode(CORNER);
        if (this.text == "While") {
            image(fase1.blocoWhile_cima, this.x, this.y, this.w, this.h);
            image(fase1.blocoWhile_vertical, this.x, this.y + 30, this.h/2, this.tam);
            if(this.whileSequence){
                fill("#FFFF00");
                circle(this.x + 15, this.y + this.h/2, 20)
                fill("#3E7FC1");
                text(this.whileCont, this.x + 16, this.y + this.h/2 - 2);
            }
            if (!this.whileSequence) {
                image(fase1.blocoWhile_horizontal, this.x, this.y+this.tam+20, this.w, this.h/2);
            }
        } else if (this.text == "Avançar") {
            image(fase1.blocoAvancar, this.x, this.y, this.w, this.h);
        } else if (this.text == "Esquerda") {
            image(fase1.blocoEsquerda, this.x, this.y, this.w, this.h);
        } else if (this.text == "Direita") {
            image(fase1.blocoDireita, this.x, this.y, this.w, this.h);
        } else {
            image(fase1.blocoWhile_horizontal, this.x, this.y, this.w, this.h);
        }

    }

    isInside(px, py) {
        // Ajuste para blocos 'While' se a área clicável for diferente
        let checkWidth = this.w;
        let checkHeight = this.h;
        //verificando se houve click dentro do bloco de contagem do while
        if (this.text == "While" && this.whileSequence) {
            checkWidth = this.w + 2;
            checkHeight = this.h + this.tam;
            if (px >= this.x + 5 && px <= this.x + 25 && py >= this.y + this.h/2 - 10 && py <= this.y + this.h/2 + 10) {
                this.whileCont++;
                console.log("Ciclicou no círculo");
                return true; // Clicou no círculo
            }
        }	
        return px >= this.x && px <= this.x + checkWidth && py >= this.y && py <= this.y + checkHeight;
    }
}