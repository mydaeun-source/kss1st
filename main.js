const numbersContainer = document.querySelector('.numbers-container');
const generateBtn = document.getElementById('generate-btn');
const themeSwitch = document.getElementById('checkbox');

function generateOneSetOfNumbers() {
    const numbers = [];
    while (numbers.length < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        if (!numbers.includes(randomNumber)) {
            numbers.push(randomNumber);
        }
    }
    numbers.sort((a, b) => a - b);
    return numbers;
}

function generateNumbers() {
    const allSets = [];
    for (let i = 0; i < 5; i++) {
        allSets.push(generateOneSetOfNumbers());
    }
    displayNumbers(allSets);
}

function displayNumbers(allSets) {
    numbersContainer.innerHTML = '';
    allSets.forEach((numbers, index) => {
        const setContainer = document.createElement('div');
        setContainer.classList.add('lotto-set');
        const setTitle = document.createElement('h3');
        setTitle.textContent = `Set ${index + 1}`;
        setContainer.appendChild(setTitle);

        numbers.forEach(number => {
            const numberDiv = document.createElement('div');
            numberDiv.classList.add('number');
            numberDiv.textContent = number;
            setContainer.appendChild(numberDiv);
        });
        numbersContainer.appendChild(setContainer);
    });
}


function toggleTheme() {
    if (themeSwitch.checked) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

generateBtn.addEventListener('click', generateNumbers);
themeSwitch.addEventListener('change', toggleTheme);

// Initial generation
generateNumbers();
