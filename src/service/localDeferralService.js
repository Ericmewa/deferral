// DEPRECATED: localDeferralService has been removed in favor of `deferralApi`.
// Please use `src/service/deferralApi.js` instead. This file remains only to provide a
// clear runtime error if any stale imports remain.

const throwDeprecated = (fnName, alt) => () => { throw new Error(`localDeferralService.${fnName} is deprecated. Use ${alt} from src/service/deferralApi.js instead.`); };

export const sampleDeferrals = []; // removed from frontend; use backend seed endpoint instead

export default {
  getDeferrals: throwDeprecated('getDeferrals', 'deferralApi.getMyDeferrals()'),
  getDeferralById: throwDeprecated('getDeferralById', 'deferralApi.getDeferralById(id)'),
  addDeferral: throwDeprecated('addDeferral', 'deferralApi.createDeferral(payload)'),
  updateDeferral: throwDeprecated('updateDeferral', 'deferralApi.updateDeferral(id, patch)'),
  addHistory: throwDeprecated('addHistory', 'deferralApi.addHistory(id, entry)'),
  migrateSamples: throwDeprecated('migrateSamples', 'backend seed endpoint POST /api/deferrals/seed')
};