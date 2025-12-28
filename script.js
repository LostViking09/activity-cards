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
        this.matureContentProbability = 20;
        this.usedMatureWords = new Set();
        this.darkModeEnabled = false;
        this.currentLanguage = 'hu';
        this.matureCardsData = [];
        this.wakeLock = null;
        
        this.translations = {
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
                matureFrequency: 'Felnőtt szavak gyakorisága:',
                darkMode: 'Sötét mód',
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
        document.getElementById('timer-enabled').addEventListener('change', (e) => {
            this.timerEnabled = e.target.checked;
            this.updateTimerVisibility();
            this.saveSettings();
        });
        
        document.getElementById('mature-content').addEventListener('change', (e) => {
            this.matureContentEnabled = e.target.checked;
            this.updateMatureFrequencyVisibility();
            this.loadMatureCards();
            this.saveSettings();
        });
        
        document.getElementById('mature-frequency').addEventListener('input', (e) => {
            this.matureContentProbability = parseInt(e.target.value);
            document.getElementById('mature-frequency-value').textContent = `${e.target.value}%`;
            this.saveSettings();
        });
        
        document.getElementById('dark-mode').addEventListener('change', (e) => {
            this.darkModeEnabled = e.target.checked;
            this.updateDarkMode();
            this.saveSettings();
        });
    }

    loadSettings() {
        const savedTimerEnabled = localStorage.getItem('activityGame_timerEnabled');
        
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
        
        const savedMatureFrequency = localStorage.getItem('activityGame_matureFrequency');
        if (savedMatureFrequency !== null) {
            this.matureContentProbability = parseInt(savedMatureFrequency);
            document.getElementById('mature-frequency').value = savedMatureFrequency;
            document.getElementById('mature-frequency-value').textContent = `${savedMatureFrequency}%`;
        }
        
        this.updateMatureFrequencyVisibility();
        
        const savedDarkMode = localStorage.getItem('activityGame_darkMode');
        if (savedDarkMode !== null) {
            this.darkModeEnabled = savedDarkMode === 'true';
            document.getElementById('dark-mode').checked = this.darkModeEnabled;
            this.updateDarkMode();
        }
    }

    saveSettings() {
        localStorage.setItem('activityGame_language', this.currentLanguage);
        localStorage.setItem('activityGame_timerEnabled', this.timerEnabled.toString());
        localStorage.setItem('activityGame_matureContent', this.matureContentEnabled.toString());
        localStorage.setItem('activityGame_matureFrequency', this.matureContentProbability.toString());
        localStorage.setItem('activityGame_darkMode', this.darkModeEnabled.toString());
    }

    updateMatureFrequencyVisibility() {
        const frequencyContainer = document.getElementById('mature-frequency-container');
        if (frequencyContainer) {
            frequencyContainer.style.display = this.matureContentEnabled ? 'block' : 'none';
        }
    }

    async loadMatureCards() {
        if (this.matureContentEnabled) {
            try {
                const response = await fetch('mature_cards.json');
                this.matureCardsData = await response.json();
                console.log(`Loaded ${this.matureCardsData.length} mature words`);
            } catch (error) {
                console.error('Error loading mature cards:', error);
                this.showError('Failed to load mature content. Please check if the file exists.');
            }
        } else {
            this.matureCardsData = [];
        }
    }

    shouldUseMatureWord() {
        // Decide if we should use a mature word based on probability
        if (!this.matureContentEnabled || this.matureCardsData.length === 0) {
            return false;
        }
        return (Math.random() * 100) < this.matureContentProbability;
    }

    getRandomMatureWord() {
        // Filter out used mature words
        const availableWords = this.matureCardsData.filter(wordString => 
            !this.usedMatureWords.has(wordString)
        );

        if (availableWords.length === 0) {
            // If all mature words used, fallback to normal card
            console.log('All mature words used, falling back to normal card');
            return null;
        }

        // Random selection
        const randomIndex = Math.floor(Math.random() * availableWords.length);
        const wordString = availableWords[randomIndex];

        // Parse: "orgazmus (3)" → word: "orgazmus", points: 3
        const pointsMatch = wordString.match(/\((\d+)\)$/);
        const points = pointsMatch ? parseInt(pointsMatch[1]) : 1;
        const word = wordString.replace(/\s*\(\d+\)$/, '');

        // Mark as used
        this.usedMatureWords.add(wordString);

        // Get current player's task (NOT random!)
        const currentPlayer = this.players[this.currentPlayerIndex];
        const task = this.tasks[currentPlayer.taskIndex];

        return {
            category: '★',  // Mature word indicator
            word: word,
            points: points,
            cardNumber: '★',
            task: task,
            isMature: true
        };
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

    updateDarkMode() {
        if (this.darkModeEnabled) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
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
        this.usedMatureWords.clear();
        this.roundNumber = 1;
        
        // Request wake lock to keep screen on during game
        this.requestWakeLock();
        
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
        let wordData = null;
        
        // Check if we should use a mature word
        if (this.shouldUseMatureWord()) {
            wordData = this.getRandomMatureWord();
        }
        
        // If no mature word (probability didn't trigger or all used), use normal card
        if (!wordData) {
            const card = this.getRandomCard();
            if (!card) return;
            
            wordData = this.getRandomWordFromCard(card);
            this.currentCard = card;
        } else {
            // For mature words, we don't have a card object
            this.currentCard = null;
        }
        
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
        }, 5000); // Hide after 5 seconds
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
        
        // Release wake lock when game ends
        this.releaseWakeLock();
        
        this.finalRoundsDisplay.textContent = this.roundNumber;
        this.finalCardsUsedDisplay.textContent = this.usedCards.size;
        this.finalPlayersDisplay.textContent = this.players.map(p => p.name).join(', ');
        
        this.showScreen('end-screen');
    }

    newGame() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.usedCards.clear();
        this.usedMatureWords.clear();
        this.roundNumber = 1;
        
        // Release wake lock when returning to setup
        this.releaseWakeLock();
        
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
        // Start sound and visual blinking simultaneously
        this.playTimeUpSound();
        this.blinkBackground();
    }

    playTimeUpSound() {
        // Play 3 loud chimes using Web Audio API
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
                gainNode.gain.linearRampToValueAtTime(0.8, audioContext.currentTime + (i * 0.3) + 0.05);
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

    async requestWakeLock() {
        try {
            if ('wakeLock' in navigator) {
                this.wakeLock = await navigator.wakeLock.request('screen');
                console.log('Wake Lock aktív: a képernyő ébren marad');
                
                // Handle wake lock release (e.g., when tab becomes hidden)
                this.wakeLock.addEventListener('release', () => {
                    console.log('Wake Lock felszabadult');
                });
            } else {
                console.log('Wake Lock API nem támogatott ebben a böngészőben');
            }
        } catch (err) {
            console.error(`Wake Lock hiba: ${err.name}, ${err.message}`);
        }
    }

    async releaseWakeLock() {
        if (this.wakeLock !== null) {
            try {
                await this.wakeLock.release();
                this.wakeLock = null;
                console.log('Wake Lock manuálisan felszabadítva');
            } catch (err) {
                console.error(`Wake Lock felszabadítási hiba: ${err.message}`);
            }
        }
    }
}

// Initialize the game when the page loads
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new ActivityGame();
});
