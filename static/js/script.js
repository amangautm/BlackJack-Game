//global variables containing all the id's of the div and span tag where we want to show dynamically
let blackjackGame = {
    'you': { 'scoreSpan': '#your-blackjack-result', 'div': '#your-box', 'score': 0 },
    'dealer': { 'scoreSpan': '#dealer-blackjack-result', 'div': '#dealer-box', 'score': 0 },
    'cards': ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
    'cardsValue': { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': [1, 11] },
    'wins': 0,
    'losses': 0,
    'draws': 0,
    'isHit': false,
    'isStand': false,
    'turnOver': false,

};   //storing the id's of span tag where score will be shown and id's of the div where these span tag's are 

const YOU = blackjackGame['you'];
const DEALER = blackjackGame['dealer'];

//event listeners on all buttons
document.querySelector('#blackjack-hit').addEventListener('click', blackjackHit); //we're basically finding the button with the help of id and when we click it blackjackHit fn will be called.
document.querySelector('#blackjack-deal').addEventListener('click', blackjackDeal);
document.querySelector('#blackjack-stand').addEventListener('click', dealerLogic);

const hitSound = new Audio('static/sounds/swish.m4a');
const winSound = new Audio('static/sounds/cash.mp3');
const loseSound = new Audio('static/sounds/aww.mp3');

//Hit button
function blackjackHit() {
    if (blackjackGame['isStand'] === false) { //i.e when we hit stand button we can't come back and click hit button
        blackjackGame['isHit'] = true;
        let card = randomCard();
        showCard(card, YOU);
        updateScore(card, YOU);
        showScore(YOU);
    }
    else{
        alert('Click Deal Button to start next match');
    }
}

//Deal button to play again i.e to remove all cards from table and score to 0
function blackjackDeal() {
    if (blackjackGame['turnOver'] === true) {

        //now once we click deal button we should be able to click hit button
        blackjackGame['isStand'] = false;

        let yourImages = document.querySelector('#your-box').querySelectorAll('img');  //inside our box by img tag we'll finding it , alist will be returned
        for (let i = 0; i < yourImages.length; i++) {
            yourImages[i].remove();
        }
        let dealerImages = document.querySelector('#dealer-box').querySelectorAll('img');
        for (let i = 0; i < dealerImages.length; i++) {
            dealerImages[i].remove();
        }

        YOU['score'] = 0;
        DEALER['score'] = 0;

        //at front end setting all field to normal as initial
        document.querySelector(YOU['scoreSpan']).textContent = 0;
        document.querySelector(DEALER['scoreSpan']).textContent = 0;
        document.querySelector(YOU['scoreSpan']).style.color = '#ffffff';
        document.querySelector(DEALER['scoreSpan']).style.color = '#ffffff';

        document.querySelector('#blackjack-result').textContent = "Let's Play!";
        document.querySelector('#blackjack-result').style.color = 'black';

        //now again turnover should be assigned to false as fresh match starts
        blackjackGame['turnOver'] = false;
    }
    else{
        alert('Click Hit button to start the match');
    }
}

//now setting bot logic i.e dealer
async function dealerLogic() {
    if (blackjackGame['isHit'] === true) {
        blackjackGame['isStand'] = true; //stand mode activated i.e now hit button can't be clicked

        //now once a user clicks stand button bot should automatically make it's move
        while (DEALER['score'] < 16 && blackjackGame['isStand'] == true) {
            let card = randomCard();
            showCard(card, DEALER);
            updateScore(card, DEALER);
            showScore(DEALER);
            await sleep(1000);
        }
        blackjackGame['turnOver'] = true; //basically this is the point when bot game ends and now only deal button should work
        let winner = computeWinner();
        showResult(winner);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomCard() {
    let randomIndex = Math.floor(Math.random() * 13);
    return blackjackGame['cards'][randomIndex];
}

//this fn will be for both player so we'll take the active player as an argument and according to it will select that div
function showCard(card, activePlayer) {
    if (activePlayer['score'] <= 21) {
        let cardImage = document.createElement('img');
        cardImage.src = `static/images/${card}.png`;
        document.querySelector(activePlayer['div']).appendChild(cardImage);
        hitSound.play();
    }
}

function updateScore(card, activePlayer) {
    if (card === 'A') {
        //to give ace score 1 or 11. So if adding 11 keeps score below than 21 then keep it otherwise add 1
        if (activePlayer['score'] + blackjackGame['cardsValue'][card][1] <= 21) {
            activePlayer['score'] += blackjackGame['cardsValue'][card][1];
        }
        else {
            activePlayer['score'] += blackjackGame['cardsValue'][card][0];
        }
    }
    else {
        activePlayer['score'] += blackjackGame['cardsValue'][card];
    }
}

function showScore(activePlayer) {
    if (activePlayer['score'] > 21) {
        document.querySelector(activePlayer['scoreSpan']).textContent = 'BUST!!';
        document.querySelector(activePlayer['scoreSpan']).style.color = 'red';
    }
    else {
        document.querySelector(activePlayer['scoreSpan']).textContent = activePlayer['score'];
    }
}

//compute winner and return who just win
function computeWinner() {
    let winner;

    if (YOU['score'] <= 21) {
        //condition: higher score than dealer or when dealer busts and we are <=21
        if (YOU['score'] > DEALER['score'] || DEALER['score'] > 21) {
            blackjackGame['wins']++;
            winner = YOU;
        } else if (YOU['score'] < DEALER['score']) {
            blackjackGame['losses']++;
            winner = DEALER;

        } else if (YOU['score'] === DEALER['score']) {
            blackjackGame['draws']++;                  //drew
        }
        //condition: when user busts and dealer doesn't
    } else if (YOU['score'] > 21 && DEALER['score'] <= 21) {
        blackjackGame['losses']++;
        winner = DEALER;
    }
    else if (YOU['score'] > 21 && DEALER['score'] > 21) {
        blackjackGame['draws']++; //drew
    }

    return winner;
}


function showResult(winner) {
    let message, messageColor;

    //now stand button should not work as hit button should be clicked first
    blackjackGame['isHit'] = false;

    if (blackjackGame['turnOver'] === true) {
        if (winner === YOU) {
            document.querySelector('#wins').textContent = blackjackGame['wins'];
            message = 'You Won!';
            messageColor = 'green';
            winSound.play();
        } else if (winner === DEALER) {
            document.querySelector('#losses').textContent = blackjackGame['losses'];
            message = 'You Lost!';
            messageColor = 'red';
            loseSound.play();
        }
        else {
            document.querySelector('#draws').textContent = blackjackGame['draws'];
            message = 'You Drew!';
            messageColor = 'yellow';
        }

        document.querySelector('#blackjack-result').textContent = message;
        document.querySelector('#blackjack-result').style.color = messageColor;
    }
}
