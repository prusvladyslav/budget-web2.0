import useSWR, { Fetcher } from "swr";
import axios, { AxiosResponse } from "axios";

export const URLS = {
  subCyclesTable: "/api/subcycles-table",
  categories: "/api/categories",
  // expenses: "/api/expenses",
};

export const useGet = <T>(url: string) => {
  const fetcher: Fetcher<AxiosResponse<T>, string> = (url: string) =>
    axios.get(url);
  return useSWR(url, fetcher);
};
