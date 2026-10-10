import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {parseSaved, safeStoryPath, readerSize} from '../src/lib/mobile-store';
let count=0;
function test(name:string,fn:()=>void){fn();count++;console.log('PASS '+name);}
const origin='https://mobile.example';
const context={module:{exports:{} as any},URL,Headers};
runInNewContext(readFileSync(new URL('../public/mobile-policy.js', import.meta.url),'utf8'),context);
const policy=context.module.exports;
const req=(path:string,extra:any={})=>({method:'GET',url:origin+path,mode:'navigate',headers:new Headers(),...extra});
test('malformed local storage cannot crash reading',()=>assert.deepEqual(parseSaved('{oops'),[]));
test('external URLs and encoded separators cannot enter reading list',()=>{for(const p of ['https://bad.example/','//bad.example/','/story/a%2fb','/story/a%5cb','/editor/foo'])assert.equal(safeStoryPath(p),false);});
test('duplicates removed and at most 100 summaries retained',()=>{const items=Array.from({length:120},(_,i)=>({path:'/story/'+i,title:'Story '+i}));assert.equal(parseSaved(JSON.stringify([...items,items[0]])).length,100);});
test('large untrusted summary fields are bounded',()=>assert.equal(parseSaved(JSON.stringify([{path:'/article/test',title:'test',summary:'x'.repeat(20000)}]))[0].summary.length,1400));
test('unknown reader size uses a usable default',()=>assert.equal(readerSize('invalid'),'normal'));
test('English and French public pages receive offline fallback',()=>{assert.equal(policy.classify(req('/saved'),origin),'page');assert.equal(policy.classify(req('/fr/story/example'),origin),'page');});
test('APIs and private routes are never intercepted',()=>{for(const p of ['/api/news','/_serverFn/test','/fr/admin','/editor/foo','/login','/auth'])assert.equal(policy.classify(req(p),origin),null);});
test('credentials, POST and cross-origin requests excluded',()=>{assert.equal(policy.classify(req('/news',{method:'POST'}),origin),null);assert.equal(policy.classify(req('/news',{headers:new Headers({authorization:'token'})}),origin),null);assert.equal(policy.classify(req('/news',{url:'https://else.example/news'}),origin),null);});
test('unknown queries bypass service worker',()=>assert.equal(policy.classify(req('/news?token=private'),origin),null));
test('static assets can be cached',()=>assert.equal(policy.classify(req('/assets/index-AbC123.js'),origin),'asset'));
const res=(path:string,headers:Record<string,string>={},extra:any={})=>({ok:true,status:200,type:'basic',redirected:false,url:origin+path,headers:new Headers({'content-type':'text/html',...headers}),...extra});
test('SSR HTML and server functions cannot be stored',()=>{assert.equal(policy.storable(res('/news'),origin),false);assert.equal(policy.storable(res('/_serverFn/data'),origin),false);});
test('offline shell can be stored',()=>assert.equal(policy.storable(res('/offline'),origin),true));
test('private, no-store, redirects, cookies and large assets rejected',()=>{for(const h of [{'cache-control':'no-store'},{'cache-control':'private'},{'set-cookie':'private=true'},{'content-length':'6000000'}])assert.equal(policy.storable(res('/offline',h),origin),false);assert.equal(policy.storable(res('/offline',{}, {redirected:true}),origin),false);});
console.log(`${count} mobile tests passed.`);

