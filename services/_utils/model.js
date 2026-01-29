import { USE_MOCK } from '../../config/api';
import { mockModels } from '../../mocks/models';

export function model() {
  if (USE_MOCK) return mockModels;
  return globalThis.dataModel;
}

export async function getAll({ filter, select, name }) {
  const addSelect = (prop) => (select ? { ...prop, select } : prop);
  const pageSize = 200;
  const first = await model()[name].list(
    addSelect({
      pageNumber: 1,
      pageSize,
      getCount: true,
      filter,
    }),
  );
  const {
    data: { total },
  } = first;
  if (!total) return [];
  const totalPage = Math.ceil(total / pageSize);
  if (totalPage <= 1) return first.data.records;
  const lists = await Promise.all(
    Array.from({ length: totalPage - 1 }, (_, index) => index + 2).map((pageNumber) =>
      model()[name].list(
        addSelect({
          pageNumber,
          pageSize,
          filter,
        }),
      ),
    ),
  );

  const ret = lists.reduce((acc, current) => acc.concat(current.data.records), first.data.records);
  return ret;
}
