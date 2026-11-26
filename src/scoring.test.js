import { test } from 'node:test';
import assert from 'node:assert/strict';
import { breakdown, score, weights } from './scoring.js';
const base = {id:'a', video:'video-one', player:'simon', verified:true};
test('appearance awarded once per player and video', () => {
  assert.deepEqual(score([{...base,type:'appearance'}, {...base,id:'b',type:'appearance'}]), {simon:3});
});
test('weighted sheriff kill is greater than impostor kill', () => {
  assert.deepEqual(score([{...base,type:'sheriff_correct_kill'}, {...base,id:'b',type:'impostor_kill'}]), {simon:8});
});
test('unverified events do not score', () => {
  assert.deepEqual(score([{...base,type:'match_win',verified:false}]), {});
});
test('duplicate stable event IDs cannot double score', () => {
  assert.deepEqual(score([{...base,type:'match_win'}, {...base,type:'match_win'}]), {simon:4});
});
test('conflicting event IDs cause an error', () => {
  assert.throws(() => score([{...base,type:'match_win'}, {...base,type:'survival'}]), /Conflicting/);
});
test('distinct matches within the same video count separately', () => {
  assert.deepEqual(score([{...base,type:'match_played',round:1},{...base,id:'b',type:'match_played',round:2}]), {simon:2});
});
test('negative scores and player breakdown are respected', () => {
  const events = [{...base,type:'impostor_ejected'}, {...base,id:'b',type:'appearance'}];
  assert.deepEqual(score(events), {simon:0});
  assert.equal(breakdown(events,'simon').length,2);
  assert.equal(weights.sheriff_correct_kill,6);
});
test('custom weights can be used without editing events', () => {
  assert.deepEqual(score([{...base,type:'match_win'}], {match_win:10}), {simon:10});
});
