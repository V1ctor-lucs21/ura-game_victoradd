let tela_width = 1440;
let tela_height = 900;
let tela_atual;

function preload() {
    fase1.preload();
}

function setup() {
    let cnv = createCanvas(tela_width, tela_height);
    cnv.position((windowWidth - width) / 2, (windowHeight - height) / 2);
    window.onresize = () => {
        cnv.position((windowWidth - width) / 2, (windowHeight - height) / 2);
    };
    tela_atual = menu;
    tela_atual.init();
}

function draw() {
    tela_atual.draw();
}

function mudanca_tela(proxima_tela){
    tela_atual = proxima_tela;
    if(tela_atual.init){
        tela_atual.init();
    }
}

function mouseClicked() {
    if(tela_atual.mouseClicked){
        tela_atual.mouseClicked();
    }
}

function mousePressed() {
    if(tela_atual.mousePressed){
        tela_atual.mousePressed();
    }
}

function mouseReleased() {
    if(tela_atual.mouseReleased){
        tela_atual.mouseReleased();
    }
}