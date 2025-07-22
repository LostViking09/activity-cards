class ActivityGame {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.usedCards = new Set();
        this.cardsData = [];
        this.roundNumber = 1;
        this.categories = ['A', 'B', 'C', 'D', 'E', 'F'];
        this.tasks = ['Draw', 'Speak', 'Show'];
        this.taskIcons = ['✏️', '💬', '🎭'];
        this.taskCategories = {
            0: ['A', 'D'], // Draw
            1: ['B', 'E'], // Speak
            2: ['C', 'F']  // Show
        };
        this.currentCard = null;
        this.currentWordData = null;
        this.timer = null;
        this.timeLeft = 70;
        this.timerRunning = false;
        this.timerEnabled = true;
        this.matureContentEnabled = false;
        this.currentLanguage = 'en';
        this.matureCardsData = [];
        
        this.translations = {
            en: {
                title: 'Activity Card Game',
                settings: 'Settings',
                language: 'Language:',
                enableTimer: 'Enable Timer',
                players: 'Players',
                enterPlayerName: 'Enter player name',
                addPlayer: 'Add Player',
                startGame: 'Start Game',
                round: 'Round',
                cardsUsed: 'Cards Used',
                scores: 'Scores',
                seconds: 'seconds',
                cardNumber: 'Card #',
                category: 'Category',
                showWord: 'Click to Show Word',
                points: 'points',
                passWord: 'Pass (Get New Word)',
                solved: 'Solved',
                failed: 'Failed',
                gameOver: 'Game Over!',
                totalRounds: 'Total rounds played',
                totalCards: 'Total cards used',
                playersLabel: 'Players',
                newGame: 'New Game',
                matureContent: 'Include Mature Content (18+)',
                Draw: 'Draw',
                Speak: 'Speak',
                Show: 'Show'
            },
            hu: {
                title: 'Activity Kártyajáték',
                settings: 'Beállítások',
                language: 'Nyelv:',
                enableTimer: 'Időzítő engedélyezése',
                players: 'Játékosok',
                enterPlayerName: 'Játékos nevének megadása',
                addPlayer: 'Játékos hozzáadása',
                startGame: 'Játék indítása',
                round: 'Kör',
                cardsUsed: 'Használt kártyák',
                scores: 'Pontszámok',
                seconds: 'másodperc',
                cardNumber: 'Kártya #',
                category: 'Kategória',
                showWord: 'Kattints a szó megjelenítéséhez',
                points: 'pont',
                passWord: 'Passz (Új szó)',
                solved: 'Megoldva',
                failed: 'Nem sikerült',
                gameOver: 'Játék vége!',
                totalRounds: 'Összes játszott kör',
                totalCards: 'Összes használt kártya',
                playersLabel: 'Játékosok',
                newGame: 'Új játék',
                matureContent: 'Felnőtt tartalom (18+)',
                Draw: 'Rajzolás',
                Speak: 'Körülírás',
                Show: 'Mutogatás'
            }
        };
        
        this.initializeElements();
        this.loadSettings();
        this.loadCards();
        this.bindEvents();
        this.updateLanguage();
    }

    initializeElements() {
        // Setup screen elements
        this.setupScreen = document.getElementById('setup-screen');
        this.playersList = document.getElementById('players-list');
        this.playerNameInput = document.getElementById('player-name');
        this.addPlayerBtn = document.getElementById('add-player');
        this.startGameBtn = document.getElementById('start-game');

        // Game screen elements
        this.gameScreen = document.getElementById('game-screen');
        this.roundNumberDisplay = document.getElementById('round-number');
        this.cardsUsedDisplay = document.getElementById('cards-used');
        this.cardNumberDisplay = document.getElementById('card-number');
        this.cardCategoryDisplay = document.getElementById('card-category');
        this.cardTaskDisplay = document.getElementById('card-task');
        this.taskIconDisplay = document.getElementById('task-icon');
        this.taskTextDisplay = document.getElementById('task-text');
        this.cardWordDisplay = document.getElementById('card-word');
        this.cardPointsDisplay = document.getElementById('card-points');
        this.timerDisplay = document.getElementById('timer');
        this.showWordBtn = document.getElementById('show-word-btn');
        this.scoresListDisplay = document.getElementById('scores-list');
        this.passWordBtn = document.getElementById('pass-word');
        this.solvedBtn = document.getElementById('solved-btn');
        this.failedBtn = document.getElementById('failed-btn');
        this.wordHideTimer = null;

        // End screen elements
        this.endScreen = document.getElementById('end-screen');
        this.finalRoundsDisplay = document.getElementById('final-rounds');
        this.finalCardsUsedDisplay = document.getElementById('final-cards-used');
        this.finalPlayersDisplay = document.getElementById('final-players');
        this.newGameBtn = document.getElementById('new-game');
    }

    async loadCards() {
        try {
            const response = await fetch('original_cards.json');
            this.cardsData = await response.json();
            console.log(`Loaded ${this.cardsData.length} cards`);
        } catch (error) {
            console.error('Error loading cards:', error);
            this.showError('Failed to load card data. Please refresh the page.');
        }
    }

    bindEvents() {
        // Setup screen events
        this.addPlayerBtn.addEventListener('click', () => this.addPlayer());
        this.playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPlayer();
        });
        this.startGameBtn.addEventListener('click', () => this.startGame());

        // Game screen events
        this.showWordBtn.addEventListener('click', () => this.showWord());
        this.passWordBtn.addEventListener('click', () => this.passWord());
        this.solvedBtn.addEventListener('click', () => this.wordSolved());
        this.failedBtn.addEventListener('click', () => this.wordFailed());

        // End screen events
        this.newGameBtn.addEventListener('click', () => this.newGame());
        
        // Settings events
        document.getElementById('language-select').addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
            this.updateLanguage();
            this.saveSettings();
        });
        
        document.getElementById('timer-enabled').addEventListener('change', (e) => {
            this.timerEnabled = e.target.checked;
            this.updateTimerVisibility();
            this.saveSettings();
        });
        
        document.getElementById('mature-content').addEventListener('change', (e) => {
            this.matureContentEnabled = e.target.checked;
            this.loadMatureCards();
            this.saveSettings();
        });
    }

    loadSettings() {
        const savedLanguage = localStorage.getItem('activityGame_language');
        const savedTimerEnabled = localStorage.getItem('activityGame_timerEnabled');
        
        if (savedLanguage) {
            this.currentLanguage = savedLanguage;
            document.getElementById('language-select').value = savedLanguage;
        }
        
        if (savedTimerEnabled !== null) {
            this.timerEnabled = savedTimerEnabled === 'true';
            document.getElementById('timer-enabled').checked = this.timerEnabled;
        }
        
        const savedMatureContent = localStorage.getItem('activityGame_matureContent');
        if (savedMatureContent !== null) {
            this.matureContentEnabled = savedMatureContent === 'true';
            document.getElementById('mature-content').checked = this.matureContentEnabled;
            if (this.matureContentEnabled) {
                this.loadMatureCards();
            }
        }
    }

    saveSettings() {
        localStorage.setItem('activityGame_language', this.currentLanguage);
        localStorage.setItem('activityGame_timerEnabled', this.timerEnabled.toString());
        localStorage.setItem('activityGame_matureContent', this.matureContentEnabled.toString());
    }

    async loadMatureCards() {
        if (this.matureContentEnabled) {
            try {
                const response = await fetch('mature_cards.json');
                this.matureCardsData = await response.json();
                console.log(`Loaded ${this.matureCardsData.length} mature cards`);
                this.updateCardPool();
            } catch (error) {
                console.error('Error loading mature cards:', error);
                this.showError('Failed to load mature content. Please check if the file exists.');
            }
        } else {
            this.matureCardsData = [];
            this.updateCardPool();
        }
    }

    updateCardPool() {
        // Combine original cards with mature cards if enabled
        if (this.matureContentEnabled && this.matureCardsData.length > 0) {
            this.cardsData = [...this.cardsData.filter(card => card.cardnumber < 900), ...this.matureCardsData];
        } else {
            // Filter out mature cards (900+) if disabled
            this.cardsData = this.cardsData.filter(card => card.cardnumber < 900);
        }
        console.log(`Total cards available: ${this.cardsData.length}`);
    }

    updateLanguage() {
        const texts = this.translations[this.currentLanguage];
        
        // Update all elements with data-text attributes
        document.querySelectorAll('[data-text]').forEach(element => {
            const key = element.getAttribute('data-text');
            if (texts[key]) {
                element.textContent = texts[key];
            }
        });
        
        // Update placeholders
        document.querySelectorAll('[data-placeholder]').forEach(element => {
            const key = element.getAttribute('data-placeholder');
            if (texts[key]) {
                element.placeholder = texts[key];
            }
        });
        
        // Update task text in current game if playing
        if (this.currentWordData) {
            this.taskTextDisplay.textContent = texts[this.currentWordData.task] || this.currentWordData.task;
        }
        
        // Update document language
        document.documentElement.lang = this.currentLanguage;
    }

    updateTimerVisibility() {
        const timerDisplay = document.querySelector('.timer-display');
        if (timerDisplay) {
            timerDisplay.style.display = this.timerEnabled ? 'block' : 'none';
        }
    }

    addPlayer() {
        const name = this.playerNameInput.value.trim();
        
        if (!name) {
            this.showError('Please enter a player name');
            return;
        }

        if (this.players.find(player => player.name.toLowerCase() === name.toLowerCase())) {
            this.showError('Player name already exists');
            return;
        }

        if (this.players.length >= 8) {
            this.showError('Maximum 8 players allowed');
            return;
        }

        const player = {
            id: Date.now(),
            name: name,
            score: 0,
            taskIndex: 0 // 0 = draw, 1 = speak, 2 = show
        };

        this.players.push(player);
        this.playerNameInput.value = '';
        this.updatePlayersList();
        this.updateStartButton();
        this.clearError();
    }

    removePlayer(playerId) {
        this.players = this.players.filter(player => player.id !== playerId);
        this.updatePlayersList();
        this.updateStartButton();
    }

    updatePlayersList() {
        this.playersList.innerHTML = '';
        
        this.players.forEach(player => {
            const playerItem = document.createElement('div');
            playerItem.className = 'player-item';
            playerItem.innerHTML = `
                <span class="player-name">${this.escapeHtml(player.name)}</span>
                <button class="remove-player" onclick="game.removePlayer(${player.id})">×</button>
            `;
            this.playersList.appendChild(playerItem);
        });
    }

    updateStartButton() {
        this.startGameBtn.disabled = this.players.length < 2;
    }

    startGame() {
        if (this.players.length < 2) {
            this.showError('At least 2 players are required');
            return;
        }

        if (this.cardsData.length === 0) {
            this.showError('Card data not loaded yet. Please wait and try again.');
            return;
        }

        this.currentPlayerIndex = 0;
        this.usedCards.clear();
        this.roundNumber = 1;
        
        this.showScreen('game-screen');
        this.displayCurrentCard();
        this.updateGameDisplay();
    }

    getRandomCard() {
        // Filter out used cards
        const availableCards = this.cardsData.filter(card => 
            !this.usedCards.has(card.cardnumber)
        );

        if (availableCards.length === 0) {
            this.showError('All cards have been used!');
            this.endGame();
            return null;
        }

        // Select random card
        const randomIndex = Math.floor(Math.random() * availableCards.length);
        const selectedCard = availableCards[randomIndex];

        // Mark card as used
        this.usedCards.add(selectedCard.cardnumber);

        return selectedCard;
    }

    getRandomWordFromCard(card) {
        // Get categories for current player's task
        const currentPlayer = this.players[this.currentPlayerIndex];
        const taskCategories = this.taskCategories[currentPlayer.taskIndex];
        
        // Select random category from the appropriate task categories
        const randomCategory = taskCategories[Math.floor(Math.random() * taskCategories.length)];
        const wordString = card[randomCategory];

        // Extract points from word string (e.g., "zászlólobogtatás (5)" -> word: "zászlólobogtatás", points: 5)
        const pointsMatch = wordString.match(/\((\d+)\)$/);
        const points = pointsMatch ? parseInt(pointsMatch[1]) : 1; // Default to 1 point if no points specified
        const word = wordString.replace(/\s*\(\d+\)$/, ''); // Remove the points part from display

        return {
            category: randomCategory,
            word: word,
            points: points,
            cardNumber: card.cardnumber,
            task: this.tasks[currentPlayer.taskIndex]
        };
    }

    displayCurrentCard() {
        const card = this.getRandomCard();
        if (!card) return;

        const wordData = this.getRandomWordFromCard(card);
        this.currentCard = card;
        this.currentWordData = wordData;

        const currentPlayer = this.players[this.currentPlayerIndex];
        const taskIndex = currentPlayer.taskIndex;

        this.cardNumberDisplay.textContent = wordData.cardNumber;
        this.cardCategoryDisplay.textContent = wordData.category;
        this.taskIconDisplay.textContent = this.taskIcons[taskIndex];
        
        // Use translated task text
        const texts = this.translations[this.currentLanguage];
        this.taskTextDisplay.textContent = texts[wordData.task] || wordData.task;
        
        this.cardWordDisplay.textContent = wordData.word;
        this.cardPointsDisplay.textContent = wordData.points;
    }

    updateGameDisplay() {
        this.roundNumberDisplay.textContent = this.roundNumber;
        this.cardsUsedDisplay.textContent = this.usedCards.size;
        this.updateScoreboard();
        this.hideWord();
    }

    updateScoreboard() {
        this.scoresListDisplay.innerHTML = '';
        
        this.players.forEach((player, index) => {
            const scoreItem = document.createElement('div');
            scoreItem.className = 'score-item';
            if (index === this.currentPlayerIndex) {
                scoreItem.classList.add('current');
            }
            
            // Create task indicators (three dots)
            const taskIndicators = this.tasks.map((task, taskIndex) => {
                const isActive = taskIndex === player.taskIndex;
                return `<span class="task-dot ${isActive ? 'active' : ''}" title="${task}"></span>`;
            }).join('');
            
            scoreItem.innerHTML = `
                <span class="score-name">${this.escapeHtml(player.name)}</span>
                <div class="task-indicators">${taskIndicators}</div>
                <span class="score-points">${player.score} pts</span>
            `;
            
            this.scoresListDisplay.appendChild(scoreItem);
        });
    }

    showWord() {
        this.showWordBtn.style.display = 'none';
        this.cardWordDisplay.classList.remove('hidden');
        
        // Enable action buttons when word is shown
        this.passWordBtn.disabled = false;
        this.solvedBtn.disabled = false;
        this.failedBtn.disabled = false;
        
        // Start the timer only if it's not already running
        if (!this.timerRunning) {
            this.startTimer();
        }
        
        // Auto-hide word after 10 seconds
        this.startWordHideTimer();
    }

    hideWord() {
        this.showWordBtn.style.display = 'block';
        this.cardWordDisplay.classList.add('hidden');
        
        // Disable action buttons until word is shown
        this.passWordBtn.disabled = true;
        this.solvedBtn.disabled = true;
        this.failedBtn.disabled = true;
        
        // Clear word hide timer
        this.clearWordHideTimer();
    }

    startWordHideTimer() {
        this.clearWordHideTimer();
        this.wordHideTimer = setTimeout(() => {
            if (!this.cardWordDisplay.classList.contains('hidden')) {
                this.cardWordDisplay.classList.add('hidden');
                this.showWordBtn.style.display = 'block';
            }
        }, 10000); // Hide after 10 seconds
    }

    clearWordHideTimer() {
        if (this.wordHideTimer) {
            clearTimeout(this.wordHideTimer);
            this.wordHideTimer = null;
        }
    }

    passWord() {
        // Stop and reset timer
        this.stopTimer();
        
        // Get a new word without changing player or scoring
        if (!this.currentCard) return;
        
        // Remove the current card from used cards so we can get a new one
        this.usedCards.delete(this.currentCard.cardnumber);
        
        // Get a new card
        this.displayCurrentCard();
        this.updateGameDisplay();
    }

    wordSolved() {
        // Stop and reset timer
        this.stopTimer();
        
        // Award points to current player based on the word's point value
        if (this.currentWordData && this.currentWordData.points) {
            this.players[this.currentPlayerIndex].score += this.currentWordData.points;
        } else {
            // Fallback to 1 point if no point data available
            this.players[this.currentPlayerIndex].score += 1;
        }
        
        // Advance current player's task (only when solved, not failed)
        this.players[this.currentPlayerIndex].taskIndex = (this.players[this.currentPlayerIndex].taskIndex + 1) % 3;
        
        // Move to next player
        this.nextPlayer();
    }

    wordFailed() {
        // Stop and reset timer
        this.stopTimer();
        
        // No points awarded, just move to next player
        this.nextPlayer();
    }

    nextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        
        // If we've gone through all players, increment round
        if (this.currentPlayerIndex === 0) {
            this.roundNumber++;
        }

        this.displayCurrentCard();
        this.updateGameDisplay();
    }

    endGame() {
        this.stopTimer(); // Stop timer when game ends
        
        this.finalRoundsDisplay.textContent = this.roundNumber;
        this.finalCardsUsedDisplay.textContent = this.usedCards.size;
        this.finalPlayersDisplay.textContent = this.players.map(p => p.name).join(', ');
        
        this.showScreen('end-screen');
    }

    newGame() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.usedCards.clear();
        this.roundNumber = 1;
        
        this.updatePlayersList();
        this.updateStartButton();
        this.playerNameInput.value = '';
        this.clearError();
        
        this.showScreen('setup-screen');
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        document.getElementById(screenId).classList.add('active');
    }

    showError(message) {
        this.clearError();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // Insert error message at the top of the current active screen
        const activeScreen = document.querySelector('.screen.active');
        activeScreen.insertBefore(errorDiv, activeScreen.firstChild);
        
        // Auto-remove error after 5 seconds
        setTimeout(() => this.clearError(), 5000);
    }

    clearError() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
    }

    startTimer() {
        if (!this.timerEnabled) return; // Don't start timer if disabled
        
        this.stopTimer(); // Clear any existing timer
        this.timeLeft = 70;
        this.timerRunning = true;
        this.updateTimerDisplay();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.timerRunning = false;
        this.resetTimerDisplay();
    }

    updateTimerDisplay() {
        const span = this.timerDisplay.querySelector('span');
        span.textContent = this.timeLeft;
        
        // Calculate progress for circular timer (from 70 to 0 seconds)
        const progress = ((70 - this.timeLeft) / 70) * 360;
        this.timerDisplay.style.setProperty('--progress', `${progress}deg`);
        
        // Remove existing classes
        this.timerDisplay.classList.remove('warning', 'danger');
        
        // Add warning/danger classes based on time left
        if (this.timeLeft <= 10) {
            this.timerDisplay.classList.add('danger');
        } else if (this.timeLeft <= 20) {
            this.timerDisplay.classList.add('warning');
        }
    }

    resetTimerDisplay() {
        const span = this.timerDisplay.querySelector('span');
        span.textContent = '70';
        this.timerDisplay.style.setProperty('--progress', '0deg');
        this.timerDisplay.classList.remove('warning', 'danger');
    }

    timeUp() {
        this.stopTimer();
        this.playTimeUpSound();
        this.blinkBackground();
    }

    playTimeUpSound() {
        // Play 3 chimes using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Play 3 chimes with 0.3 second intervals
            for (let i = 0; i < 3; i++) {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime + (i * 0.3));
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime + (i * 0.3));
                gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + (i * 0.3) + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + (i * 0.3) + 0.4);
                
                oscillator.start(audioContext.currentTime + (i * 0.3));
                oscillator.stop(audioContext.currentTime + (i * 0.3) + 0.4);
            }
        } catch (error) {
            console.log('Audio not supported');
        }
    }

    blinkBackground() {
        const container = document.querySelector('.container');
        container.classList.add('time-up');
        
        // Remove the class after animation completes (3 blinks × 0.5s = 1.5s)
        setTimeout(() => {
            container.classList.remove('time-up');
        }, 1500);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the game when the page loads
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new ActivityGame();
});
