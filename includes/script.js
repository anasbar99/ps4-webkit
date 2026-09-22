let timerId = null;

/* =====================================================
   UI ELEMENTS
   ===================================================== */

const label = document.getElementById('autoJbLabel');

const checkbox = document.getElementById('autoJbInput');

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

    statusElement.textContent = 'SIAP!!!';
  }
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

/* =====================================================
   KERNEL SELECTION
   ===================================================== */

if (kexForm) {
  kexForm.addEventListener('change', function (event) {
    if (!event.target || event.target.name !== 'kernel') {
      return;
    }

    exploitChain = event.target.value;

    localStorage.setItem('exploitChain', exploitChain);
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

    if (checkbox.checked === true && jeilbrekBtn && jeilbrekBtn.disabled === false) {
      jailbreakCountdown();

      return;
    }

    stopInterval();
  });
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
  /* Application Cache */

  if (window.applicationCache) {
    window.applicationCache.addEventListener('progress', cacheProgress, false);

    window.applicationCache.oncached = function () {
      displayCacheProgress();
    };

    window.applicationCache.onupdateready = function () {
      displayCacheProgress();
    };
  }

  /* Kernel */

  if (exploitChain === 'netctrl') {
    if (netctrlRadio) {
      netctrlRadio.checked = true;
    }
  } else {
    if (lapseRadio) {
      lapseRadio.checked = true;
    }
  }

  /* Auto jailbreak */

  if (checkbox) {
    checkbox.checked = autoJbValue;
  }

  /*
   * Preserve original behavior:
   * Auto Jailbreak is enabled by default.
   */

  if (autoJbValue) {
    jailbreakCountdown();
  }
});
