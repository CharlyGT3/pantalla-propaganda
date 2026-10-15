const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const Playlist = require('../assets/playlist.v2.js');
function harness(data, animations = false) {
    let tasks = [], requests = [], now = 100000;
    function element(tag) { return {tagName:tag,style:animations?{animationName:''}:{},children:[],appendChild(n){this.children.push(n);},removeChild(n){this.children=this.children.filter(x=>x!==n);},setAttribute(){},removeAttribute(){},pause(){},load(){},play(){this.onplaying();},currentTime:0,set innerHTML(v){this.children=[];}}; }
    const nodes = {stage:element('div'),status:element('p'),start:element('button')};
    const store = {};
    const ctx = {Playlist,JSON,Image:function(){},location:{pathname:'/club/'},localStorage:{getItem(k){return store[k] || null;},setItem(k,v){store[k]=v;}},document:{getElementById(id){return nodes[id];},createElement:element,createTextNode(t){return t;}},Date:function(){this.getTime=()=>now;},setTimeout(fn,ms){const t={fn,ms};tasks.push(t);return t;},clearTimeout(t){tasks=tasks.filter(x=>x!==t);},setInterval(fn,ms){const t={fn,ms,interval:true};tasks.push(t);return t;},clearInterval(t){tasks=tasks.filter(x=>x!==t);},XMLHttpRequest:function(){requests.push(this);this.open=()=>{};this.send=()=>{};this.abort=()=>{};}};
    vm.runInNewContext(fs.readFileSync(path.join(root,'assets/player.v2.js'),'utf8'),ctx);
    function reply(value){const r=requests[requests.length-1];r.readyState=4;r.status=200;r.responseText=JSON.stringify(value);r.onreadystatechange();}
    function run(ms){const t=tasks.find(x=>x.ms===ms);assert.ok(t,'timer '+ms);if(!t.interval)tasks=tasks.filter(x=>x!==t);now+=ms;t.fn();}
    reply(data);
    return {nodes,reply,run,current:()=>nodes.stage.children[nodes.stage.children.length-1]};
}
const image = {type:'image',src:'media/one-v1.png',duration:3};
const video = {type:'video',src:'media/two-v1.mp4'};
const list = {schemaVersion:1,version:'a',items:[image,video]};
test('rejects executable paths, bad duration and invalid types',()=>{
    for (const item of [{...image,src:'javascript:alert(1)'},{...image,src:'media/../x.png'},{...image,duration:0},{...video,src:'media/x.png'}]) assert.throws(()=>Playlist.validate({...list,items:[item]}));
});
test('transition whitelist survives validation and rejects unknown classes',()=>{
    for(const transition of ['none','fade','slide-left','slide-right','zoom']) assert.equal(Playlist.validate({...list,items:[{...image,transition}]}).items[0].transition,transition);
    assert.throws(()=>Playlist.validate({...list,items:[{...image,transition:'evil'}]}));
});
test('fade keeps previous image until ready, cleans up without animationend',()=>{
    const h=harness({...list,items:[{...image,transition:'fade'}, {...image,src:'media/second.png',transition:'zoom'}]},true);
    h.current().onload();assert.match(h.current().className,/fadeIn/);h.run(850);
    h.run(3000);h.run(0);assert.equal(h.nodes.stage.children.length,2);
    h.current().onload();assert.match(h.current().className,/zoomIn/);h.run(850);
    assert.equal(h.nodes.stage.children.length,1);
});
test('old browser without CSS animation still advances images',()=>{
    const h=harness({...list,items:[image]});h.current().onload();h.run(3000);h.run(0);h.current().onload();
    assert.equal(h.nodes.stage.children.length,1);assert.ok(!h.current().className);
});
test('images time from load, video advances on ended, then loops',()=>{
    const h=harness(list);h.current().onload();h.run(3000);h.run(0);
    assert.equal(h.current().tagName,'video');h.current().onloadeddata();h.current().onended();h.run(0);
    assert.equal(h.current().src,image.src);
});
test('media errors skip with backoff; stale load cannot advance new item',()=>{
    const h=harness(list),old=h.current();old.onerror();h.run(2000);old.onload();
    assert.equal(h.current().src,video.src);
});
test('valid updates apply at boundary; invalid JSON preserves active playlist',()=>{
    const h=harness(list);h.run(60000);h.reply({...list,version:'b',items:[{...image,src:'media/new-v2.png'}]});
    assert.equal(h.current().src,image.src);h.current().onload();h.run(3000);h.run(0);
    assert.equal(h.current().src,'media/new-v2.png');
    h.run(60000);h.reply({schemaVersion:1,version:'c',items:[]});h.current().onload();h.run(3000);h.run(0);
    assert.equal(h.current().src,'media/new-v2.png');
});
test('stalled videos recover without truncating healthy playback',()=>{
    const h=harness({...list,items:[video,image]});h.current().onloadeddata();
    for(let i=0;i<11;i++)h.run(5000);
    h.run(2000);assert.equal(h.current().src,image.src);
});
test('a server rollback cancels an update still awaiting the boundary',()=>{
    const h=harness(list);h.run(60000);h.reply({...list,version:'b',items:[{...image,src:'media/new-v2.png'}]});
    h.run(60000);h.reply(list);h.current().onload();h.run(3000);h.run(0);
    assert.equal(h.current().src,video.src);
});
