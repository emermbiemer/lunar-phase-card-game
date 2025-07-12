// This file serves as the main JavaScript entry point for the lunar phase card game.
// It initializes the game, handles user interactions, and manages the game state.

import Card from './components/Card.js';
import lunarPhases from './utils/lunarPhases.js';

const playingField = document.getElementById('playing-field');
const gameBoard = document.getElementById('game-board');
const startGameBtn = document.getElementById('start-game-btn');

let playerHand = [];
let botHand = [];
let field = Array(8).fill(null); // 8 card holders
let selectedCardIdx = null;
let playerScore = 0;
let botScore = 0;

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function dealHands() {
    const deck = shuffle([...lunarPhases]);
    playerHand = deck.slice(0, 4);
    botHand = deck.slice(4, 8);
}

function renderPlayerHand() {
    gameBoard.innerHTML = '';
    playerHand.forEach((cardData, idx) => {
        const card = new Card(cardData.name, cardData.image);
        const cardElem = card.render();
        if (selectedCardIdx === idx) {
            cardElem.classList.add('selected');
        }
        cardElem.onclick = () => {
            selectedCardIdx = idx;
            renderPlayerHand();
            renderPlayingField(); // <-- Add this line
        };
        gameBoard.appendChild(cardElem);
    });
}

function renderPlayingField() {
    playingField.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        const holder = document.createElement('div');
        holder.className = 'card-holder' + (field[i] ? ' filled' : '');
        if (field[i]) {
            const card = new Card(field[i].name, field[i].image);
            holder.appendChild(card.render());
        } else if (selectedCardIdx !== null) {
            holder.onclick = () => {
                const playedCard = playerHand.splice(selectedCardIdx, 1)[0];
                field[i] = playedCard;
                selectedCardIdx = null;
                handleScoring(playedCard, i, 'player');
                renderPlayingField();
                renderPlayerHand();
                setTimeout(() => {
                    botPlaceCard();
                }, 500);
            };
            holder.style.cursor = 'pointer';
        }
        playingField.appendChild(holder);
    }
}

function botPlaceCard() {
    const emptyIndices = field.map((c, i) => c === null ? i : null).filter(i => i !== null);
    if (botHand.length && emptyIndices.length) {
        const cardIdx = Math.floor(Math.random() * botHand.length);
        const posIdx = Math.floor(Math.random() * emptyIndices.length);
        const playedCard = botHand.splice(cardIdx, 1)[0];
        const fieldIdx = emptyIndices[posIdx];
        field[fieldIdx] = playedCard;
        handleScoring(playedCard, fieldIdx, 'bot');
        renderPlayingField();
        renderPlayerHand();
    }
}

function playerPlaceCard(handIdx) {
    // Let player pick a spot next to or before a bot card
    const validIndices = field.map((c, i) => c === null ? i : null).filter(i => i !== null);
    const pos = prompt(`Choose a position (0-7) to place your card: ${validIndices.join(', ')}`);
    const posIdx = parseInt(pos, 10);
    if (validIndices.includes(posIdx)) {
        field[posIdx] = playerHand.splice(handIdx, 1)[0];
        renderPlayingField();
        renderPlayerHand();
        checkFullMoon();
        setTimeout(() => {
            botPlaceCard();
            checkFullMoon();
        }, 500);
    }
}


function isFullMoonCombo(left, center, right) {
    // Full Moon (4/4) can be formed by:
    // 1. Last Quarter (2/4, left) + First Quarter (2/4, right)
    // 2. Waxing Gibbous (3/4, right) + Waning Gibbous (3/4, left)
    // 3. Waxing Crescent (1/4, right) + Waning Crescent (1/4, left)
    // 4. New Moon (0/4, center) + Full Moon (4/4, center) (special, not a combo, but for completeness)
    if (!left || !center || !right) return false;
    if (
        (left === "Last Quarter" && center === "Full Moon" && right === "First Quarter") ||
        (left === "Waxing Gibbous" && center === "Full Moon" && right === "Waning Gibbous") ||
        (left === "Waning Crescent" && center === "Full Moon" && right === "Waxing Crescent")
    ) {
        return true;
    }
    return false;
}

function checkFullMoonCombos(idx, who) {
    let points = 0;
    // Check for full moon combos centered at idx
    const getCardName = (i) => field[i]?.name || null;
    const left = getCardName(idx - 1);
    const center = getCardName(idx);
    const right = getCardName(idx + 1);
    if (center === "Full Moon" && isFullMoonCombo(left, center, right)) {
        points += 12; // Full Moon combo points
    }
    // Optionally, check for other combos (e.g., New Moon + Full Moon, etc.)
    return points;
}

function updateScores() {
    document.getElementById('player-score').textContent = `You: ${playerScore}`;
    document.getElementById('bot-score').textContent = `Bot: ${botScore}`;
}

function handleScoring(card, idx, who) {
    let points = 0;

    const getCardName = (i) => field[i]?.name || null;

    const left = getCardName(idx - 1);
    const right = getCardName(idx + 1);

    const name = card.name;

    // Define helper to check pairs
    function isFullMoonPair(leftName, rightName) {
        return (
            (leftName === "New Moon" && rightName === "Full Moon") ||
            (leftName === "Full Moon" && rightName === "New Moon") ||
            (leftName === "Waning Gibbous" && rightName === "Waxing Crescent") ||
            (leftName === "Last Quarter" && rightName === "First Quarter")
        );
    }

    // Check left + current
    if (left && isFullMoonPair(left, name)) {
        points += 5;
    }
    // Check current + right
    if (right && isFullMoonPair(name, right)) {
        points += 5 ;
    }

    // Bonus: full moon + full moon adjacent pairs = 2 points per pair
    if (left === "Full Moon" && name === "Full Moon") {
        points += 15;
    }
    if (right === "Full Moon" && name === "Full Moon") {
        points += 15;
    }

    // Update scores
    if (who === 'player') {
        playerScore += points;
    } else {
        botScore += points;
    }

    updateScores();
}


function startGame() {
    dealHands();
    field = Array(8).fill(null);
    playerScore = 0;
    botScore = 0;
    updateScores();
    selectedCardIdx = null;
    renderPlayingField();
    renderPlayerHand();
    botPlaceCard();
}

startGameBtn.addEventListener('click', startGame);