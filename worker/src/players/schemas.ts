// JSON schemas for each step's answer (rules section 5), built for this
// player and this day: only open districts, only its own, only offered
// bribes. The providers enforce them; the engine still validates.

import { BRIBE_MAX, BRIBE_MIN, MAX_AUDITS, PLAYERS, TURF, type District, type PlayerName } from "../engine/config";
import type { View } from "../engine/types";

type Schema = Record<string, unknown>;
const obj = (properties: Record<string, Schema>, required = Object.keys(properties)): Schema => ({ type: "object", properties, required, additionalProperties: false });
const prob: Schema = { type: "number", minimum: 0, maximum: 1 };
const text = (maxWords: number): Schema => ({ type: "string", description: `at most ${maxWords} words` });
const perDistrict = (ds: District[], s: Schema) => obj(Object.fromEntries(ds.map((d) => [d, s])));
const districtList = (ds: District[], max: number): Schema => ({ type: "array", items: { type: "string", enum: ds }, maxItems: max, uniqueItems: true });

export const forecastsSchema = (open: District[]) =>
  obj({ p_crime: perDistrict(open, prob), p_inspect: perDistrict(open, prob), p_both_respect: prob, p_any_bribe_accepted: prob, p_any_audit: prob });

export function messagesSchema(self: PlayerName): Schema {
  const to = PLAYERS.filter((p) => p !== self && p !== "World");
  return obj({ messages: { type: "array", maxItems: 2, items: obj({ to: { type: "string", enum: to }, text: text(80) }) } });
}

export function offersSchema(v: View): Schema {
  const mine = v.open.filter((d) => TURF[d] === v.player);
  return obj({ bribe_offers: perDistrict(mine, { anyOf: [{ type: "integer", minimum: BRIBE_MIN, maximum: BRIBE_MAX }, { type: "null" }] }) });
}

export function answersSchema(v: View): Schema {
  const offered = Object.keys(v.offersToAnswer ?? {}) as District[];
  return obj({ bribe_answers: perDistrict(offered, { type: "string", enum: ["accept", "refuse"] }) });
}

export function actSchema(v: View): Schema {
  const f = forecastsSchema(v.open);
  switch (v.player) {
    case "Families":
    case "Saltdogs": {
      const mine = v.open.filter((d) => TURF[d] === v.player);
      return obj({ forecasts: f, moves: obj({ crime: perDistrict(mine, { type: "boolean" }), turf: { type: "string", enum: ["respect", "encroach"] } }), diary: text(120) });
    }
    case "Chief": {
      const allowed = v.open.filter((d) => !(v.acceptedToday ?? []).includes(d));
      return obj({ forecasts: f, moves: obj({ inspect: districtList(allowed, allowed.length) }), diary: text(120) });
    }
    case "Council":
      return obj({ forecasts: f, moves: obj({ audit: districtList(v.open, MAX_AUDITS) }), diary: text(120) });
    case "World":
      return obj({ forecasts: f });
  }
}

export function wireSchema(eventIds: string[]): Schema {
  return obj({ wire: { type: "array", minItems: 2, maxItems: 5, items: obj({ headline: { type: "string" }, text: text(60), events: { type: "array", minItems: 1, items: { type: "string", enum: eventIds } } }) } });
}
