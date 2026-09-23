let timerId = null;

/* =====================================================
   UI ELEMENTS
   ===================================================== */

const label = document.getElementById('autoJbLabel');
const checkbox = document.getElementById('autoJbInput');
const autoJbContainer = checkbox ? checkbox.closest('.auto-jailbreak') : null;
const jeilbrekBtn = document.getElementById('jeilbrek');
const UAElement = document.getElementById('UA');
const statusElement = document.getElementById('exploit-status');
const kexForm = document.getElementById('kernel-options');
const netctrlRadio = document.getElementById('netctrl-exploit');
const lapseRadio = document.getElementById('lapse-exploit');
/* =====================================================
   STATUS
   ===================================================== */
function setExploitStatus(status) {
  if (!statusElement) {
    return;
  }
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
  if (netctrlRadio && netctrlRadio.checked) {
    return 'netctrl';
  }
  if (lapseRadio && lapseRadio.checked) {
    return 'lapse';
  }
  return 'lapse';
}

if (kexForm) {
  kexForm.addEventListener('change', function (event) {
    if (!event.target || event.target.name !== 'kernel') {
      return;
    }

    exploitChain = event.target.value;
    localStorage.setItem('exploitChain', exploitChain);
  });
}

/* Make available to main.js if needed */
window.setExploitStatus = setExploitStatus;
/* =====================================================
   AUTO JAILBREAK STORAGE
   ===================================================== */
const storedAutoJb = localStorage.getItem('autoJb');
let autoJbValue = storedAutoJb !== null ? storedAutoJb === 'true' : true;
/* =====================================================
   EXPLOIT CHAIN
   ===================================================== */
let exploitChain = localStorage.getItem('exploitChain') || 'lapse';
/* =====================================================
   USER AGENT
   ===================================================== */
/*
 * The original exploit expects #UA to exist.
 * We keep it hidden because the new UI does not
 * display the browser user-agent.
 */
if (UAElement) {
  UAElement.innerText = navigator.userAgent;
}

// Pastikan hanya exploit yang tersedia yang bisa dipilih
if (exploitChain !== 'lapse' && exploitChain !== 'netctrl') {
  exploitChain = 'lapse';
  localStorage.setItem('exploitChain', exploitChain);
}

function updateKernelUI() {
  const options = kexForm.querySelectorAll('.kernel-option');

  options.forEach(function (option) {
    const radio = option.querySelector('input[name="kernel"]');

    if (radio && radio.checked) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
}

if (kexForm) {
  kexForm.addEventListener('change', function (event) {
    if (!event.target || event.target.name !== 'kernel') {
      return;
    }

    const selected = event.target.value;

    if (selected !== 'lapse' && selected !== 'netctrl') {
      return;
    }

    exploitChain = selected;

    localStorage.setItem('exploitChain', exploitChain);

    updateKernelUI();

    console.log('Selected exploit:', exploitChain);
  });
}

// Pastikan hanya exploit yang tersedia yang bisa dipilih
if (exploitChain !== 'lapse' && exploitChain !== 'netctrl') {
  exploitChain = 'lapse';
  localStorage.setItem('exploitChain', exploitChain);
}

function updateKernelUI() {
  const options = kexForm.querySelectorAll('.kernel-option');

  options.forEach(function (option) {
    const radio = option.querySelector('input[name="kernel"]');

    if (radio && radio.checked) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
}

if (kexForm) {
  kexForm.addEventListener('change', function (event) {
    if (!event.target || event.target.name !== 'kernel') {
      return;
    }

    const selected = event.target.value;

    if (selected !== 'lapse' && selected !== 'netctrl') {
      return;
    }

    exploitChain = selected;

    localStorage.setItem('exploitChain', exploitChain);

    updateKernelUI();

    console.log('Selected exploit:', exploitChain);
  });
}

/* =====================================================
   JAILBREAK BUTTON
   ===================================================== */

if (jeilbrekBtn) {
  jeilbrekBtn.addEventListener('click', function () {
    jeilbrekBtn.disabled = true;
    stopInterval();
    setExploitStatus('running');
    /*
     * This calls the ORIGINAL exploit.
     *
     * doJb() comes from src/main.js
     */
    try {
      const result = doJb();

      /*
       * If doJb returns a Promise,
       * detect completion.
       */
      if (result && typeof result.then === 'function') {
        result.then(
          function () {
            setExploitStatus('done');
          },
          function () {
            setExploitStatus('ready');
            jeilbrekBtn.disabled = false;
          },
        );
      }
    } catch (error) {
      setExploitStatus('ready');
      jeilbrekBtn.disabled = false;
      console.error(error);
    }
  });
}

/* =====================================================
   AUTO JAILBREAK
   ===================================================== */
if (checkbox) {
  checkbox.addEventListener('change', function () {
    localStorage.setItem('autoJb', checkbox.checked);

    // Update warna teks
    updateAutoJbUI();

    if (checkbox.checked === true && jeilbrekBtn && jeilbrekBtn.disabled === false) {
      jailbreakCountdown();
      return;
    }

    stopInterval();
  });
}
function updateAutoJbUI() {
  if (!checkbox || !autoJbContainer) return;

  autoJbContainer.classList.toggle('auto-enabled', checkbox.checked);
}
/* =====================================================
   STOP COUNTDOWN
   ===================================================== */

function stopInterval() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
  if (label) {
    label.textContent = 'Auto Jailbreak';
  }
}

/* =====================================================
   AUTO JAILBREAK COUNTDOWN
   ===================================================== */

function jailbreakCountdown() {
  stopInterval();
  let countdown = 5;

  if (label) {
    label.textContent = 'Auto Jailbreaking in: ' + countdown;
  }

  timerId = setInterval(function () {
    countdown--;
    if (label) {
      label.textContent = 'Auto Jailbreaking in: ' + countdown;
    }
    if (countdown < 0) {
      if (jeilbrekBtn) {
        jeilbrekBtn.disabled = true;
      }
      clearInterval(timerId);
      timerId = null;
      if (label) {
        label.textContent = 'Executing';
      }
      setExploitStatus('running');
      try {
        const result = doJb();
        if (result && typeof result.then === 'function') {
          result.then(
            function () {
              setExploitStatus('done');
            },
            function () {
              setExploitStatus('ready');
            },
          );
        }
      } catch (error) {
        setExploitStatus('ready');
      }
    }
  }, 1000);
}

/* =====================================================
   APPLICATION CACHE
   ===================================================== */

function cacheProgress(e) {
  if (!e || !e.total) {
    return;
  }
  const percent = Math.round((e.loaded / e.total) * 100);
  document.title = 'Caching: ' + percent + '%';
}
function displayCacheProgress() {
  setTimeout(function () {
    document.title = '✓';
  }, 1000);
  setTimeout(function () {
    document.title = 'PS4 Jailbreak by Sanchezz';
  }, 3000);
}

/* =====================================================
   INITIALIZATION
   ===================================================== */
document.addEventListener('DOMContentLoaded', function () {
  // =================================================
  // RESTORE EXPLOIT SELECTION
  // =================================================

  if (exploitChain === 'netctrl') {
    netctrlRadio.checked = true;
  } else {
    lapseRadio.checked = true;
  }

  updateKernelUI();

  // =================================================
  // AUTO JAILBREAK
  // =================================================

  if (checkbox) {
    checkbox.checked = autoJbValue;
    updateAutoJbUI();
  }

  if (autoJbValue) {
    jailbreakCountdown();
  }
});
