import { Flags } from "../models/rest/Flags";

import Axios, { AxiosRequestConfig } from "axios";
import { Map } from "../models/rest/Map";
import { Category } from "../models/rest/Category";
import { SearchFilters } from "../models/rest/SearchFilters";
import { ParseMap } from "../models/rest/ParseMap";
import { ConfigInfo } from "../models/rest/ConfigInfo";

export interface PageOptions {
  count?: number;
  offset?: number;
}

export interface RequestOptions {
  onUploadProgress?: (progressEvent: any) => void;
  onDownloadProgress?: (progressEvent: any) => void;
  signal: AbortSignal;
}

export class MapService {
  public defaultConfig: AxiosRequestConfig;

  constructor(defaultConfig?: AxiosRequestConfig) {
    this.defaultConfig = defaultConfig || {};
  }

  public uploadMap = async (
    params: UploadMapParametres,
    options?: RequestOptions
  ) => {
    let request: AxiosRequestConfig<FormData> = {
      ...this.defaultConfig,
      url: "/v1/maps",
      method: "POST",
      validateStatus: (status) => {
        return status === 200 || status === 201;
      },
    };

    request = this.appendOptions(request, options);

    // Append parametres

    const body = new FormData();

    body.append("map", params.map);
    body.append(
      "additionalFlags",
      new Blob([JSON.stringify(params.additionalFlags)], {
        type: "application/json",
      })
    );
    body.append(
      "flags",
      new Blob([JSON.stringify(params.flags)], { type: "application/json" })
    );

    request.data = body;
    const response = await Axios.request<Map>(request);

    return response.data;
  };

  public getCategories = async (
    params?: undefined,
    options?: RequestOptions
  ) => {
    let request: AxiosRequestConfig<FormData> = {
      ...this.defaultConfig,
      url: "/v1/maps/categories",
      method: "GET",
    };

    request = this.appendOptions(request, options);

    const response = await Axios.request<Category[]>(request);

    return response.data;
  };

  public getMaps = async (options?: RequestOptions) => {
    const request: AxiosRequestConfig<FormData> = {
      ...this.defaultConfig,
      url: "/v1/maps",
      method: "GET",
      params: {
        count: 20,
        offset: 0,
      },
    };

    const response = await Axios.request<Map[]>(request);

    return response.data;
  };

  public getMapInfo = async (mapId: number, options?: RequestOptions) => {
    let request: AxiosRequestConfig<FormData> = {
      ...this.defaultConfig,
      url: `/v1/maps/${mapId}`,
      method: "GET",
    };

    request = this.appendOptions(request, options);

    const response = await Axios.request<Map>(request);

    return response.data;
  };

  public getMapConfig = async (mapId: number, patchId: string, options?: RequestOptions) => {
    let request: AxiosRequestConfig<FormData> = {
      ...this.defaultConfig,
      url: `/v1/maps/${mapId}/defaultConfigs/${patchId}`,
      method: "GET",
      headers: {
        Accept: `application/jose`,
      },
    };

    request = this.appendOptions(request, options);

    const response = await Axios.request<string>(request);

    return response.data;
  };

  public getDefaultMapConfig = async (mapId: number, patchId: string, options?: RequestOptions) => {
    let request: AxiosRequestConfig<FormData> = {
      ...this.defaultConfig,
      url: `/v1/maps/${mapId}/defaultConfigs/${patchId}`,
      method: "GET",
      headers: {
        Accept: `application/json`,
      },
    };

    request = this.appendOptions(request, options);

    const response = await Axios.request<ConfigInfo>(request);

    return response.data;
  };

  public parseMapConfig = async (mapId: number, patchId: string, options?: RequestOptions) => {
    let request: AxiosRequestConfig<FormData> = {
      ...this.defaultConfig,
      url: "/v1/maps/" + mapId + "/parse",
      method: "POST",
    };

    request = this.appendOptions(request, options);

    const body = new FormData();

    body.set("mapId", String(mapId));
    body.set("version", patchId);

    request.data = body;

    const response = await Axios.request<ParseMap>(request);

    return response.data;
  };

  public searchMap = async (filters: SearchFilters, mapName?: string, page?: PageOptions, options?: RequestOptions) => {
    let request: AxiosRequestConfig<FormData> = {
      ...this.defaultConfig,
      url: "/v1/maps/search",
      method: "GET",
      params: {
        q: mapName ? mapName : undefined,
        ...filters,
        ...page
      },
    };

    request = this.appendOptions(request, options);

    const response = await Axios.request<Map[]>(request);

    return response.data;
  };

  public getVersions = async (options?: RequestOptions) => {
    let request: AxiosRequestConfig<FormData> = {
      ...this.defaultConfig,
      url: "/v1/configs/versions",
      method: "GET",
    };

    request = this.appendOptions(request, options);

    const response = await Axios.request<string[]>(request);

    return response.data;
  };

  private appendOptions(request: AxiosRequestConfig, options?: RequestOptions) {
    if (!options) return request;

    request.onUploadProgress = options.onUploadProgress;

    request.onDownloadProgress = options.onDownloadProgress;

    request.signal = options.signal;

    return request;
  }
}

interface UploadMapParametres {
  map: File;
  flags: Flags;
  additionalFlags: AdditionalFlags;
}

export type AdditionalFlags = {
  [key: string]: string | boolean | number | null;
};
