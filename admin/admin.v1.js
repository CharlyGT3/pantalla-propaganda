(function () {
    'use strict';
    var field = document.getElementById('json'), result = document.getElementById('result');
    field.value = JSON.stringify({schemaVersion:1,version:String(new Date().getTime()),items:[{type:'image',src:'media/bienvenida-v1.png',duration:10}]}, null, 2);
    var xhr = new XMLHttpRequest(); xhr.open('GET', '../playlist.json?_=' + new Date().getTime(), true);
    xhr.onreadystatechange = function () { if (xhr.readyState === 4 && xhr.status === 200) { try { var data = Playlist.validate(JSON.parse(xhr.responseText)); data.version = String(new Date().getTime()); field.value = JSON.stringify(data, null, 2); } catch (e) {} } }; xhr.send();
    document.getElementById('github').onclick = function () {
        var repo = document.getElementById('repo').value;
        if (!/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/.test(repo)) { result.textContent = 'Ingresá propietario/repositorio.'; return; }
        window.open('https://github.com/' + repo, '_blank', 'noopener,noreferrer');
    };
    document.getElementById('download').onclick = function () {
        try {
            var data = Playlist.validate(JSON.parse(field.value));
            var url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2) + '\n'], {type:'application/json'}));
            var link = document.createElement('a'); link.href = url; link.download = 'playlist.json'; document.body.appendChild(link); link.click(); document.body.removeChild(link);
            setTimeout(function () { URL.revokeObjectURL(url); }, 30000);
            result.textContent = 'Archivo validado. Publicá medios antes que playlist. Cambiá version en cada edición.';
        } catch (e) { result.textContent = e.message; }
    };
}());
