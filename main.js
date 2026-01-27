const numbersContainer = document.querySelector('.numbers-container');
const generateBtn = document.getElementById('generate-btn');
const themeSwitch = document.getElementById('checkbox');

function generateNumbers() {
    const numbers = [];
    while (numbers.length < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        if (!numbers.includes(randomNumber)) {
            numbers.push(randomNumber);
        }
    }
    numbers.sort((a, b) => a - b);
    displayNumbers(numbers);
}

function displayNumbers(numbers) {
    numbersContainer.innerHTML = '';
    for (const number of numbers) {
        const numberDiv = document.createElement('div');
        numberDiv.classList.add('number');
        numberDiv.textContent = number;
        numbersContainer.appendChild(numberDiv);
    }
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
