import { mockData } from "./data";
import { DATA_MODEL_KEY } from "../config/model";

function deepClone(v) {
  return JSON.parse(JSON.stringify(v));
}

function normalizeWhere(where) {
  return where && typeof where === "object" ? where : {};
}

function matchWhere(record, where) {
  const w = normalizeWhere(where);
  return Object.keys(w).every((key) => {
    const cond = w[key];
    const value = record?.[key];
    if (cond && typeof cond === "object") {
      if ("$eq" in cond) return value === cond.$eq;
      if ("$neq" in cond) return value !== cond.$neq;
      if ("$search" in cond) return String(value || "").includes(String(cond.$search || ""));
      return true;
    }
    return value === cond;
  });
}

function applySelect(record, select) {
  if (!select || typeof select !== "object") return record;
  const out = {};
  Object.keys(select).forEach((k) => {
    const s = select[k];
    if (s === true) out[k] = record?.[k];
    else if (s && typeof s === "object") out[k] = record?.[k];
  });
  if (select._id) out._id = record?._id;
  return out;
}

function applyOrderBy(records, orderBy) {
  if (!Array.isArray(orderBy) || !orderBy.length) return records;
  const [{ ...first }] = orderBy;
  const field = Object.keys(first)[0];
  const dir = String(first[field] || "asc").toLowerCase();
  const sign = dir === "desc" ? -1 : 1;
  return [...records].sort((a, b) => {
    const av = a?.[field];
    const bv = b?.[field];
    if (av === bv) return 0;
    return av > bv ? sign : -sign;
  });
}

function makeCollection(name, store) {
  return {
    async list({ filter, select, pageSize = 20, pageNumber = 1, getCount = false, orderBy } = {}) {
      const where = filter?.where || {};
      const relateWhere = filter?.relateWhere || null;
      let records = store[name] || [];
      records = records.filter((r) => matchWhere(r, where));
      records = applyOrderBy(records, orderBy);

      const total = records.length;
      const start = (Number(pageNumber || 1) - 1) * Number(pageSize || 20);
      const pageRecords = records.slice(start, start + Number(pageSize || 20));

      const mapped = pageRecords.map((r) => {
        const base = applySelect(deepClone(r), select);
        if (relateWhere?.spu?.where && Array.isArray(base.spu)) {
          base.spu = base.spu.filter((x) => matchWhere(x, relateWhere.spu.where));
        }
        return base;
      });

      const data = { records: mapped };
      if (getCount) data.total = total;
      return { data };
    },
    async get({ filter, select } = {}) {
      const where = filter?.where || {};
      const record = (store[name] || []).find((r) => matchWhere(r, where));
      const data = record ? applySelect(deepClone(record), select) : null;
      if (filter?.relateWhere?.spu?.where && data?.spu && Array.isArray(data.spu)) {
        data.spu = data.spu.filter((x) => matchWhere(x, filter.relateWhere.spu.where));
      }
      return { data };
    },
    async create({ data } = {}) {
      const next = { ...(data || {}) };
      if (!next._id) next._id = `${name}_${Date.now()}`;
      store[name] = store[name] || [];
      store[name].unshift(next);
      return { data: deepClone(next) };
    },
    async update({ data, filter } = {}) {
      const where = filter?.where || {};
      const list = store[name] || [];
      let count = 0;
      list.forEach((r) => {
        if (matchWhere(r, where)) {
          Object.assign(r, data || {});
          count += 1;
        }
      });
      return { data: { count } };
    },
    async delete({ filter } = {}) {
      const where = filter?.where || {};
      const before = (store[name] || []).length;
      store[name] = (store[name] || []).filter((r) => !matchWhere(r, where));
      return { data: { count: before - store[name].length } };
    },
  };
}

const store = deepClone(mockData);

export const mockModels = {};
Object.keys(DATA_MODEL_KEY).forEach((k) => {
  const name = DATA_MODEL_KEY[k];
  if (!store[name]) store[name] = [];
  mockModels[name] = makeCollection(name, store);
});

export function getMockStore() {
  return store;
}
