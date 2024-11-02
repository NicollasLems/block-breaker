//quadro
let board;
let boardWidth = 500;
let boardHeight = 500;
let context; 
//Criação de variáveis, possivelmente algumas podem virar constantes

//player
let playerWidth = 80; 
let playerHeight = 10;
let playerVelocityX = 10; 
//O jogador irá mover 10 pixels para direita ou esquerda

let player = {
    x : boardWidth/2 - playerWidth/2,
    /*Garante que o player está centrado horizontalmente no quadro*/
    y : boardHeight - playerHeight - 5,
    /*Posiciona o player verticamente na base do quadro com uma separação de 5, separando o jogador e a base do quadro */
    width: playerWidth,
    height: playerHeight,
    /*Associando a largura e a altura para a variável*/
    velocityX : playerVelocityX
}

//ball
let ballWidth = 10;
let ballHeight = 10;
let ballVelocityX = 3; 
let ballVelocityY = 2; 

let ball = {
    x : boardWidth/2,
    y : boardHeight/2,
    width: ballWidth,
    height: ballHeight,
    velocityX : ballVelocityX,
    velocityY : ballVelocityY
    //Associando cada termo a sua respectiva variável
}

//blocos
let blockArray = [];
let blockWidth = 50;
let blockHeight = 10;
let blockColumns = 8; 
let blockRows = 3; //adiciona mais linhas conforme o jogo progride
let blockMaxRows = 10; //limita o máximo de linhas
let blockCount = 0;

//Os blocos serão inicializados a partir do canto superior esquerdo
let blockX = 15;
let blockY = 45;

let score = 0;
let gameOver = false;

const audio = new Audio('./assets/audio/jazz.mp3');//uma const de audio para a execução dele

//função de execucão de audio
function playAudio(){
	let x =document.getElementById ("audio");
	x.play();
}

let vidas = 3;//declaração da variavel de vidas

	function dano(vidas){ //função que executa o dano quando chamada
		return vidas - 1
	}

window.onload = function() {
    board = document.getElementById("board");
    //Associando o ID do canvas (quadro) para a variável quadro, o quadro podendo "desenhar" agora no canvas
    board.height = boardHeight;
    board.width = boardWidth;
    //Igualando a altura e largura do quadro para suas devidas variáveis
    context = board.getContext("2d"); 
    //Irá dizer qual meio o jogo está sendo feito, no caso 2D e usado para desenhar no quadro
    context.fillStyle="#e4185f";
    context.fillRect(player.x, player.y, player.width, player.height);
    //O método fillRect está desenhando um retângulo baseado nos dados de posição e tamanho do player

    requestAnimationFrame(update);
    document.addEventListener("keydown", movePlayer);
    //Toda vez que o jogador apertar a tecla (keydown) irá chamar a função que movimenta o jogador

    //criar blocos
    createBlocks();
}

function update() {
    //Atualiza a animação antes do próximo "frame", deixa mais suave
    requestAnimationFrame(update);
     //Limpa uma área do canvas (usado antes de desenhar mais frames)
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //Jogador
    context.fillStyle = "#e68a00"; //preenchimento da cor do jogador
    context.fillRect(player.x, player.y, player.width, player.height);
    //O método fillRect está desenhando um retângulo baseado nos dados de posição e tamanho do player

    //bola
    context.fillStyle = "white";
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    context.fillRect(ball.x, ball.y, ball.width, ball.height);
     //Os termos que são separados com um ponto devem ficar em inglês caso não irão funcionar

    //bounce the ball off player paddle
    if (topCollision(ball, player) || bottomCollision(ball, player)) {
        ball.velocityY *= -1;    
        //gira o eixo Y na direção de para cima ou para baixo
    }
    else if (leftCollision(ball, player) || rightCollision(ball, player)) {
        ball.velocityX *= -1;   
        //gira o eixo X na direção de para direta ou para a esquerda
    }

    if (ball.y <= 0) { 
        //se a bola tocar o topo do canvas
        ball.velocityY *= -1; // reverte a direção
    }
    else if (ball.x <= 0 || (ball.x + ball.width >= boardWidth)) {
        //se a bola tocar o lado direito ou esquerdo 
        ball.velocityX *= -1; // reverte a direção
    }
    else if (ball.y + ball.height >= boardHeight) {
        //se a bola tocar a base do canvas = GAME OVER
		resetGame() //chamando a função para resetar o jogo quando a bola tocar a base de canvas
		if(vidas <= 0){ //o redirecionamento até a guia de derrota caso as vidas fiquem menores ou igual a 0
		window.location.href ="gameover.html";
        gameOver = true;
		}
    }

    //blocos
    context.fillStyle = "#ac00e6";
    for (let i = 0; i < blockArray.length; i++) {
        let block = blockArray[i];
        if (!block.break) {
            if (topCollision(ball, block) || bottomCollision(ball, block)) {
                block.break = true;     
                ball.velocityY *= -1;   //gira o eixo y para cima ou para baixo
                score += 100;
                blockCount = blockArray.length;
            }
            else if (leftCollision(ball, block) || rightCollision(ball, block)) {
                block.break = true;     
                ball.velocityX *= -1;   //gira o eixo x para esquerda ou para direita
                score += 100;
                blockCount = blockArray.length;
            }
            context.fillRect(block.x, block.y, block.width, block.height);
        }
    }

    //próximo nível
    if (blockCount == 0) {
        score += 100*blockRows*blockColumns; //pontos bônus
        blockRows = Math.min(blockRows + 1, blockMaxRows);
        createBlocks();
    }

    //pontuação
    context.font = "20px sans-serif";
    context.fillText(score, 10, 25);
	
	//texto vidas
	context.font = "20px sans-serif";
    context.fillText("VIDAS:", 410, 25);
	
	//valor de vidas atual
	context.font = "20px sans-serif";
    context.fillText(vidas, 475, 25);
}

