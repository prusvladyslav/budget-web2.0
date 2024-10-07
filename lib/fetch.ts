import useSWR, { type Fetcher } from "swr";
import axios, { type AxiosResponse } from "axios";

export const URLS = {
  subCyclesTable: "/api/subcycles-table",
  categories: "/api/categories",
  subCyclesWithCategories: "/api/subcycles-with-categories",
};

export const useGet = <T>(url: string | null, key: string) => {
  const fetcher: Fetcher<AxiosResponse<T>, string> = (url: string) =>
    axios.get(url);
  return useSWR(url, fetcher);
};
