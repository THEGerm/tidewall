// The game theory panel's measures, ported from analysis/metrics (rates.py,
// beliefs.py, welfare.py, turf.py) so the page and the paper agree. The paper's
// figures still come from the notebooks; this is for watching a run.
// worker/test/dashboard/theory.test.ts checks the port against the Python.

export const DISTRICTS = ["Port", "Hightown", "Old Quarter", "Lowtown", "Market", "Seawall"];
export const TURF = { Port: "Families", Hightown: "Families", "Old Quarter": "Families", Lowtown: "Saltdogs", Market: "Saltdogs", Seawall: "Saltdogs" };

// analysis/metrics/equilibrium.py
export const CRIME_RATE = 4 / 15;
export const INSPECTION_RATE = 1 / 4;
export const AUDIT_LINE = 1 / 10;
export const MIN_DAYS = 12;
export const BEST_DAY = 12; // welfare.py: no crime, no inspections or audits, both respect

const Z95 = 1.959963984540054;

// rates.wilson
export function wilson(k, n, z = Z95) {
  if (n === 0) return [0, 1];
  const p = k / n, denom = 1 + (z * z) / n;
  const centre = (p + (z * z) / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom;
  return [Math.max(0, centre - half), Math.min(1, centre + half)];
}

// rates.against
export function against(k, n, target) {
  const rate = n ? k / n : NaN;
  const [low, high] = wilson(k, n);
  const se = n && target > 0 && target < 1 ? Math.sqrt((target * (1 - target)) / n) : NaN;
  return { k, n, rate, low, high, target, gap: rate - target, z: se > 0 ? (rate - target) / se : NaN, consistent: low <= target && target <= high };
}

// beliefs.brier
export function brier(pairs) {
  if (!pairs.length) return NaN;
  return pairs.reduce((a, [p, o]) => a + (p - (o ? 1 : 0)) ** 2, 0) / pairs.length;
}

// Brier skill against each event's base rate in the run (rules.md, Forecasts:
// "for H6"). With one event this is beliefs.brier_skill; with several, the
// reference forecasts each event at its own base rate.
export function brierSkill(pairs, events) {
  if (!pairs.length) return NaN;
  const base = {};
  for (const [, o, e] of events) (base[e] ??= [0, 0]), (base[e][0] += o ? 1 : 0), (base[e][1] += 1);
  const ref = pairs.reduce((a, [, o, e]) => a + (base[e][0] / base[e][1] - (o ? 1 : 0)) ** 2, 0) / pairs.length;
  return ref === 0 ? NaN : 1 - brier(pairs) / ref;
}

// Which forecast events a player is scored on: never one its own moves decide
// (rules.md, Forecasts, scoring rule).
export function scoredOn(player, key, district) {
  if (player === "Families" || player === "Saltdogs") {
    if (key === "p_crime" && TURF[district] === player) return false;
    if (key === "p_both_respect") return false;
  }
  if (player === "Chief" && (key === "p_inspect" || key === "p_any_bribe_accepted")) return false;
  if (player === "Council" && key === "p_any_audit") return false;
  return true;
}

// Every (forecast, outcome, event) for one day, from the day's moves.
export function forecastPairs(f, moves, open) {
  const out = [];
  const crime = moves.crime || {}, inspect = moves.inspect || [];
  for (const d of open) {
    if (typeof f.p_crime?.[d] === "number") out.push(["p_crime", d, f.p_crime[d], !!crime[d]]);
    if (typeof f.p_inspect?.[d] === "number") out.push(["p_inspect", d, f.p_inspect[d], inspect.includes(d)]);
  }
  const t = moves.turf || {};
  if (typeof f.p_both_respect === "number") out.push(["p_both_respect", null, f.p_both_respect, t.Families === "respect" && t.Saltdogs === "respect"]);
  if (typeof f.p_any_bribe_accepted === "number") out.push(["p_any_bribe_accepted", null, f.p_any_bribe_accepted, (moves.accepted || []).length > 0]);
  if (typeof f.p_any_audit === "number") out.push(["p_any_audit", null, f.p_any_audit, (moves.audit || []).length > 0]);
  return out;
}

// turf.classify
const STRATEGIES = {
  "always respect": () => true,
  "always encroach": () => false,
  "tit-for-tat": (me, them) => (them.length ? them[them.length - 1] : true),
  "grim trigger": (me, them) => them.every(Boolean),
  "forgive one (tit-for-two-tats)": (me, them) => !(them.length >= 2 && !them[them.length - 1] && !them[them.length - 2]),
  "win-stay lose-shift": (me, them) => (!me.length ? true : them[them.length - 1] ? me[me.length - 1] : !me[me.length - 1]),
};
export function classify(mine, theirs) {
  const fits = Object.entries(STRATEGIES).map(([strategy, rule]) => {
    let same = 0;
    for (let t = 0; t < mine.length; t++) same += rule(mine.slice(0, t), theirs.slice(0, t)) === mine[t] ? 1 : 0;
    return { strategy, agreement: mine.length ? same / mine.length : NaN };
  });
  return fits.sort((a, b) => b.agreement - a.agreement); // stable, so ties keep the order above
}

// The whole panel for one run. Takes the run export (finished) or the same
// shape built from public data (live: no inspections, audits, bribes,
// forecasts or answers, so those come back null).
export function panel(x) {
  const days = x.days;
  // Inspections count over the districts the Chief could inspect: open, and
  // without a bribe it accepted that day (as analysis/stats does, #107).
  let open = 0, inspectable = 0, crimes = 0, inspections = 0, audits = 0, offered = 0, taken = 0;
  const auditBy = Object.fromEntries(DISTRICTS.map((d) => [d, [0, 0]]));
  const turf = [];
  for (const d of days) {
    const m = d.moves || {};
    for (const dist of d.open) {
      open++;
      if (m.crime?.[dist]) crimes++;
      if (x.secret) {
        if (!(m.accepted || []).includes(dist)) inspectable++;
        if ((m.inspect || []).includes(dist)) inspections++;
        const a = (m.audit || []).includes(dist);
        audits += a ? 1 : 0;
        auditBy[dist][0] += a ? 1 : 0;
        auditBy[dist][1]++;
      }
    }
    if (x.secret) {
      for (const g of ["Families", "Saltdogs"]) offered += Object.keys(m.offers?.[g] || {}).length;
      taken += (m.accepted || []).length;
    }
    if (m.turf) turf.push({ day: d.day, Families: m.turf.Families === "respect", Saltdogs: m.turf.Saltdogs === "respect" });
  }

  const out = {
    days: days.length,
    crime: against(crimes, open, CRIME_RATE),
    inspection: x.secret ? against(inspections, inspectable, INSPECTION_RATE) : null,
    audit: x.secret ? against(audits, open, AUDIT_LINE) : null,
    auditBy: x.secret ? Object.fromEntries(Object.entries(auditBy).map(([d, [k, n]]) => [d, against(k, n, AUDIT_LINE)])) : null,
    bribes: x.secret ? { offered, taken } : null,
    turf: {
      days: turf,
      Families: classify(turf.map((t) => t.Families), turf.map((t) => t.Saltdogs)),
      Saltdogs: classify(turf.map((t) => t.Saltdogs), turf.map((t) => t.Families)),
      both: turf.length ? turf.filter((t) => t.Families && t.Saltdogs).length / turf.length : NaN,
    },
    welfare: null,
    forecasts: null,
    answers: null,
  };

  if (days.every((d) => typeof d.welfare === "number")) {
    const total = days.reduce((a, d) => a + d.welfare, 0), best = BEST_DAY * days.length;
    out.welfare = { total, best, share: best ? total / best : NaN, lossPerDay: days.length ? (best - total) / days.length : NaN };
  }

  if (x.forecasts) {
    const byDay = Object.fromEntries(days.map((d) => [d.day, d]));
    const all = [], per = {};
    for (const f of x.forecasts) {
      const d = byDay[f.day];
      if (!d) continue;
      for (const [key, dist, p, o] of forecastPairs(f.forecasts || {}, d.moves || {}, d.open)) {
        const ev = dist ? `${key}:${dist}` : key;
        all.push([p, o, ev]);
        if (scoredOn(f.player, key, dist)) (per[f.player] ??= []).push([p, o, ev]);
      }
    }
    out.forecasts = Object.fromEntries(Object.entries(per).map(([pl, ps]) => [pl, { n: ps.length, brier: brier(ps), skill: brierSkill(ps, all) }]));
  }

  if (x.answers) {
    const per = {};
    // n counts final answers only (the player's or the fallback), so a retry
    // row is not a second answer: analysis/stats/measures.py, fallbacks().
    for (const a of x.answers) {
      const t = (per[a.player] ??= { n: 0, fallback: 0, refused: 0, retries: 0 });
      if (a.source === "retry") { t.retries++; continue; }
      t.n++;
      if (a.source === "fallback") t.fallback++;
      if (a.reason === "refused") t.refused++;
    }
    out.answers = per;
  }
  return out;
}
