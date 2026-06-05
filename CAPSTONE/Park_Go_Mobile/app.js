const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const regFields = document.getElementById('regFields');
const confirmWrapper = document.getElementById('confirmWrapper');
const mainBtn = document.getElementById('mainBtn');

const agreeTerms = document.getElementById('agreeTerms');
const termsHint = document.getElementById('termsHint');
const openTerms = document.getElementById('openTerms');
const termsModal = document.getElementById('termsModal');
const closeTerms = document.getElementById('closeTerms');
const declineTerms = document.getElementById('declineTerms');
const acceptTerms = document.getElementById('acceptTerms');

function setButtonStateForMode() {
    const isSignUp = tabRegister.classList.contains('active');
    termsHint.style.display = isSignUp ? 'block' : 'none';

    if (isSignUp) {
        mainBtn.disabled = !agreeTerms.checked;
    } else {
        mainBtn.disabled = false;
    }
}

tabLogin.onclick = () => {
    regFields.classList.add('hidden');
    confirmWrapper.classList.add('hidden');
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    mainBtn.innerText = 'Login';
    setButtonStateForMode();
};

tabRegister.onclick = () => {
    regFields.classList.remove('hidden');
    confirmWrapper.classList.remove('hidden');
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    mainBtn.innerText = 'Create Account';
    setButtonStateForMode();
};

openTerms.addEventListener('click', (e) => {
    e.preventDefault();
    termsModal.classList.remove('hidden');
});

function closeTermsModal() {
    termsModal.classList.add('hidden');
}

closeTerms.addEventListener('click', closeTermsModal);
declineTerms.addEventListener('click', closeTermsModal);
acceptTerms.addEventListener('click', () => {
    agreeTerms.checked = true;
    setButtonStateForMode();
    closeTermsModal();
});

agreeTerms.addEventListener('change', setButtonStateForMode);

document.getElementById('authForm').onsubmit = (e) => {
    e.preventDefault();

    if (tabRegister.classList.contains('active')) {
        if (!agreeTerms.checked) {
            showNotification('Please accept the Terms and Conditions to continue.');
            return;
        }

        tabLogin.click();
        document.getElementById('password').value = '';
        document.getElementById('confirmPassword').value = '';
        showNotification('Account created! Please sign in to continue.');
    } else {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('homeScreen').classList.remove('hidden');
        document.getElementById('mainNav').classList.remove('hidden');
    }
};

function showNotification(message) {
    const existing = document.getElementById('toastMsg');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.id = 'toastMsg';
    notification.style.cssText = `
        background: #44bd32;
        color: white;
        padding: 10px 15px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 600;
        text-align: center;
        margin-top: 10px;
        box-shadow: 0 4px 15px rgba(68, 189, 50, 0.3);
    `;
    notification.textContent = message;
    document.getElementById('authForm').appendChild(notification);

    setTimeout(() => { notification.remove(); }, 3000);
}

function saveProfileChanges() {
    const editInputs = document.querySelectorAll('#editProfileOverlay .input-group input');
    const newName = editInputs[0].value;
    const newEmail = editInputs[1].value;

    const profileName = document.querySelector('.profile-header p');
    const profileEmail = document.querySelector('.profile-header p:last-child');

    if (newName.trim()) {
        profileName.textContent = newName;
        const names = newName.split(' ');
        const initials = names.map((n) => n[0]).join('').substring(0, 2).toUpperCase();
        document.querySelectorAll('.profile-avatar-lg').forEach((avatar) => {
            avatar.textContent = initials;
        });
    }

    if (newEmail.trim()) profileEmail.textContent = newEmail;

    showNotification('Profile updated successfully!');
    document.getElementById('editProfileOverlay').classList.add('hidden');
}

function saveVehicleInfo() {
    const vehicleInputs = document.querySelectorAll('#vehicleOverlay .input-group input');
    const make = vehicleInputs[0].value;
    const model = vehicleInputs[1].value;
    const plateNumber = vehicleInputs[2].value;

    if (!make.trim() || !model.trim() || !plateNumber.trim()) {
        showNotification('Please fill in all required fields!');
        return;
    }

    showNotification('Vehicle information saved successfully!');
    document.getElementById('vehicleOverlay').classList.add('hidden');
    vehicleInputs.forEach((input) => {
        input.value = '';
    });
}

function navigate(screenId, navEl) {
    document.querySelectorAll('.screen').forEach((s) => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
    navEl.classList.add('active');
}

const allSlots = document.querySelectorAll('.slot-pill:not(.occupied)');
allSlots.forEach((slot) => {
    slot.addEventListener('click', function () {
        allSlots.forEach((s) => s.classList.remove('active'));
        this.classList.add('active');
        document.getElementById('homeSlot').innerText = this.getAttribute('data-slot');
    });
});

setButtonStateForMode();
