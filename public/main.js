const container = document.querySelector('.container');
const statusTitle = document.getElementById('status-title');
const statusMessage = document.getElementById('status-message');

const adminPanelToggleButton = document.getElementById('admin-panel-toggle-btn');

// Admin Modal Elements
const adminModal = document.getElementById('admin-modal');
const modalContent = adminModal.querySelector('.modal-content');
const modalTitle = document.getElementById('modal-title');
const passwordInput = document.getElementById('password-input');
const passwordSubmit = document.getElementById('password-submit');
const passwordCancel = document.getElementById('password-cancel');
const adminControls = document.getElementById('admin-controls');
const adminCloseBtn = document.getElementById('admin-close-btn');

const openBtn = document.getElementById('open-btn');
const soldoutBtn = document.getElementById('soldout-btn');
const closedBtn = document.getElementById('closed-btn');
const checkboxModal = document.getElementById('checkbox-modal'); // Theme switch inside modal

const CORRECT_PASSWORD = '7008';
let isAuthenticated = false; // To track if admin is authenticated in current modal session

const statuses = {
    open: {
        title: '영업중',
        message: '갓 구운 붕어빵! 팥, 슈크림 있어요!',
        className: 'open'
    },
    soldout: {
        title: '재료소진',
        message: '반죽도 없고... 팥도 없고... 사장님도 집에 갔어요.',
        className: 'soldout'
    },
    closed: {
        title: '휴무',
        message: '사장님 마음대로 휴무! (아마도 낚시 갔을 듯)',
        className: 'closed'
    }
};

function setStatus(statusKey) {
    const status = statuses[statusKey];
    if (!status) return;

    statusTitle.textContent = status.title;
    statusMessage.textContent = status.message;
    
    container.classList.remove('open', 'soldout', 'closed');
    container.classList.add(status.className);
}

async function fetchStatus() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        const statusKey = Object.keys(statuses).find(key => statuses[key].title === data.status);
        if (statusKey) {
            setStatus(statusKey);
        }
    } catch (error) {
        console.error('Error fetching status:', error);
    }
}

async function updateStatus(statusKey) {
    const status = statuses[statusKey];
    if (!status) return;

    try {
        await fetch('/api/status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: status.title }),
        });
        setStatus(statusKey);
    } catch (error) {
        console.error('Error updating status:', error);
    }
}

function showAdminModal() {
    adminModal.classList.add('visible');
    passwordInput.value = ''; // Clear password input each time
    modalContent.classList.remove('shake');
    
    // Reset modal to password input view
    passwordInput.style.display = 'block';
    passwordSubmit.style.display = 'inline-block';
    passwordCancel.style.display = 'inline-block';
    adminControls.style.display = 'none';
    modalTitle.textContent = '사장님, 암호를 입력하세요';
    modalTitle.style.display = 'block';
    isAuthenticated = false;
    passwordInput.focus();

    // Sync theme switch state
    checkboxModal.checked = document.body.classList.contains('dark-mode');
}

function hideAdminModal() {
    adminModal.classList.remove('visible');
    passwordInput.value = '';
    modalContent.classList.remove('shake');
    isAuthenticated = false; // Reset authentication on close
}

function handlePasswordSubmit() {
    if (passwordInput.value === CORRECT_PASSWORD) {
        isAuthenticated = true;
        passwordInput.style.display = 'none';
        passwordSubmit.style.display = 'none';
        passwordCancel.style.display = 'none'; // Hide cancel button after successful login
        adminControls.style.display = 'block';
        modalTitle.style.display = 'none';
    } else {
        modalContent.classList.add('shake');
        passwordInput.value = ''; // Clear input on incorrect password
        setTimeout(() => {
            modalContent.classList.remove('shake');
        }, 500);
    }
}

function toggleTheme() {
    if (checkboxModal.checked) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// Event Listeners
adminPanelToggleButton.addEventListener('click', showAdminModal);

passwordSubmit.addEventListener('click', handlePasswordSubmit);
passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        handlePasswordSubmit();
    }
});
passwordCancel.addEventListener('click', hideAdminModal);
adminCloseBtn.addEventListener('click', hideAdminModal); // Close button for admin controls view

adminModal.addEventListener('click', (e) => {
    if (e.target === adminModal) {
        hideAdminModal();
    }
});

openBtn.addEventListener('click', () => {
    if (isAuthenticated) {
        updateStatus('open');
        hideAdminModal();
    }
});
soldoutBtn.addEventListener('click', () => {
    if (isAuthenticated) {
        updateStatus('soldout');
        hideAdminModal();
    }
});
closedBtn.addEventListener('click', () => {
    if (isAuthenticated) {
        updateStatus('closed');
        hideAdminModal();
    }
});

checkboxModal.addEventListener('change', toggleTheme);

// Initial status and theme sync
fetchStatus(); // Fetch initial status
setInterval(fetchStatus, 5000); // Poll for status changes every 5 seconds
toggleTheme(); // Apply initial theme based on checkbox state