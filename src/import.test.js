import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseCsv,importEventsCsv,exportEventsCsv} from './import.js';
test('quoted CSV with commas and escaped quotes',()=>{
  assert.deepEqual(parseCsv('a,b\n"hi, there","say ""hi"""'),[['a','b'],['hi, there','say "hi"']]);
});
test('import validates required columns and verified flag',()=>{
  assert.throws(()=>importEventsCsv('id,video\na,b'),/Missing CSV column/);
  assert.throws(()=>importEventsCsv('id,video,player,type,verified\na,b,c,appearance,yep'),/verified must/);
});
test('event CSV round trip preserves field values',()=>{
  const original=[{id:'e1',video:'v1',player:'simon',type:'appearance',verified:true,round:'1',timestampSeconds:10,note:'Said "hi", later'}];
  assert.deepEqual(importEventsCsv(exportEventsCsv(original)),original);
});
