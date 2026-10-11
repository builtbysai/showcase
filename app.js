'use strict';
/* Independent selected-work exhibition.
   Project facts and case studies are extracted verbatim from the main portfolio.
   Navigation is intentionally local: no framework, motion library or scroll hijacker. */
(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const dataNode = $('#project-data');
  if (!dataNode) return;

  /** @type {Array<{id:string,title:string,type:string,stack:string,status:string,abbr:string,bg:string,ink:string,accent:string,thumb:string,hint:string}>} */
  const projects = JSON.parse(dataNode.textContent);
  const total = projects.length;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const pad = n => String(n).padStart(2, '0');
  const esc = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const indexOfId = id => projects.findIndex(p => p.id === id);
  const root = document.documentElement;
  const stage = $('#feature-stage');
  const title = $('#work-heading');
  const desc = $('#intro-desc');
  const art = $('#visual-content');
  const visualFrame = $('#visual-frame');
  const rail = $('#project-index');
  const dialog = $('#project-dialog');
  const dialogScroll = $('#dialog-scroll');
  const sourceTemplate = $('#source-case-studies');
  const controls = {
    introCount: $('#intro-count'), metaType: $('#meta-type'), metaStack: $('#meta-stack'),
    metaStatus: $('#meta-status'), progress: $('#progress-fill'), now: $('#progress-now'),
    end: $('#progress-end'), visualWord: $('#visual-word'), prev: $('#nav-prev'), next: $('#nav-next')
  };
  let selected = 0;
  let wheelLast = 0;
  let wheelSum = 0;
  let pointerStart = null;
  let ignoreClickUntil = 0;
  let openedFromGallery = false;
  let busyNavigating = false;

  const artwork = {
    craft: () => `<div class="art art-diploma"><div class="diploma-folder"><div class="diploma-paper"><span class="diploma-seal">LU</span><small>LIBERTY UNIVERSITY</small><b>Bachelor<br>of Science</b><span class="diploma-line"></span><i>Computer Science · Three.js</i></div></div></div>`,
    'proj-helpdesk': () => `<div class="art art-dashboard"><div class="dashboard-window"><div class="dashboard-side"><i></i><i></i><i></i><i></i><i></i></div><div class="dashboard-panel"><div class="dashboard-heading">Ticket performance</div><div class="dashboard-metrics"><span>620</span><span>92%</span><span>4.8h</span></div><div class="dashboard-bars"><span style="--bar-width:91%"></span><span style="--bar-width:73%"></span><span style="--bar-width:84%"></span><span style="--bar-width:49%"></span><span style="--bar-width:66%"></span></div></div></div></div>`,
    'proj-jotrelay': () => `<div class="art art-jotrelay"><div class="notepad-back"></div><div class="notepad-sheet"><b>Jot<br>Relay<span style="color:#8aaa82">.</span></b><i></i><i></i><i></i><i></i></div><div class="notepad-mark">WRITE / SHARE / SYNC</div></div>`,
    'proj-toolkit': () => `<div class="art art-terminal"><div class="terminal-window"><div class="terminal-dots"><i></i><i></i><i></i></div><div><span class="prompt">PS C:\\&gt;</span> .\\Invoke-EndpointAudit.ps1</div><div class="t-mute"># AD &amp; Endpoint Automation</div><div><span class="t-ok">✓</span> Configuration validated</div><div><span class="t-ok">✓</span> 12 devices scanned</div><div class="t-mute">WhatIf: changes not applied</div><div><span class="prompt">PS C:\\&gt;</span> _</div></div></div>`,
    'proj-winlog': () => `<div class="art art-terminal art-threat"><div class="terminal-window"><div class="terminal-dots"><i></i><i></i><i></i></div><div><span class="prompt">~/threat-hunter $</span> scan --events</div><div class="t-mute">Windows Security / Sysmon</div><div><span class="t-ok">[+] </span>9 events analyzed</div><div style="color:#f0a392">[CRITICAL] Repeated failed logons</div><div class="t-mute">MITRE ATT&amp;CK : T1110</div><div style="color:#f5d08a">[HIGH] Privilege escalation</div><div class="t-mute">MITRE ATT&amp;CK : T1078</div></div></div>`,
    'proj-ghostball': () => `<div class="art art-pool"><div class="pool-wood"><span class="pool-cue"></span><span class="pool-ball white" style="top:68%;left:24%"></span><span class="pool-ball" style="top:29%;left:64%"></span><span class="pool-ball red" style="top:35%;left:69%"></span><span class="pool-ball blue" style="top:41%;left:64%"></span><span class="pool-ball black" style="top:47%;left:69%"></span><span class="pool-ball" style="top:53%;left:64%"></span><span class="pool-ball red" style="top:41%;left:74%"></span></div></div>`
  };
  function makePreviewFallback(project) {
    if (project.id === 'proj-siem') return `<div class="cover-fallback cover-siem"><span class="cover-eyebrow">DETECTION / CORRELATION</span><h3>Incidents,<br>not alerts.</h3><div class="cover-numbers"><span><b>34</b><small>EVENTS</small></span><span><b>05</b><small>INCIDENTS</small></span></div><p>AUTH.LOG <em>→</em> CORRELATION <em>→</em> MITRE ATT&amp;CK</p></div>`;
    if (project.id === 'proj-ad-auditor') return `<div class="cover-fallback cover-auditor"><span class="cover-eyebrow">ACTIVE DIRECTORY / SECURITY</span><h3>Security<br>posture.</h3><div class="cover-numbers"><span><b>16</b><small>FINDINGS</small></span></div><p>04 CRITICAL <em>/</em> 05 HIGH <em>/</em> 07 MEDIUM</p></div>`;
    if (project.id === 'proj-phishing') return `<div class="cover-fallback cover-phishing"><span class="cover-eyebrow">EMAIL / STATIC ANALYSIS</span><h3>Critical<br>risk.</h3><div class="cover-numbers"><span><b>03</b><small>AUTHENTICATION CHECKS</small></span></div><p>SPF <em>FAIL</em> &nbsp; DKIM <em>FAIL</em> &nbsp; DMARC <em>FAIL</em></p></div>`;
    return '';
  }
  function makeArtwork(project) {
    if (project.thumb) {
      return `<div class="art art-image">${makePreviewFallback(project)}<img class="art-screen" src="${esc(project.thumb)}" alt="" loading="eager" decoding="async"></div>`;
    }
    return artwork[project.id]?.() || `<div class="art art-terminal"><div class="terminal-window"><div class="terminal-dots"><i></i><i></i><i></i></div>${esc(project.title)}</div></div>`;
  }

  function drawIndex() {
    const fragment = document.createDocumentFragment();
    projects.forEach((project, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'index-btn';
      button.dataset.tooltip = project.title;
      button.setAttribute('aria-label', `Project ${pad(i + 1)}: ${project.title}`);
      button.innerHTML = `<span class="index-indicator" aria-hidden="true"></span><span>${pad(i + 1)}</span>`;
      button.addEventListener('click', () => goTo(i, i >= selected ? 1 : -1));
      fragment.append(button);
    });
    rail.replaceChildren(fragment);
    $('#section-total').textContent = pad(total);
    controls.end.textContent = pad(total);
  }

  function goTo(index, direction = 1, animated = true) {
    const next = ((index % total) + total) % total;
    if (next === selected && stage.dataset.initialized === 'true') return;
    selected = next;
    const project = projects[next];
    root.style.setProperty('--accent', project.accent === '#285f8f' ? '#83b7eb' : project.accent);
    const formatted = pad(next + 1);
    title.textContent = project.title;
    title.classList.toggle('is-long', project.title.length > 21);
    title.classList.toggle('is-very-long', project.title.length > 29);
    desc.textContent = project.hint;
    controls.introCount.innerHTML = `${formatted} <span>/ ${pad(total)}</span>`;
    controls.metaType.textContent = project.type;
    controls.metaStack.textContent = project.stack;
    controls.metaStatus.textContent = project.status;
    controls.now.textContent = formatted;
    controls.progress.style.transform = `scaleX(${(next + 1) / total})`;
    controls.visualWord.textContent = formatted;
    visualFrame.setAttribute('aria-label', `Explore ${project.title} case study`);
    art.innerHTML = makeArtwork(project);
    // Use a meaningful text treatment if a portfolio image disappears from the origin.
    const image = $('img.art-screen', art);
    if (image) {
      const reveal = () => image.closest('.art-image')?.classList.add('is-image-loaded');
      if (image.complete && image.naturalWidth > 0) reveal();
      else image.addEventListener('load', reveal, {once:true});
      // If the original screenshot is unavailable, the authored cover remains visible.
    }
    Array.from(rail.children).forEach((button, i) => {
      const active = i === next;
      button.classList.toggle('is-active', active);
      if (active) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    if (animated && !reduceMotion.matches) {
      stage.classList.remove('motion-prev', 'motion-next');
      void stage.offsetWidth;
      stage.classList.add(direction >= 0 ? 'motion-next' : 'motion-prev');
    } else {
      stage.classList.remove('motion-prev', 'motion-next');
    }
    stage.dataset.initialized = 'true';
  }

  function next(){ goTo(selected + 1, 1); }
  function prev(){ goTo(selected - 1, -1); }
  controls.prev.addEventListener('click', prev);
  controls.next.addEventListener('click', next);
  visualFrame.addEventListener('click', () => {
    if (performance.now() < ignoreClickUntil) return;
    openDetail(selected, 'push');
  });
  // Wheel browsing happens only on the gallery surface, never inside the detail page.
  // The 60px threshold handles trackpads without skipping several projects per gesture.
  $('#work-viewport').addEventListener('wheel', e => {
    if (dialog.open || e.ctrlKey || matchMedia('(max-width:700px)').matches) return;
    e.preventDefault();
    const time = performance.now();
    if (time - wheelLast > 900) wheelSum = 0;
    wheelSum += e.deltaY + (e.shiftKey ? e.deltaX : 0);
    if (time - wheelLast < 520) return;
    if (Math.abs(wheelSum) > 58) {
      goTo(selected + (wheelSum > 0 ? 1 : -1), wheelSum > 0 ? 1 : -1);
      wheelSum = 0;
      wheelLast = time;
    }
  }, {passive:false});

  const visualArea = $('#visual-area');
  visualArea.style.touchAction = 'pan-y';
  visualArea.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pointerStart = {x:e.clientX, y:e.clientY, id:e.pointerId};
  });
  visualArea.addEventListener('pointerup', e => {
    if (!pointerStart || pointerStart.id !== e.pointerId) return;
    const dx = e.clientX - pointerStart.x;
    const dy = e.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx) < 45 || Math.abs(dx) <= Math.abs(dy) * 1.2) return;
    ignoreClickUntil = performance.now() + 420;
    goTo(selected + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });
  visualArea.addEventListener('pointercancel', () => { pointerStart = null; });

  const nodes = {
    count: $('#dialog-count'), kicker: $('#dialog-kicker'), title: $('#dialog-title'),
    summary: $('#dialog-summary'), type: $('#dialog-type'), stack: $('#dialog-stack'),
    status: $('#dialog-status'), media: $('#dialog-media'), copy: $('#dialog-copy'),
    position: $('#dialog-position')
  };
  function populateDetail(index) {
    const p = projects[index];
    const formatted = pad(index + 1);
    dialog.style.setProperty('--case-bg', p.bg);
    dialog.style.setProperty('--case-ink', p.ink);
    dialog.style.setProperty('--case-accent', p.accent);
    nodes.count.textContent = `${formatted} / ${pad(total)}`;
    nodes.kicker.textContent = `PROJECT / ${formatted}`;
    nodes.title.textContent = p.title;
    nodes.summary.textContent = p.hint;
    nodes.type.textContent = p.type;
    nodes.stack.textContent = p.stack;
    nodes.status.textContent = p.status;
    nodes.position.textContent = `${formatted} / ${pad(total)}`;
    const source = sourceTemplate.content.querySelector(`[data-project="${p.id}"]`);
    nodes.media.replaceChildren();
    nodes.copy.replaceChildren();
    if (source) {
      const clone = source.cloneNode(true);
      const sourceMedia = $('.scene-media', clone);
      const sourceCopy = $('.scene-detail-copy', clone);
      if (sourceMedia) nodes.media.append(sourceMedia);
      if (sourceCopy) nodes.copy.append(sourceCopy);
      nodes.media.querySelectorAll('.live-embed').forEach(embed => {
        const overlay = $('.lf-overlay', embed);
        if (!overlay) return;
        const activate = () => {
          embed.classList.add('active');
          overlay.setAttribute('aria-hidden','true');
          overlay.tabIndex = -1;
          const frame = $('iframe', embed);
          if (frame) frame.focus();
        };
        overlay.addEventListener('click', activate);
        overlay.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            activate();
          }
        });
      });
      nodes.copy.querySelectorAll('a[target="_blank"]').forEach(link => {
        link.rel = 'noopener noreferrer';
      });
    } else {
      nodes.media.textContent = 'Project preview unavailable.';
    }
    dialogScroll.scrollTop = 0;
  }
  function pathWithoutHash(){ return location.pathname + location.search; }
  function openDetail(index, route = 'push') {
    goTo(index, index >= selected ? 1 : -1, false);
    populateDetail(selected);
    if (!dialog.open) dialog.showModal();
    $('#dialog-close').focus({preventScroll: true});
    if (route === 'push') {
      openedFromGallery = true;
      history.pushState({showcaseProject: projects[selected].id}, '', '#' + projects[selected].id);
    } else if (route === 'replace') {
      history.replaceState({showcaseProject: projects[selected].id}, '', '#' + projects[selected].id);
    }
  }
  function closeDetail(fromHistory = false) {
    if (!dialog.open) return;
    dialog.close();
    if (fromHistory) return;
    if (openedFromGallery) {
      openedFromGallery = false;
      busyNavigating = true;
      history.back();
      // A direct hash visit has no gallery entry. If no navigation occurs, restore the index.
      setTimeout(() => {
        if (busyNavigating && !dialog.open && location.hash.startsWith('#proj-')) {
          history.replaceState(null, '', pathWithoutHash());
          busyNavigating = false;
        }
      }, 250);
    } else {
      history.replaceState(null, '', pathWithoutHash());
    }
    visualFrame.focus({preventScroll:true});
  }
  $('#dialog-close').addEventListener('click', () => closeDetail());
  $('#dialog-prev').addEventListener('click', () => openDetail(selected - 1, 'replace'));
  $('#dialog-next').addEventListener('click', () => openDetail(selected + 1, 'replace'));
  dialog.addEventListener('cancel', event => {event.preventDefault(); closeDetail();});
  dialog.addEventListener('click', event => {
    if (event.target === dialog) closeDetail();
  });
  window.addEventListener('popstate', () => {
    busyNavigating = false;
    const hash = decodeURIComponent(location.hash.slice(1));
    const match = indexOfId(hash);
    if (match < 0) {
      openedFromGallery = false;
      closeDetail(true);
      return;
    }
    openedFromGallery = false;
    openDetail(match, 'none');
  });
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target;
    if (target?.closest('input,textarea,select,[contenteditable="true"]')) return;
    if (dialog.open) {
      if (event.key === 'ArrowRight' && !target.closest('iframe')) {
        event.preventDefault(); openDetail(selected + 1, 'replace');
      } else if (event.key === 'ArrowLeft' && !target.closest('iframe')) {
        event.preventDefault(); openDetail(selected - 1, 'replace');
      }
      return;
    }
    if (event.key === 'ArrowRight') {event.preventDefault();next();}
    if (event.key === 'ArrowLeft') {event.preventDefault();prev();}
    if (event.key === 'Enter' && document.activeElement === document.body) {
      event.preventDefault();openDetail(selected, 'push');
    }
  });

  drawIndex();
  goTo(0, 1, false);
  const initialIndex = indexOfId(decodeURIComponent(location.hash.slice(1)));
  if (initialIndex >= 0) {
    openedFromGallery = false;
    openDetail(initialIndex, 'none');
  }
})();
