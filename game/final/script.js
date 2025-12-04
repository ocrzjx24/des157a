(function(){
    "use strict";
    console.log("reading JS");

    // game data
    const gameData = {
        currentPlayer: 1,
        p1Slots: [null, null, null],
        p2Slots: [null, null, null],
        rolledPairs: [],
        selectedPair: null,
        p1Score: 0,
        p2Score: 0,
        winTarget: 5,
        rolledThisRound: { 1: false, 2: false }
    };

    // DOM elements
    const p1DiceContainer = document.querySelector("#p1-dice-container");
    const p2DiceContainer = document.querySelector("#p2-dice-container");
    const p1RollBtn = document.querySelector("#p1-roll-btn");
    const p2RollBtn = document.querySelector("#p2-roll-btn");
    const slotsEls = document.querySelectorAll(".slot");
    const logLine = document.querySelector("#log-line");
    const roundStatus = document.querySelector("#round-status");
    const p1ScoreEl = document.querySelector("#p1-score");
    const p2ScoreEl = document.querySelector("#p2-score");

    // utils
    function rollDie(){
        return Math.floor(Math.random() * 6) + 1;
    }

    function rollThreePairs(){
        const result = [];
        for(let i=0; i<3; i++){
            let d1 = rollDie();
            let d2 = rollDie();
            let pairObj = {
                d1: d1,
                d2: d2,
                sum: d1 + d2,
                id: Date.now() + i
            };
            result.push(pairObj);
        }
        return result;
    }

    function setLog(message){
        logLine.textContent = message;
    }

    function setRoundStatus(message){
        roundStatus.textContent = message;
    }

    function updateScores(){
        p1ScoreEl.textContent = gameData.p1Score;
        p2ScoreEl.textContent = gameData.p2Score;
    }

    function clearDiceUI(){
        gameData.selectedPair = null;
        gameData.rolledPairs = [];
        p1DiceContainer.innerHTML = "";
        p2DiceContainer.innerHTML = "";
    }

    function resetSlotStyling(){
        for(let i=0; i<slotsEls.length; i++){
            slotsEls[i].classList.remove("revealed");
            slotsEls[i].classList.remove("occupied-p1");
            slotsEls[i].classList.remove("occupied-p2");
            slotsEls[i].textContent = "?";
            slotsEls[i].style.borderColor = "";
            slotsEls[i].style.boxShadow = "";
        }
    }

    // dice pairs
    function renderPairs(){
        let container;
        let other;

        if(gameData.currentPlayer === 1){
            container = p1DiceContainer;
            other = p2DiceContainer;
        } else {
            container = p2DiceContainer;
            other = p1DiceContainer;
        }

        container.innerHTML = "";
        other.innerHTML = "";

        for(let i=0; i<gameData.rolledPairs.length; i++){
            let pair = gameData.rolledPairs[i];

            let card = document.createElement("div");
            card.className = "pair-card";
            card.dataset.pairId = pair.id;

            let diceCol = document.createElement("div");
            diceCol.className = "pair-dice";

            let d1Div = document.createElement("img");
            d1Div.className = "single-die";
            d1Div.src = `img/dice${pair.d1}.png`;

            let d2Div = document.createElement("img");
            d2Div.className = "single-die";
            d2Div.src = `img/dice${pair.d2}.png`;

            diceCol.appendChild(d1Div);
            diceCol.appendChild(d2Div);

            let sumBadge = document.createElement("div");
            sumBadge.className = "sum-badge";
            sumBadge.textContent = pair.sum;

            card.appendChild(diceCol);
            card.appendChild(sumBadge);

            card.addEventListener("click", function(){
                let allCards = container.querySelectorAll(".pair-card");
                for(let j=0; j<allCards.length; j++){
                    allCards[j].classList.remove("selected");
                }

                let clickedId = this.dataset.pairId;

                if(gameData.selectedPair && gameData.selectedPair.id == clickedId){
                    gameData.selectedPair = null;
                } else {
                    for(let k=0; k<gameData.rolledPairs.length; k++){
                        if(gameData.rolledPairs[k].id == clickedId){
                            gameData.selectedPair = gameData.rolledPairs[k];
                        }
                    }
                    this.classList.add("selected");
                }
            });

            container.appendChild(card);
        }
    }

    function removePairById(id) {
        let newPairs = [];
        for (let i = 0; i < gameData.rolledPairs.length; i++) {
            if (gameData.rolledPairs[i].id !== id) {
                newPairs.push(gameData.rolledPairs[i]);
            }
        }
        gameData.rolledPairs = newPairs;
        renderPairs();
    }

    // game flow and logic
    function playerRoll(){

        gameData.rolledPairs = rollThreePairs();
        gameData.rolledThisRound[gameData.currentPlayer] = true;

        renderPairs();
        setLog("Player " + gameData.currentPlayer + " rolled. PLACE YOUR SUMS.");

        p1RollBtn.disabled = true;
        p2RollBtn.disabled = true;
    }

    function placePair(slotIndex){
        if(gameData.selectedPair === null){
            setLog("Select a pair first.");
            return;
        }

        let slots;
        if(gameData.currentPlayer === 1){
            slots = gameData.p1Slots;
        } else {
            slots = gameData.p2Slots;
        }

        if(slots[slotIndex] !== null){
            setLog("Slot already used.");
            return;
        }

        slots[slotIndex] = gameData.selectedPair.sum;
        if (gameData.currentPlayer === 1) {
            slotsEls[slotIndex].classList.add("occupied-p1");
        } else {
            slotsEls[slotIndex].classList.add("occupied-p2");
        }
        slotsEls[slotIndex].textContent = "?";

        removePairById(gameData.selectedPair.id);
        gameData.selectedPair = null;

        let allFilled = true;
        for(let i=0; i<slots.length; i++){
            if(slots[i] === null){
                allFilled = false;
            }
        }

        if(allFilled){
            if(gameData.currentPlayer === 1){
                gameData.currentPlayer = 2;
                p2RollBtn.disabled = gameData.rolledThisRound[2];
                setLog("Player 1 is done. Player 2. ROLL.");
                clearDiceUI();
            } else {
                p1RollBtn.disabled = true;
                p2RollBtn.disabled = true;
                setLog("Player 2 is done. REVEALING RESULTS.");
                revealAndScore();
            }
        } else {
            setLog("Placed value into slot " + (slotIndex + 1) + ". Place remaining pairs.");
        }
    }

    function revealAndScore(){
        let p1Wins = 0;
        let p2Wins = 0;

        for(let i=0; i<slotsEls.length; i++){
            let p1Value = gameData.p1Slots[i];
            let p2Value = gameData.p2Slots[i];

            slotsEls[i].classList.add("revealed");
            slotsEls[i].textContent = p1Value + " — " + p2Value;

            if(p1Value > p2Value){
                p1Wins++;
                slotsEls[i].style.borderColor = "#0a9bc4";
                slotsEls[i].style.boxShadow = "0 0 10px #0a9bc4 inset";
            } 
            else if(p2Value > p1Value){
                p2Wins++;
                slotsEls[i].style.borderColor = "#c90d81";
                slotsEls[i].style.boxShadow = "0 0 10px #c90d81 inset";
            } 
            else {
                slotsEls[i].style.borderColor = "#322920ff";
            }
        }

        if(p1Wins >= 2 || (p1Wins == 1 && p2Wins == 0)){
            gameData.p1Score++;
            setRoundStatus("Player 1 wins the round (" + p1Wins + " - " + p2Wins + ")");
        } 
        else if(p2Wins >= 2 || (p2Wins == 1 && p1Wins == 0)){
            gameData.p2Score++;
            setRoundStatus("Player 2 wins the round (" + p2Wins + " - " + p1Wins + ")");
        } 
        else {
            setRoundStatus("This round is a draw.");
        }

        updateScores();

        setTimeout(nextRound, 2500);
    }

    function nextRound(){
        gameData.p1Slots = [null, null, null];
        gameData.p2Slots = [null, null, null];
        gameData.rolledPairs = [];
        gameData.selectedPair = null;
        gameData.rolledThisRound[1] = false;
        gameData.rolledThisRound[2] = false;
        gameData.currentPlayer = 1;

        clearDiceUI();
        resetSlotStyling();

        p1RollBtn.disabled = false;
        p2RollBtn.disabled = true;

        setLog("New round. Player 1. ROLL.");
        setRoundStatus("");

        checkGameOver();
    }

    function checkGameOver(){
        if(gameData.p1Score >= gameData.winTarget || gameData.p2Score >= gameData.winTarget){
            let winner;
            if(gameData.p1Score >= gameData.winTarget){
                winner = 1;
            } else {
                winner = 2;
            }

            setRoundStatus("PLAYER " + winner + " WINS THE GAME.");
            setLog("MY JOB HERE IS DONE.");

            p1RollBtn.disabled = true;
            p2RollBtn.disabled = true;
        }
    }

    // event listeners
    for(let i=0; i<slotsEls.length; i++){
        slotsEls[i].addEventListener("click", function(){
            let index = Number(this.dataset.slot);
            placePair(index);
        });
    }

    p1RollBtn.addEventListener("click", function(){
        if(gameData.currentPlayer === 1){
            playerRoll();
        }
    });

    p2RollBtn.addEventListener("click", function(){
        if(gameData.currentPlayer === 2){
            playerRoll();
        }
    });

    // run the game!
    function init(){
        resetSlotStyling();
        updateScores();
        setLog("Player 1's turn. Roll to begin.");
        p1RollBtn.disabled = false;
        p2RollBtn.disabled = true;
    }

    init();
})();
