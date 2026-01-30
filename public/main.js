document.addEventListener('DOMContentLoaded', () => {

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
    const checkboxModal = document.getElementById('checkbox-modal');

    const CORRECT_PASSWORD = '7008';
    let isAuthenticated = false;

    const statuses = {
        'open': {
            title: '영업중',
            message: '갓 구운 붕어빵! 팥, 슈크림 있어요!',
            className: 'open'
        },
        'soldout': {
            title: '재료소진',
            message: '반죽도 없고... 팥도 없고... 사장님도 집에 갔어요.',
            className: 'soldout'
        },
        'closed': {
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
        const statusInfo = statuses[statusKey];
        if (!statusInfo) return;

        try {
            const response = await fetch('/api/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: statusInfo.title }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            await response.json();
            setStatus(statusKey);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    }
    
    function showAdminModal() {
        adminModal.classList.add('visible');
        passwordInput.value = '';
        modalContent.classList.remove('shake');
        
        passwordInput.style.display = 'block';
        passwordSubmit.style.display = 'inline-block';
        if (passwordCancel) passwordCancel.style.display = 'inline-block';

        adminControls.style.display = 'none';
        modalTitle.style.display = 'block';
        modalTitle.textContent = '사장님, 암호를 입력하세요';
        isAuthenticated = false;
        passwordInput.focus();
    }

    function hideAdminModal() {
        adminModal.classList.remove('visible');
    }

    function handlePasswordSubmit() {
        if (passwordInput.value === CORRECT_PASSWORD) {
            isAuthenticated = true;
            passwordInput.style.display = 'none';
            passwordSubmit.style.display = 'none';
            if(passwordCancel) passwordCancel.style.display = 'none';
            
            adminControls.style.display = 'block';
            modalTitle.style.display = 'none';
        } else {
            modalContent.classList.add('shake');
            passwordInput.value = '';
            setTimeout(() => modalContent.classList.remove('shake'), 500);
        }
    }

    // Event Listeners
    adminPanelToggleButton.addEventListener('click', showAdminModal);
    passwordSubmit.addEventListener('click', handlePasswordSubmit);
    passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handlePasswordSubmit();
    });
    if(passwordCancel) passwordCancel.addEventListener('click', hideAdminModal);
    adminCloseBtn.addEventListener('click', hideAdminModal);
    adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) hideAdminModal();
    });

    document.querySelectorAll('input[name="status"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (isAuthenticated) {
                updateStatus(e.target.value);
                hideAdminModal();
            }
        });
    });

    const themeCheckbox = document.getElementById('checkbox-modal');
    if(themeCheckbox){
        themeCheckbox.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode');
        });
    }

    // Initial Load
    fetchStatus();
    setInterval(fetchStatus, 5000);
});