function outOfBounds(xPosition) {
    //Verifica se a posição X está fora dos limites do canvas
    return (xPosition < 0 || xPosition + playerWidth > boardWidth);
}

function movePlayer(e) {
    if (gameOver) {
        if (e.code == "Space") {
            setTimeout(resetGame, 500); // adiciona um delay de 500ms antes do reset
            resetGame();
            console.log("RESET");
        }
        return;
    }
    if (e.code == "ArrowLeft" || e.code == "KeyA") {
        let nextplayerX = player.x - player.velocityX;
        //Calcula a posiçção futura do jogador com base da sua posição atual e velocidade horizontal
        if (!outOfBounds(nextplayerX)) {
            player.x = nextplayerX;
        }
    }
    else if (e.code == "ArrowRight" || e.code == "KeyD") {
        let nextplayerX = player.x + player.velocityX;
        //Implementado também poder se mover para a direita e esquerda com as teclas A e D (acessível para destros e canhotos)
        if (!outOfBounds(nextplayerX)) {
            player.x = nextplayerX;
            //Atualiza a posição atual para a posição futura
        }   
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   
           a.x + a.width > b.x &&   
           a.y < b.y + b.height &&  
           a.y + a.height > b.y;    

           /* Entendi +/- as linhas a cima mas em resumo é se todas forem verdadeiras
significa que os obj 'a' e 'b' estão colidindo, caso contrário, não estão.*/
}

function topCollision(ball, block) { //Verifica se a bola está colidindo com o bloco em geral
    return detectCollision(ball, block) && (ball.y + ball.height) >= block.y;
    /* Com a função detectarColisao detecta se está colidindo em geral, adiciona também
    uma condição extra para verificar se a borda inferior da bola está abaixo ou na mesma
    altura que a borda superior do bloco */
}

function bottomCollision(ball, block) { 
    return detectCollision(ball, block) && (block.y + block.height) >= ball.y;
}

function leftCollision(ball, block) { 
    return detectCollision(ball, block) && (ball.x + ball.width) >= block.x;
}

function rightCollision(ball, block) { 
    return detectCollision(ball, block) && (ball.x >= block.x + block.width);
}

function createBlocks() {
    blockArray = []; //limpa blockArray
    for (let c = 0; c < blockColumns; c++) {
        for (let r = 0; r < blockRows; r++) {
            let block = {
                x : blockX + c*blockWidth + c*10, // c*10 é o espaço de 10 pixels entre as colunas
                y : blockY + r*blockHeight + r*10, // r*10 é o espaço de 10 pixels entre as linhas
                width : blockWidth,
                height : blockHeight,
                break : false
            }
            blockArray.push(block);
        }
    }
    blockCount = blockArray.length;
}

function resetGame() {
    //serve essencialmente para retornar o jogo como de inicio e começar uma nova gameplay
    gameOver = false;
    player = {
        x : boardWidth/2 - playerWidth/2,
        y : boardHeight - playerHeight - 5,
        width: playerWidth,
        height: playerHeight,
        velocityX : playerVelocityX
    }
    ball = {
        x : boardWidth / 2,
        y : boardHeight / 2,
        width: ballWidth,
        height: ballHeight,
        velocityX : 3, // direção inicial padrão
        velocityY : -2 // direção inicial para cima
    }
    blockArray = [];
    blockRows = 3;
    score = 0;
    createBlocks();
	vidas = dano(vidas) //chamando a função para causar dano na vida do jogador
}