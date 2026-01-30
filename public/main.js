document.addEventListener('DOMContentLoaded', () => {

    const container = document.querySelector('.container');
    const statusIcon = document.getElementById('status-icon');
    const statusTitle = document.getElementById('status-title');
    const statusMessage = document.getElementById('status-message');
    const adminPanelToggleButton = document.getElementById('admin-panel-toggle-btn');

    // Admin Modal Elements
    const adminModal = document.getElementById('admin-modal');
    const modalContent = adminModal.querySelector('.modal-content');
    const modalTitle = document.getElementById('modal-title');
    const passwordSection = document.getElementById('password-section');
    const passwordInput = document.getElementById('password-input');
    const passwordSubmit = document.getElementById('password-submit');
    const passwordCancel = document.getElementById('password-cancel');
    const adminControls = document.getElementById('admin-controls');
    const adminCloseBtn = document.getElementById('admin-close-btn');

    const openBtn = document.getElementById('open-btn');
    const soldoutBtn = document.getElementById('soldout-btn');
    const closedBtn = document.getElementById('closed-btn');
    const checkboxModal = document.getElementById('checkbox-modal');

    const CORRECT_PASSWORD = '7008';
    let isAuthenticated = false;

    const statuses = {
        '영업중': {
            icon: '<i class="fas fa-door-open"></i>',
            title: '영업중',
            message: '갓 구운 붕어빵! 팥, 슈크림 있어요!',
            className: 'open'
        },
        '재료소진': {
            icon: '<i class="fas fa-exclamation-circle"></i>',
            title: '재료소진',
            message: '반죽도 없고... 팥도 없고... 사장님도 집에 갔어요.',
            className: 'soldout'
        },
        '휴무': {
            icon: '<i class="fas fa-door-closed"></i>',
            title: '휴무',
            message: '사장님 마음대로 휴무! (아마도 낚시 갔을 듯)',
            className: 'closed'
        }
    };

    function setStatus(statusKey) {
        const status = statuses[statusKey];
        if (!status) {
            console.error('Unknown status key:', statusKey);
            return;
        }

        if (statusIcon) statusIcon.innerHTML = status.icon;
        if (statusTitle) statusTitle.textContent = status.title;
        if (statusMessage) statusMessage.textContent = status.message;
        
        if(container) {
            container.classList.remove('open', 'soldout', 'closed');
            container.classList.add(status.className);
        }
    }

async function fetchStatus() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        const statusKey = Object.keys(statuses).find(key => statuses[key].title === data.status);
        if (statusKey) {
            setStatus(statusKey);
            // Update radio buttons to reflect the current status
            const radioToCheck = document.querySelector(`input[name="status"][value="${statusKey}"]`);
            if (radioToCheck) {
                radioToCheck.checked = true;
            }
        }
    } catch (error) {
        console.error('Error fetching status:', error);
    }
}

    async function updateStatus(statusKey) {
        if (!statuses[statusKey]) return;

        try {
            const response = await fetch('/api/status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: statusKey }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            await response.json();
            setStatus(statusKey); // Update UI immediately on successful POST
        } catch (error) {
            console.error('Error updating status:', error);
        }
    }
    
    function showAdminModal() {
        if(!adminModal) return;
        adminModal.classList.add('visible');
        passwordInput.value = '';
        modalContent.classList.remove('shake');
        passwordSection.style.display = 'block';
        adminControls.style.display = 'none';
        modalTitle.textContent = '사장님, 암호를 입력하세요';
        isAuthenticated = false;
        passwordInput.focus();
    }

    function hideAdminModal() {
        if(!adminModal) return;
        adminModal.classList.remove('visible');
        passwordInput.value = '';
        isAuthenticated = false;
    }

    function handlePasswordSubmit() {
        if (passwordInput.value === CORRECT_PASSWORD) {
            isAuthenticated = true;
            passwordSection.style.display = 'none';
            adminControls.style.display = 'block';
            modalTitle.textContent = '영업 상태 관리';
        } else {
            modalContent.classList.add('shake');
            passwordInput.value = '';
            setTimeout(() => {
                modalContent.classList.remove('shake');
            }, 500);
        }
    }

    function setupEventListeners() {
        if (adminPanelToggleButton) adminPanelToggleButton.addEventListener('click', showAdminModal);
        if (passwordSubmit) passwordSubmit.addEventListener('click', handlePasswordSubmit);
        if (passwordInput) passwordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handlePasswordSubmit();
        });
        if (passwordCancel) passwordCancel.addEventListener('click', hideAdminModal);
        if (adminCloseBtn) adminCloseBtn.addEventListener('click', hideAdminModal);
        if (adminModal) adminModal.addEventListener('click', (e) => {
            if (e.target === adminModal) hideAdminModal();
        });
// New event listener for radio buttons
document.querySelectorAll('input[name="status"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (isAuthenticated) {
            updateStatus(e.target.value);
            // Optional: hide modal immediately after selection
            // hideAdminModal();
        }
    });
});


        // Theme switcher logic
        const checkbox = document.getElementById('checkbox');
        const checkboxModal = document.getElementById('checkbox-modal');
        
        const applyTheme = () => {
            const isDarkMode = localStorage.getItem('darkMode') === 'true';
            document.body.classList.toggle('dark-mode', isDarkMode);
            if(checkbox) checkbox.checked = isDarkMode;
            if(checkboxModal) checkboxModal.checked = isDarkMode;
        }

        const toggleTheme = () => {
            const isDarkMode = document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', isDarkMode);
            if(checkbox) checkbox.checked = isDarkMode;
            if(checkboxModal) checkboxModal.checked = isDarkMode;
        }

        if(checkbox) checkbox.addEventListener('change', toggleTheme);
        if(checkboxModal) checkboxModal.addEventListener('change', toggleTheme);
        
        applyTheme(); // Apply theme on load
    }

    // Initial Load
    setupEventListeners();
    fetchStatus();
    setInterval(fetchStatus, 60000); // Poll for status changes every 60 seconds
});