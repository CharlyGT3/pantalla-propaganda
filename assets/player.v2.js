(function () {
    'use strict';
    var stage = document.getElementById('stage'), status = document.getElementById('status'), start = document.getElementById('start');
    var active = null, pending = null, index = -1, generation = 0, timer = null, watchdog = null, current = null, preloaded = null;
    var storageKey = 'pantalla-playlist:' + location.pathname;
    var previous = null, transitionTimer = null;
    var animationStyle = document.createElement('div').style;
    var canAnimate = 'animationName' in animationStyle || 'webkitAnimationName' in animationStyle;
    var disableMotion = /(?:\?|&)transitions=off(?:&|$)/.test(location.search || '');
    function removePrevious() { if (previous) { stage.removeChild(previous); previous = null; } }
    function reveal(node, item) {
        clearTimeout(transitionTimer);
        var effects = {fade:'fadeIn', 'slide-left':'slideInRight', 'slide-right':'slideInLeft', zoom:'zoomIn'};
        if (item.type === 'image' && canAnimate && !disableMotion && effects[item.transition]) {
            node.className = 'animate__animated animate__' + effects[item.transition];
            transitionTimer = setTimeout(function () { node.className = ''; removePrevious(); }, 850);
        } else { removePrevious(); }
    }
    function message(text) { status.innerHTML = ''; status.appendChild(document.createTextNode(text)); status.style.display = text ? 'block' : 'none'; }
    function clear() {
        clearTimeout(timer); clearInterval(watchdog); start.style.display = 'none';
        if (current && current.tagName.toLowerCase() === 'video') { current.pause(); current.removeAttribute('src'); current.load(); }
        clearTimeout(transitionTimer); removePrevious();
        if (current && current.tagName.toLowerCase() === 'img') { previous = current; }
        else { stage.innerHTML = ''; }
        current = null;
    }
    function next() {
        generation += 1;
        clear();
        if (pending) { active = pending; pending = null; index = -1; }
        if (!active) { message('Sin programación. Reintentando conexión…'); return; }
        index = (index + 1) % active.items.length;
        show(active.items[index], generation);
    }
    function show(item, token) {
        var node = document.createElement(item.type === 'image' ? 'img' : 'video'), finished = false;
        var lastTime = -1, lastProgress = new Date().getTime();
        current = node;
        function finish(error) {
            if (finished || token !== generation) { return; }
            finished = true; clearTimeout(timer); clearInterval(watchdog);
            if (error) { message('No se pudo reproducir un medio. Continuando…'); }
            timer = setTimeout(next, error ? 2000 : 0);
        }
        node.onerror = function () { finish(true); };
        timer = setTimeout(function () { finish(true); }, 30000);
        if (item.type === 'image') {
            node.alt = '';
            node.onload = function () {
                if (token !== generation || finished) { return; }
                clearTimeout(timer); message('');
                reveal(node, item);
                timer = setTimeout(function () { finish(false); }, item.duration * 1000);
            };
        } else {
            node.autoplay = true; node.muted = true; node.setAttribute('muted', 'muted'); node.setAttribute('playsinline', ''); node.preload = 'auto';
            node.onended = function () { finish(false); };
            node.onplaying = function () { if (token === generation && !finished) { clearTimeout(timer); reveal(node, item); message(''); start.style.display = 'none'; lastProgress = new Date().getTime(); } };
            watchdog = setInterval(function () {
                if (node.currentTime !== lastTime) { lastTime = node.currentTime; lastProgress = new Date().getTime(); }
                if (new Date().getTime() - lastProgress > 45000) { finish(true); }
            }, 5000);
            function play() {
                if (token !== generation || finished) { return; }
                try { var result = node.play(); if (result && result.then) { result.then(null, function () { if (token === generation && !finished) { start.style.display = 'block'; message('Presioná iniciar para habilitar video.'); } }); } }
                catch (e) { start.style.display = 'block'; }
            }
            start.onclick = play;
            node.onloadeddata = play;
        }
        stage.appendChild(node); node.src = item.src;
        // Sólo una imagen por adelantado: no abrir un segundo decodificador de video.
        var upcoming = active.items[(index + 1) % active.items.length];
        preloaded = null;
        if (upcoming.type === 'image') { preloaded = new Image(); preloaded.src = upcoming.src; }
    }
    function refresh() {
        var xhr = new XMLHttpRequest(), done = false;
        var timeout = setTimeout(function () { done = true; xhr.abort(); }, 15000);
        xhr.open('GET', 'playlist.json?_=' + new Date().getTime(), true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4 || done) { return; }
            done = true; clearTimeout(timeout);
            if (xhr.status !== 200) { return; }
            try {
                var data = Playlist.validate(JSON.parse(xhr.responseText));
                pending = (!active || data.version !== active.version) ? data : null;
                try { localStorage.setItem(storageKey, JSON.stringify(data)); } catch (ignored) {}
                if (!active) { next(); }
            } catch (ignored) { /* Mantener programación válida ante JSON parcial o inválido. */ }
        };
        xhr.send(null);
    }
    try { active = Playlist.validate(JSON.parse(localStorage.getItem(storageKey))); } catch (ignored) {}
    if (active) { next(); }
    refresh(); setInterval(refresh, 60000);
}());
