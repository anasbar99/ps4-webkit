let timerId = null;
let autoStarted = false;
let exploitUiRunning = false;

const label = document.getElementById('autoJbLabel');
const checkbox = document.getElementById('autoJbInput');
const autoJbContainer = checkbox ? checkbox.closest('.auto-jailbreak') : null;
const jeilbrekBtn = document.getElementById('jeilbrek');
const UAElement = document.getElementById('UA');
const statusElement = document.getElementById('exploit-status');
const kexForm = document.getElementById('kernel-options');
const netctrlRadio = document.getElementById('netctrl-exploit');
const lapseRadio = document.getElementById('lapse-exploit');

function setExploitStatus(status) {
  if (!statusElement) return;

  statusElement.className = 'status';
  if (status === 'running') {
    statusElement.className += ' running';
    statusElement.textContent = 'BERJALAN';
  } else if (status === 'done') {
    statusElement.className += ' done';
    statusElement.textContent = 'SELESAI';
  } else {
    statusElement.className += ' ready';
    statusElement.textContent = 'ON';
  }
}

function getSelectedExploit() {
  if (netctrlRadio && netctrlRadio.checked) return 'netctrl';
  if (lapseRadio && lapseRadio.checked) return 'lapse';
  return 'lapse';
}

let exploitChain = localStorage.getItem('exploitChain') || 'lapse';

if (exploitChain !== 'lapse' && exploitChain !== 'netctrl') {
  exploitChain = 'lapse';
  localStorage.setItem('exploitChain', exploitChain);
}

if (UAElement) {
  UAElement.innerText = navigator.userAgent;
}

function updateKernelUI() {
  if (!kexForm) return;

  const options = kexForm.querySelectorAll('.kernel-option');
  options.forEach(function (option) {
    const radio = option.querySelector('input[name="kernel"]');
    option.classList.toggle('active', !!(radio && radio.checked));
  });
}

function setAutoJbEnabled(enabled) {
  if (!checkbox) return;

  checkbox.checked = enabled;
  if (autoJbContainer) {
    autoJbContainer.classList.toggle('auto-enabled', enabled);
  }
}

function stopInterval() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }

  if (label) {
    label.textContent = 'Auto Jailbreak';
  }
}

async function runJailbreak(source) {
  if (exploitUiRunning) {
    return;
  }

  exploitUiRunning = true;
  stopInterval();

  if (jeilbrekBtn) {
    jeilbrekBtn.disabled = true;
  }

  if (label && source === 'auto') {
    label.textContent = 'Executing';
  }

  setExploitStatus('running');

  try {
    const result = await doJb();

    if (result === true) {
      setExploitStatus('done');
      return;
    }

    setExploitStatus('ready');
  } catch (error) {
    console.error('Jailbreak failed:', error);

    setExploitStatus('ready');

    /*
     * A failed kernel/WebKit exploit should not immediately be retried
     * from the same page. Repeated automatic attempts can leave the
     * browser process under memory pressure.
     */
    if (source === 'auto') {
      setAutoJbEnabled(false);
      localStorage.setItem('autoJb', 'false');

      if (label) {
        label.textContent = 'Auto Jailbreak failed';
      }

      // Do not leave the manual button locked after an automatic failure.
      // The user can retry manually after the failed attempt.
      if (jeilbrekBtn) {
        jeilbrekBtn.disabled = false;
      }
    }
  } finally {
    exploitUiRunning = false;

    /*
     * Keep the manual button disabled after a failed automatic attempt.
     * Reloading the browser creates a clean WebKit context.
     */
    if (jeilbrekBtn) {
      jeilbrekBtn.disabled = false;
    }
  }
}

function jailbreakCountdown() {
  if (autoStarted || exploitUiRunning) return;

  autoStarted = true;
  stopInterval();

  let countdown = 5;

  if (label) {
    label.textContent = 'Auto Jailbreaking in: ' + countdown;
  }

  timerId = setInterval(function () {
    countdown--;

    if (countdown > 0) {
      if (label) {
        label.textContent = 'Auto Jailbreaking in: ' + countdown;
      }
      return;
    }

    stopInterval();
    if (label) {
      label.textContent = 'Executing';
    }

    runJailbreak('auto');
  }, 1000);
}

if (kexForm) {
  kexForm.addEventListener('change', function (event) {
    if (!event.target || event.target.name !== 'kernel') return;

    const selected = event.target.value;
    if (selected !== 'lapse' && selected !== 'netctrl') return;

    exploitChain = selected;
    localStorage.setItem('exploitChain', exploitChain);
    updateKernelUI();
  });
}

if (jeilbrekBtn) {
  jeilbrekBtn.addEventListener('click', function () {
    runJailbreak('manual');
  });
}

if (checkbox) {
  checkbox.addEventListener('change', function () {
    const enabled = checkbox.checked;
    localStorage.setItem('autoJb', String(enabled));
    updateAutoJbUI();

    if (enabled) {
      autoStarted = false;
      jailbreakCountdown();
    } else {
      stopInterval();
    }
  });
}

function updateAutoJbUI() {
  if (!checkbox || !autoJbContainer) return;
  autoJbContainer.classList.toggle('auto-enabled', checkbox.checked);
}

document.addEventListener('DOMContentLoaded', function () {
  if (exploitChain === 'netctrl') {
    if (netctrlRadio) netctrlRadio.checked = true;
  } else {
    if (lapseRadio) lapseRadio.checked = true;
  }

  updateKernelUI();

  /*
   * Keep the user's preference, but auto mode is one-shot per page load.
   * It is never started more than once by duplicate DOM events.
   */
  const storedAutoJb = localStorage.getItem('autoJb');
  const autoJbValue = storedAutoJb !== null ? storedAutoJb === 'true' : true;

  setAutoJbEnabled(autoJbValue);

  if (autoJbValue) {
    jailbreakCountdown();
  }
});
