import BLOCKS from "./blocks.js"
//DOM
const playground = document.querySelector(".playground ul");
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const restartBtn = document.querySelector(".game-text button")
//세팅
const GAME_ROWS = 20;
const GAME_COLS = 10;

//변수
let score = 0;
let duration = 500;
let downIneterval;
let tempMovingItem;


// 
const movingItem = {
    type: "tree",
    direction: 0,  // 화살표 방향을 눌렀을때 돌아가는 지표
    top: 0, //좌표기준 어디까지 내려가는지
    left: 3  //좌 우값을 알려줌
}


init()
//fucntios

function init() {
    tempMovingItem = { ...movingItem }; // {...} =spread operator // movingItem 내용을 복사해온다.
    for (let i = 0; i < GAME_ROWS; i++) {
        prependNewline();
    }
    generateNewBlock();

}

function prependNewline() {
    const li = document.createElement("li");
    const ul = document.createElement("ul");
    // li 10개를 ul안에 만들어준다.
    for (let j = 0; j < GAME_COLS; j++) {
        const matrix = document.createElement("li");
        ul.prepend(matrix)
    }
    // 만든 li안에 ul을 넣어준다.
    li.prepend(ul)

    //ul 안에 li를 넣어준다.
    playground.prepend(li)
}


function renderBlocks(moveType = "") {
    const { type, direction, top, left } = tempMovingItem;
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove(type, "moving")
    })
    BLOCKS[type][direction].some(block => { // forEach는 break가 되지않기 떄문에 some사용
        const x = block[0] + left;
        const y = block[1] + top;
        const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
        const isAvailable = checkEmpty(target);
        if (isAvailable) {
            target.classList.add(type, "moving");
        } else {
            tempMovingItem = { ...movingItem }
            if (moveType === "retry") {
                clearInterval(downIneterval);
                showGameOverText();
            }
            setTimeout(() => {
                renderBlocks("retry");
                if (moveType === "top") {
                    seizseBlock();
                }
            }, 0)
            return true;
        }

    })
    // 위치 잡아주기
    movingItem.left = left;
    movingItem.top = top;
    movingItem.direction = direction;
}

function seizseBlock() {
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove("moving");
        moving.classList.add("seized");
    })
    checkMatch();

}

function checkMatch() {
    const childNodes = playground.childNodes;
    childNodes.forEach(child => {
        let matched = true;
        child.children[0].childNodes.forEach(li => {
            if (!li.classList.contains("seized")) {
                matched = false;
            }
        })
        if (matched) {
            child.remove();
            prependNewline();
            score++;
            scoreDisplay.innerText = score;
        }
    })
    generateNewBlock();
}


function generateNewBlock() {
    clearInterval(downIneterval);
    downIneterval = setInterval(() => {
        moveBlock("top", 1)
    }, duration)
    const blockArray = Object.entries(BLOCKS);
    const randomIndex = Math.floor(Math.random() * blockArray.length);
    movingItem.type = blockArray[randomIndex][0];
    movingItem.top = 0;
    movingItem.left = 3;
    movingItem.direction = 0;
    tempMovingItem = { ...movingItem };
    renderBlocks();
}

function checkEmpty(target) {
    if (!target || target.classList.contains("seized")) { // seized라는 class를 갖고있다면
        return false;
    }
    return true;
}

function moveBlock(moveType, amount) {
    tempMovingItem[moveType] += amount;
    renderBlocks(moveType)
}

function changeDirection() {
    const direction = tempMovingItem.direction;
    direction === 3 ? tempMovingItem.direction = 0 : tempMovingItem.direction += 1;
    renderBlocks()

}
function dropBlock() {
    clearInterval(downIneterval);
    downIneterval = setInterval(() => {
        moveBlock("top", 1)
    }, 10) // 10 = 속도
}

function showGameOverText() {
    gameText.style.display = "flex";
}
// event handling
document.addEventListener("keydown", e => {
    switch (e.keyCode) {
        case 39:
            moveBlock("left", 1);
            break;
        case 37:
            moveBlock("left", -1);
            break;
        case 40:
            moveBlock("top", 1);
            break;
        case 38:
            changeDirection();
            break;
        case 32:
            dropBlock();
            break;
        default:
            break;
    }
})

function reStart() {
        playground.innerHTML = "";
        gameText.style.display = "none";
        scoreDisplay.innerText = 0;
        init();
}

restartBtn.addEventListener("click", () => {
    reStart();
})


document.addEventListener("keydown", () => {
    if (gameText.style.display === "flex") {
        reStart();
    }
})
