import { previewTracker } from './tracker.js';

// Original fictional practice data, in the two formats exported by the community tracker.
export const sampleGames = [
  'Game Number,Video Link,Winner,Map Name,"Players, Roles and Tasks"',
  '1,demo:skeld,Crewmate,The Skeld,"Simon - Crewmate - (5/6),Vik - Imposter,Harry - Crewmate - (6/6),Josh - Crewmate - (3/6),Ethan - Imposter,JJ - Crewmate - (1/6),Tobi - Crewmate - (4/6),Randolph - Crewmate - (2/6),Deji - Crewmate - (1/6),Ginge - Crewmate - (3/6)"',
  '2,demo:skeld,Imposter,The Skeld,"Simon - Imposter,Vik - Crewmate - (4/6),Harry - Crewmate - (2/6),Josh - Imposter,Ethan - Crewmate - (1/6),JJ - Crewmate - (0/6),Tobi - Crewmate - (6/6),Randolph - Crewmate - (3/6),LazarBeam - Crewmate - (4/6),Ellum - Crewmate - (2/6)"',
].join('\n');
export const sampleBreakdowns = [
  'Game Number,Sequence,Primary Player,Event Type,Secondary Player',
  '1,1,Vik,Killed (Killed),JJ',
  '1,2,Harry,Reported Body Of,JJ',
  '1,3,Vik,Was Voted Out,',
  '1,4,Ethan,Killed (Killed),Deji',
  '1,5,Simon,Reported Body Of,Deji',
  '1,6,Ethan,Was Voted Out,',
  '2,1,Simon,Killed (Killed),Harry',
  '2,2,Tobi,Reported Body Of,Harry',
  '2,3,Josh,Killed (Killed),Randolph',
  '2,4,Simon,Killed (Killed),JJ',
  '2,5,Josh,Killed (Killed),Ethan',
  '2,6,Josh,Killed (Killed),LazarBeam',
  '2,7,Simon,Killed (Killed),Ellum',
].join('\n');
export const demoEpisode = previewTracker(sampleGames, sampleBreakdowns)[0].episode;
