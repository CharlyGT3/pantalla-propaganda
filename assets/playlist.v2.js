(function (root) {
    'use strict';
    function validate(data) {
        if (!data || data.schemaVersion !== 1 || typeof data.version !== 'string' || !data.version || data.version.length > 100 || !Array.isArray(data.items) || !data.items.length || data.items.length > 200) { throw new Error('Playlist inválida'); }
        var items = [], i, item;
        for (i = 0; i < data.items.length; i += 1) {
            item = data.items[i];
            if (!item || (item.type !== 'image' && item.type !== 'video') || typeof item.src !== 'string' || !/^media\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|mp4)$/.test(item.src) || (item.type === 'image' && !/\.(jpg|jpeg|png)$/.test(item.src)) || (item.type === 'video' && !/\.mp4$/.test(item.src))) { throw new Error('Medio inválido en posición ' + i); }
            if (item.type === 'image' && (typeof item.duration !== 'number' || !isFinite(item.duration) || item.duration < 1 || item.duration > 3600)) { throw new Error('Duración inválida'); }
            var effect = typeof item.transition === 'undefined' ? 'fade' : item.transition;
            if (['none', 'fade', 'slide-left', 'slide-right', 'zoom'].indexOf(effect) === -1) { throw new Error('Transición inválida'); }
            items.push({type:item.type, src:item.src, duration:item.type === 'image' ? item.duration : null, transition:effect});
        }
        return {schemaVersion:1, version:data.version, items:items};
    }
    root.Playlist = {validate:validate};
    if (typeof module !== 'undefined' && module.exports) { module.exports = root.Playlist; }
}(this));
