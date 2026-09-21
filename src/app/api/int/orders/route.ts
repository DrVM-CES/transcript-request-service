import { intLedgerHandlers } from '../../../../lib/parchment/int-ledger-runtime';
export const runtime='nodejs';
export async function POST(request:Request){return intLedgerHandlers().prepare(request);}
