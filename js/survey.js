// Multistep Form Logic for Discovery Form
let currentStep = 1;
const totalSteps = 6;

function updateProgressBar() {
    const progressPercent = Math.round((currentStep / totalSteps) * 100);
    const progressBar = document.getElementById('progress-bar');
    const stepCounter = document.getElementById('step-counter');
    
    if (progressBar) progressBar.style.width = `${progressPercent}%`;
    if (stepCounter) stepCounter.innerText = `${currentStep} de ${totalSteps}`;
}

function showStep(stepNumber) {
    for (let i = 1; i <= totalSteps; i++) {
        const pane = document.getElementById(`step-${i}`);
        if (pane) {
            if (i === stepNumber) {
                pane.classList.remove('hidden');
            } else {
                pane.classList.add('hidden');
            }
        }
    }
    currentStep = stepNumber;
    updateProgressBar();
    clearValidationError();
    
    const section = document.getElementById('discovery-form-section');
    if (section) {
        window.scrollTo({ top: section.offsetTop - 50, behavior: 'smooth' });
    }
}

// Exibe mensagem de erro na interface e destaca os elementos inválidos
function showValidationError(message, targetElement, groupElement) {
    const banner = document.getElementById('form-error-banner');
    const messageEl = document.getElementById('form-error-message');
    
    if (banner && messageEl) {
        messageEl.textContent = message;
        banner.classList.remove('hidden');
        banner.classList.remove('animate-shake');
        void banner.offsetWidth; // Força reflow para reiniciar animação de shake
        banner.classList.add('animate-shake');
    }

    clearFieldErrors();

    const highlightEl = groupElement || targetElement;
    if (highlightEl) {
        highlightEl.classList.add('field-error', 'animate-shake');
        highlightEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (banner) {
        banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (targetElement && typeof targetElement.focus === 'function') {
        targetElement.focus();
    }

    //alert(message);
}

function clearValidationError() {
    const banner = document.getElementById('form-error-banner');
    if (banner) {
        banner.classList.add('hidden');
    }
    clearFieldErrors();
}

function clearFieldErrors() {
    document.querySelectorAll('.field-error').forEach(el => {
        el.classList.remove('field-error', 'animate-shake');
    });
}

// Validação de formato de e-mail RFC-5322 compatível
function isEmailValid(email) {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return emailRegex.test(email.trim());
}

// Verifica se o usuário demonstrou interesse em Beta ou Entrevista
function shouldRequireEmail() {
    const wantsBetaSelect = document.getElementById('wants-beta-select') || document.querySelector('select[name="wants_beta"]');
    const wantsInterviewSelect = document.getElementById('wants-interview-select') || document.querySelector('select[name="wants_interview"]');

    const wantsBeta = wantsBetaSelect ? wantsBetaSelect.value : '';
    const wantsInterview = wantsInterviewSelect ? wantsInterviewSelect.value : '';

    const interestedInBeta = wantsBeta === 'Sim, quero participar' || wantsBeta === 'Talvez';
    const interestedInInterview = wantsInterview === 'Sim' || wantsInterview === 'Talvez';

    return interestedInBeta || interestedInInterview;
}

// Atualiza dinamicamente os indicadores de e-mail obrigatório vs opcional
function updateEmailRequirementUI() {
    const requiredBadge = document.getElementById('email-required-badge');
    const statusText = document.getElementById('email-status-text');
    const helper = document.getElementById('email-helper');
    const emailInput = document.getElementById('email-input');

    const required = shouldRequireEmail();
    if (required) {
        if (requiredBadge) requiredBadge.classList.remove('hidden');
        if (statusText) {
            statusText.innerText = 'Obrigatório';
            statusText.className = 'text-xs text-pink-400 font-medium';
        }
        if (helper) {
            helper.innerText = 'Informe seu e-mail para receber o acesso antecipado ao Beta ou agendarmos a conversa.';
            helper.className = 'text-xs text-neutral-400 mt-1.5 transition';
        }
        if (emailInput) {
            emailInput.setAttribute('placeholder', 'seu.email@exemplo.com');
        }
    } else {
        if (requiredBadge) requiredBadge.classList.add('hidden');
        if (statusText) {
            statusText.innerText = 'Opcional';
            statusText.className = 'text-xs text-neutral-500 font-medium';
        }
        if (helper) {
            helper.innerText = 'Como você indicou que não tem interesse no Beta ou entrevista no momento, o e-mail é opcional.';
            helper.className = 'text-xs text-neutral-500 mt-1.5 transition';
        }
        if (emailInput) {
            emailInput.setAttribute('placeholder', 'seu.email@exemplo.com (opcional)');
        }
    }
}

// Valida as respostas do passo atual antes de permitir avançar
function validateCurrentStep(step) {
    const currentPane = document.getElementById(`step-${step}`);
    if (!currentPane) return true;

    // STEP 1: SOBRE VOCÊ
    if (step === 1) {
        // Q1: Nome
        const nameInput = document.getElementById('name-input') || currentPane.querySelector('input[name="name"]');
        if (!nameInput || !nameInput.value.trim()) {
            showValidationError('Por favor, informe seu nome ou como podemos chamar você.', nameInput, nameInput);
            return false;
        }

        // Q2: Perfil (Radio boxes)
        const profileRadios = currentPane.querySelectorAll('input[name="profile_type"]');
        const isProfileChecked = Array.from(profileRadios).some(r => r.checked);
        if (!isProfileChecked) {
            const profileGrid = document.getElementById('profile-type-grid') || document.getElementById('q2-group');
            showValidationError('Por favor, selecione qual opção descreve melhor seu perfil.', profileRadios[0], profileGrid);
            return false;
        }

        // Q3: Quantos creators gerencia (Condicional se for Agência ou Manager)
        const selectedProfile = currentPane.querySelector('input[name="profile_type"]:checked')?.value || '';
        if (selectedProfile.includes('Agência') || selectedProfile.includes('Manager')) {
            const creatorsSelect = document.getElementById('creators-managed-select') || currentPane.querySelector('select[name="creators_managed"]');
            if (creatorsSelect && !creatorsSelect.value.trim()) {
                showValidationError('Por favor, selecione quantos creators você ou sua equipe gerencia.', creatorsSelect, creatorsSelect);
                return false;
            }
        }

        // Q4: Vídeos longos por mês (Radio boxes)
        const monthlyVideosRadios = currentPane.querySelectorAll('input[name="monthly_videos"]');
        const isMonthlyChecked = Array.from(monthlyVideosRadios).some(r => r.checked);
        if (!isMonthlyChecked) {
            const monthlyGrid = document.getElementById('monthly-videos-grid') || document.getElementById('q4-group');
            showValidationError('Por favor, selecione quantos vídeos longos produz aproximadamente por mês.', monthlyVideosRadios[0], monthlyGrid);
            return false;
        }
    }

    // STEP 2: WORKFLOW ATUAL
    if (step === 2) {
        // Q5: Workflow Tools (Checkboxes)
        const workflowCheckboxes = currentPane.querySelectorAll('input[name="workflow_tools"]:checked');
        if (workflowCheckboxes.length === 0) {
            const workflowGrid = document.getElementById('workflow-tools-grid') || document.getElementById('q5-group');
            showValidationError('Por favor, marque pelo menos uma opção no item 5 (como você produz seus conteúdos hoje).', null, workflowGrid);
            return false;
        }

        // Q6: Horas gastas por semana
        const hoursSelect = currentPane.querySelector('select[name="hours_spent"]');
        if (hoursSelect && !hoursSelect.value.trim()) {
            showValidationError('Por favor, selecione a média de horas gastas por semana.', hoursSelect, hoursSelect);
            return false;
        }
    }

    // STEP 3: O QUE AUTOMATIZAR
    if (step === 3) {
        // Q8: Automação desejada
        const desiredAutomationSelect = currentPane.querySelector('select[name="desired_automation"]');
        if (desiredAutomationSelect && !desiredAutomationSelect.value.trim()) {
            showValidationError('Por favor, selecione qual etapa gostaria de automatizar.', desiredAutomationSelect, desiredAutomationSelect);
            return false;
        }

        // Q9: Modelo de automação (Radio boxes)
        const automationRadios = currentPane.querySelectorAll('input[name="automation_model"]');
        const isAutomationChecked = Array.from(automationRadios).some(r => r.checked);
        if (!isAutomationChecked) {
            const automationGrid = document.getElementById('automation-model-grid') || document.getElementById('q9-group');
            showValidationError('Por favor, selecione o que gostaria que acontecesse após o upload (Autopilot, Review & Approve ou AI Assistant).', automationRadios[0], automationGrid);
            return false;
        }
    }

    // STEP 4: CONTROLE E CONFIANÇA
    if (step === 4) {
        // Q10: Nível de controle
        const controlSelect = currentPane.querySelector('select[name="control_level"]');
        if (controlSelect && !controlSelect.value.trim()) {
            showValidationError('Por favor, selecione o nível de controle desejado.', controlSelect, controlSelect);
            return false;
        }
    }

    // STEP 5: INVESTIMENTO ATUAL
    if (step === 5) {
        // Q12: Pagamento atual (Radio boxes Sim/Não)
        const payingRadios = currentPane.querySelectorAll('input[name="currently_paying"]');
        const isPayingChecked = Array.from(payingRadios).some(r => r.checked);
        if (!isPayingChecked) {
            const payingGrid = document.getElementById('currently-paying-grid') || document.getElementById('q12-group');
            showValidationError('Por favor, selecione se você atualmente paga por alguma ferramenta ou editor (Sim ou Não).', payingRadios[0], payingGrid);
            return false;
        }

        // Q12.1: Gasto atual (Condicional se paying === "Sim")
        const selectedPaying = currentPane.querySelector('input[name="currently_paying"]:checked')?.value || '';
        if (selectedPaying === 'Sim') {
            const currentSpendSelect = document.getElementById('current-spend-select') || currentPane.querySelector('select[name="current_spend"]');
            if (currentSpendSelect && !currentSpendSelect.value.trim()) {
                showValidationError('Por favor, selecione quanto gasta por mês atualmente.', currentSpendSelect, currentSpendSelect);
                return false;
            }
        }

        // Q13: Disposição a pagar
        const willingnessSelect = currentPane.querySelector('select[name="willingness_to_pay"]');
        if (willingnessSelect && !willingnessSelect.value.trim()) {
            showValidationError('Por favor, selecione quanto consideraria razoável pagar.', willingnessSelect, willingnessSelect);
            return false;
        }
    }

    // STEP 6: BETA & CONTATO
    if (step === 6) {
        const emailInput = document.getElementById('email-input') || currentPane.querySelector('input[name="email"]');
        const emailVal = emailInput ? emailInput.value.trim() : '';
        const emailGroup = document.getElementById('q16-group') || emailInput;

        if (shouldRequireEmail()) {
            if (!emailVal) {
                showValidationError('Como você indicou interesse em testar o Beta ou conversar com os fundadores, por favor informe seu e-mail para entrarmos em contato.', emailInput, emailGroup);
                return false;
            }
            if (!isEmailValid(emailVal)) {
                showValidationError('Por favor, informe um endereço de e-mail válido (ex: seu.email@exemplo.com).', emailInput, emailGroup);
                return false;
            }
        } else {
            // E-mail é opcional neste caso, mas se o usuário digitar algo, precisa ser válido
            if (emailVal && !isEmailValid(emailVal)) {
                showValidationError('O formato do e-mail informado é inválido. Corrija ou deixe o campo em branco.', emailInput, emailGroup);
                return false;
            }
        }
    }

    clearValidationError();
    return true;
}

// Valida todos os passos sequencialmente (do 1 ao 6) antes de permitir envio
function validateAllSteps() {
    for (let step = 1; step <= totalSteps; step++) {
        if (!validateCurrentStep(step)) {
            if (currentStep !== step) {
                showStep(step);
                validateCurrentStep(step);
            }
            return false;
        }
    }
    return true;
}

function nextStep() {
    if (!validateCurrentStep(currentStep)) {
        return;
    }

    if (currentStep < totalSteps) {
        showStep(currentStep + 1);
    }
}

function prevStep() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
}

// Escuta mudanças de campos condicionais e preferências de contato
document.addEventListener('change', function(e) {
    if (!e.target) return;
    clearFieldErrors();

    if (e.target.name === 'profile_type') {
        const agenciasField = document.getElementById('agencia-fields');
        if (agenciasField) {
            if (e.target.value.includes('Agência') || e.target.value.includes('Manager')) {
                agenciasField.classList.remove('hidden');
            } else {
                agenciasField.classList.add('hidden');
            }
        }
    }

    if (e.target.name === 'currently_paying') {
        const payingFields = document.getElementById('paying-fields');
        if (payingFields) {
            if (e.target.value === 'Sim') {
                payingFields.classList.remove('hidden');
            } else {
                payingFields.classList.add('hidden');
            }
        }
    }

    if (e.target.name === 'wants_beta' || e.target.name === 'wants_interview') {
        updateEmailRequirementUI();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    updateProgressBar();
    updateEmailRequirementUI();

    const form = document.getElementById('discovery-form');
    if (form) {
        // Prevenir envio prematuro com Enter em inputs de texto
        form.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                if (currentStep < totalSteps) {
                    nextStep();
                } else {
                    if (validateAllSteps()) {
                        form.requestSubmit();
                    }
                }
            }
        });

        // Validação final de TODOS os passos ao submeter o formulário (nativo ou HTMX)
        form.addEventListener('submit', function(e) {
            if (!validateAllSteps()) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }, true);
    }

    // Intercepta confirmação do HTMX antes de emitir a requisição
    document.body.addEventListener('htmx:confirm', function(e) {
        if (e.target && (e.target.id === 'discovery-form' || e.target.closest('#discovery-form'))) {
            if (!validateAllSteps()) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
    });

    // Feedback visual no botão de envio durante o envio do HTMX
    document.body.addEventListener('htmx:beforeRequest', function(e) {
        if (e.target && (e.target.id === 'discovery-form' || e.target.closest('#discovery-form'))) {
            const submitBtn = document.getElementById('submit-btn');
            const submitText = document.getElementById('submit-btn-text');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.classList.add('opacity-80', 'cursor-not-allowed');
                if (submitText) {
                    submitText.innerHTML = `
                        <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        Gravando respostas...
                    `;
                }
            }
        }
    });

    document.body.addEventListener('htmx:afterRequest', function(e) {
        if (e.target && (e.target.id === 'discovery-form' || e.target.closest('#discovery-form'))) {
            const submitBtn = document.getElementById('submit-btn');
            const submitText = document.getElementById('submit-btn-text');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-80', 'cursor-not-allowed');
                if (submitText) {
                    submitText.innerText = 'Enviar Respostas e Garantir Beta';
                }
            }
        }
    });

    // Permite que o HTMX renderize mensagens de erro HTML retornadas pelo servidor (400, 429, 500)
    document.body.addEventListener('htmx:beforeSwap', function(evt) {
        if (evt.detail.xhr && (evt.detail.xhr.status === 400 || evt.detail.xhr.status === 429 || evt.detail.xhr.status === 500)) {
            evt.detail.shouldSwap = true;
            evt.detail.isError = false;
        }
    });

    // Tratamento de falha de conexão de rede
    document.body.addEventListener('htmx:sendError', function() {
        const banner = document.getElementById('form-error-banner');
        const messageEl = document.getElementById('form-error-message');
        const errorMsg = 'Não foi possível conectar ao servidor.';
        if (banner && messageEl) {
            messageEl.textContent = errorMsg;
            banner.classList.remove('hidden');
        }
        alert(errorMsg);
    });

    // Limpa destaque de erros quando o usuário digita
    document.addEventListener('input', () => clearFieldErrors());
});