const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const noop=()=>{},g=new Proxy({getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4).fill(255)})},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
function el(){return {children:[],style:{},dataset:{},hidden:false,append(x){this.children.push(x)},setAttribute:noop,getContext:()=>g}}
const els=new Map(),tools=[],events={},windowEvents={};const document={getElementById:id=>{if(!els.has(id))els.set(id,el());return els.get(id)},createElement:()=>el(),addEventListener:(name,handler)=>events[name]=handler,querySelectorAll:()=>[],modelContext:{registerTool:t=>tools.push(t)}};
class Image{set src(v){this.width=v.includes('cars')?1536:2048;this.height=v.includes('cars')?1024:682;queueMicrotask(()=>this.onload())}}
const context=vm.createContext({document,window:{addEventListener:(name,handler)=>windowEvents[name]=handler},Image,requestAnimationFrame:noop,console,Math,Set,Promise,location:{reload:noop}});
vm.runInContext(fs.readFileSync('game.js','utf8'),context);
setTimeout(()=>{const run=s=>vm.runInContext(s,context);assert.equal(context.window.neonDrive.getState().mode,'garage');assert.equal(run('cars.length'),11);tools[0].execute({carIndex:9});assert.equal(run('selected'),9);assert.throws(()=>tools[0].execute({carIndex:11}));run('start();keys.add("ArrowLeft");for(let i=0;i<200;i++)update(1/60)');assert.equal(run('speed'),71.5);assert.ok(run('distance')>0);run('traffic=[];keys.clear();keys.add("ArrowRight");for(let i=0;i<400;i++){update(1/60);traffic=[]}');assert.equal(run('speed'),181.5);run('keys.clear();keys.add("ArrowUp");for(let i=0;i<150;i++){update(1/60);traffic=[]}');assert.equal(run('position'),0);run('keys.clear();keys.add("ArrowDown");for(let i=0;i<180;i++){update(1/60);traffic=[]}');assert.equal(run('position'),1);run('keys.clear();traffic=[{...player(),lane:2,v:speed,angle:0,age:0}];recovery=0;health=4;update(1/60)');assert.equal(run('health'),3);run('update(1/60)');assert.equal(run('health'),3);run('pause()');const d=run('distance');run('update(1)');assert.equal(run('distance'),d);// Verify actual key events, first-frame response, release, reversal, and focus loss.
const key=(type,name,repeat=false)=>events[type]({key:name,repeat,preventDefault:noop});
run('start();spawnClock=1000');
key('keydown','ArrowRight');key('keydown','ArrowUp');
const before=run('position');run('update(1/60)');
assert.ok(run('speed')>110);assert.ok(run('position')<before);
assert.ok(run('steerParallax')<0);
key('keyup','ArrowUp');const stopped=run('position');run('update(1/60)');
assert.equal(run('position'),stopped);
key('keydown','ArrowDown');run('update(1/60)');assert.ok(run('position')>stopped);
key('keydown','ArrowLeft');const fast=run('speed');run('update(1/60)');assert.ok(run('speed')<fast);
key('keyup','ArrowRight');key('keyup','ArrowLeft');key('keyup','ArrowDown');
run('speed=CONFIG.CRUISE');run('update(1/60)');assert.equal(run('speed'),110);
key('keydown','ArrowUp');key('keydown','Escape');key('keydown','Escape',true);
assert.equal(run('mode'),'paused');assert.equal(run('keys.size'),0);
key('keydown','Escape');assert.equal(run('mode'),'playing');
key('keydown','ArrowRight');windowEvents.blur();assert.equal(run('mode'),'paused');assert.equal(run('keys.size'),0);
// Equivalent steering at different refresh rates; no inertia on release.
const positions=[];
for(const hz of [30,60,144]){run('start();spawnClock=1000;keys.add("ArrowDown")');for(let i=0;i<hz/2;i++)run('update('+1/hz+')');positions.push(run('position'))}
assert.ok(Math.max(...positions)-Math.min(...positions)<1e-10);
assert.ok(run('CONFIG.PARALLAX.every((v,i,a)=>i===0||v>a[i-1])'));
console.log('PASS: immediate input, simultaneous keys, release, reversal, brake priority, focus loss, Escape repeat, frame-rate independence, parallax depth.');
console.log('PASS: 11 sprites, selection, invalid selection, speed bounds, continued travel, steering limits, collision recovery, pause.');},20);
