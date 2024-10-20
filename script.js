let currentRound = 1;
let ingame = false;

difficulty.value = localStorage.getItem('difficulty') || 'medium';
let highScore = localStorage.getItem(`highscore-${difficulty.value}`);
displayGrid(difficulty.value);

let totalRound = document.getElementById('totalRound');
let totalTimer = document.getElementById('totalTimer');
let cells = document.querySelectorAll('.cell');
let selectedNumbers = [];
let userClickIndex = 0;

let roundTimer;
let timerInterval;
let timerDuration;

// Mode Switch
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    modeToggle.innerHTML = '<i class="bi bi-moon-fill"></i>';
}

modeToggle.onclick = () => {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    modeToggle.innerHTML = isDarkMode ? '<i class="bi bi-moon-fill"></i>' : '<i class="bi bi-sun"></i>';
    localStorage.setItem('darkMode', isDarkMode);
};

// About
about.onclick = () => {
    Swal.fire({
        title: 'About this game',
        text: "This is a memory game where you must memorize numeric sequences and recite them " + 
        "by clicking on the squares where they were. The game becomes progressively harder with each round.",
        icon: 'info',
        iconColor: "#0044ffcc",
        confirmButtonColor: "#3085d6",
        confirmButtonText: 'OK'
    });
};

// Select Difficulty
difficulty.onchange = () => {
    localStorage.setItem('difficulty', difficulty.value);
    if (!ingame) displayGrid(difficulty.value);
};

// Grid on Website
function displayGrid(difficulty = 'medium') {
    const gridSizes = {
        easy: 3,
        medium: 5,
        hard: 7
    };
    const gridSize = gridSizes[difficulty];

    const gameElement = document.getElementById('game');
    gameElement.innerHTML = '';
    gameElement.style.gridTemplateColumns = `repeat(${gridSize}, auto)`;

    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = i + 1;
        cell.onclick = () => handleCellClick(i, cell);
        gameElement.appendChild(cell);
    }
}

function handleCellClick(index, cell) {
    if (!cell.classList.contains('enabled') || cell.classList.contains('clicked')) return;

    if (selectedNumbers[userClickIndex] === index) {
        userClickIndex++;
        cell.style.backgroundColor = 'limegreen';
        cell.classList.add('clicked');
        if (userClickIndex === selectedNumbers.length) {
            currentRound++;
            selectedNumbers.forEach((cellIndex, i) => {
                cells[cellIndex].textContent = i + 1;
            });

            cells.forEach(cell => cell.classList.remove('enabled'));
            clearInterval(timerInterval);

            setTimeout(() => {
                startRound(currentRound);
            }, 800);
        }
    } else {
        clearInterval(timerInterval);
        cell.style.backgroundColor = 'red';
        selectedNumbers.forEach((cellIndex, i) => {
            cells[cellIndex].textContent = i + 1;
        });

        if ((currentRound - 1) > highScore) {
            highScore = currentRound - 1;
            localStorage.setItem(`highscore-${difficulty.value}`, highScore);
        }

        cells.forEach(cell => cell.classList.remove('enabled'));
        resetGame();
    }
}

// Start Game
startButton.onclick = () => {
    document.getElementById('settings').style.display = 'none';
    document.getElementById('highscore').style.display = 'none';
    highScore = localStorage.getItem(`highscore-${difficulty.value}`) === null ? 0 : parseInt(localStorage.getItem(`highscore-${difficulty.value}`));

    if (ingame) displayGrid(difficulty.value);
    startButton.textContent = 'New Game';
    ingame = true;

    if (!totalRound) {
        totalRound = document.createElement('div');
        totalRound.id = 'totalRound';
        document.querySelector('.container').insertBefore(totalRound, document.getElementById('game'));
    }

    if (!totalTimer) {
        totalTimer = document.createElement('div');
        totalTimer.id = 'totalTimer';

        progress = document.createElement('div');
        progress.id = 'progress';
        totalTimer.appendChild(progress);

        document.querySelector('.container').appendChild(totalTimer);
    }

    cells = document.querySelectorAll('.cell');
    startRound();
}

function startRound(round = 1) {
    if (round > cells.length) {
        totalRound.textContent = `Maximum reached! (${difficulty.value})`;
        highScore = cells.length;
        localStorage.setItem(`highscore-${difficulty.value}`, highScore);
        Swal.fire({
            title: 'Congrats!',
            text: 'You have reached the maximum number of rounds!',
            icon: 'success',
            confirmButtonText: 'Nice!'
        });
        resetGame();
        return;
    }
    totalRound.textContent = `Round ${currentRound} (${difficulty.value})`;
    const cellsCount = Math.sqrt(cells.length);
    const gridGap = parseInt(getComputedStyle(document.getElementById('game')).gap);
    const cellWidth = parseInt(getComputedStyle(document.querySelector('.cell')).width);
    document.getElementById('totalTimer').style.width = `${cellsCount * cellWidth + ((cellsCount - 1) * gridGap)}px`;
    progress = document.getElementById('progress');
    progress.style.width = '0';

    cells.forEach(cell => {
        cell.textContent = '';
        cell.style.backgroundColor = '';
        cell.classList.remove('clicked')
    });

    selectedNumbers = [];
    userClickIndex = 0;

    const selectedCells = [];
    for (let i = 0; i < round; i++) {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * cells.length);
        } while (selectedCells.includes(randomIndex));
        selectedCells.push(randomIndex);
    }

    selectedCells.forEach((cellIndex, i) => {
        cells[cellIndex].textContent = i + 1;
        selectedNumbers.push(cellIndex);;
    });

    setTimeout(() => {
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.add('enabled');
        });

        startTimer(round);

    }, 400 + round * 200);
}

function startTimer(round) {
    timerDuration = 800 + round * 400;
    progress = document.getElementById('progress');
    progress.style.width = '0';
    let elapsedTime = 0;

    timerInterval = setInterval(() => {
        elapsedTime += 100;

        const percentage = (elapsedTime / timerDuration) * 100;
        progress.style.width = `${percentage}%`

        if (elapsedTime >= timerDuration) {
            clearInterval(timerInterval);

            Swal.fire({
                title: 'Time\'s up!',
                text: 'You ran out of time. Try again!',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            selectedNumbers.forEach((cellIndex, i) => {
                cells[cellIndex].textContent = i + 1;
            });

            cells.forEach(cell => cell.classList.remove('enabled'));
            resetGame();
        }
    }, 100);
}

function resetGame() {
    currentRound = 1;
    userClickIndex = 0;

    document.getElementById('highscore').textContent = `High Score: ${highScore} (${difficulty.value})`;

    const settings = document.getElementById('settings');
    const highscore = document.getElementById('highscore');
    
    settings.style.display = 'block';
    highscore.style.display = 'block';
    document.querySelector('.container').appendChild(settings);
    document.querySelector('.container').appendChild(highscore);
}
