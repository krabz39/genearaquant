import { setTimeout as sleep } from 'node:timers/promises';
import { liveTradingEnabled } from './safety.js';
const interval = Math.max(1000, Number(process.env.WORKER_POLL_INTERVAL_MS || 5000));
let stopping = false;
process.on('SIGTERM',()=>{stopping=true}); process.on('SIGINT',()=>{stopping=true});
console.log(JSON.stringify({event:'worker_start',liveTradingEnabled:liveTradingEnabled(),mode:'reconciliation_scaffold_only'}));
while(!stopping){
  // Deliberately no order placement or token access in this release.
  if(liveTradingEnabled()) console.error(JSON.stringify({event:'unsafe_configuration',message:'LIVE_TRADING_ENABLED is true but this worker build has no execution implementation; refusing to trade.'}));
  await sleep(interval);
}
console.log(JSON.stringify({event:'worker_stopped'}));
