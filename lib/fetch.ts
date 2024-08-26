import useSWR, { Fetcher } from "swr";
import axios, { AxiosResponse } from "axios";

export const URLS = {
  subCyclesTable: "/api/subcycles-table",
  categories: "/api/categories",
  subCyclesWithCategories: "/api/subcycles-with-categories",
  expensesBySubcycle: "/api/expenses-by-subcycle",
};

export const useGet = <T>(url: string | null, key: string) => {
  const fetcher: Fetcher<AxiosResponse<T>, string> = (url: string) =>
    axios.get(url);
  return useSWR(url, fetcher);
};
