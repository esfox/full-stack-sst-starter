import { signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { ApiServiceResult } from '../types';

const baseUrl = environment.apiUrl;

export type RecordsResponse = { records: unknown[]; totalRecords: number };
export type RecordResponse = { record: unknown };

export class ApiService<DataType = unknown> {
  protected url = new URL('', baseUrl).toString();
  protected baseUrl = this.url;
  private dataMapping: { apiField: string; mappedField: keyof DataType }[] = [];

  records = signal<DataType[]>([]);
  record = signal<DataType | undefined>(undefined);
  totalRecords = signal(0);
  isLoading = signal(false);
  loadRecordsError = signal<Response | undefined>(undefined);
  loadRecordError = signal<Response | undefined>(undefined);

  recordToSave = signal<Partial<DataType> | undefined>(undefined);
  savedRecord = signal<DataType | undefined>(undefined);
  isSaving = signal(false);
  saveError = signal<Response | undefined>(undefined);

  recordToDelete = signal<DataType | undefined>(undefined);
  deletedRecord = signal<DataType | undefined>(undefined);
  isDeleting = signal(false);
  deleteError = signal<Response | undefined>(undefined);

  constructor(options?: {
    basePath?: string;
    dataMapping?: { apiField: string; mappedField: keyof DataType }[];
  }) {
    const { basePath, dataMapping } = options ?? {};

    let path = '/';
    if (basePath) {
      path = basePath.startsWith('/') ? basePath.substring(1) : basePath;
    }

    this.url = new URL(path, baseUrl).toString();
    this.dataMapping = dataMapping ?? [];
  }

  private async getOne(id: string) {
    const response = await this.fetch(`${this.url}/${id}`);
    let data;
    if (response.ok) {
      const { record }: RecordResponse = await response.json();
      data = this.mapFromApi(record);
      this.record.set(data);
    } else {
      this.loadRecordError.set(response);
    }

    return { response, data };
  }

  private async getList() {
    const response = await this.fetch(this.url);
    let records;
    let totalRecords;
    if (response.ok) {
      const responseJson: RecordsResponse = await response.json();
      records = responseJson.records.map(data => this.mapFromApi(data));
      totalRecords = responseJson.totalRecords;
      this.records.set(records);
      this.totalRecords.set(totalRecords);
    } else {
      this.loadRecordsError.set(response);
    }

    return { response, data: { records, totalRecords } };
  }

  protected async fetch(url: string, options?: RequestInit) {
    if (options?.method && ['POST', 'PATCH', 'PUT'].includes(options.method)) {
      options.headers = {
        'Content-Type': 'application/json',
        ...(options?.headers ?? {}),
      };
    }

    const inputUrl = new URL(url, baseUrl).toString();
    const response = await fetch(inputUrl, {
      credentials: 'include',
      ...options,
    });

    if (response.status === 401) {
      const siteUrl = new URL(window.location.href).origin;
      window.location.replace(new URL('/login', siteUrl));
    }

    return response;
  }

  protected async fetchWithBody(url: string, method: string, body: unknown) {
    return this.fetch(url, {
      method,
      body: JSON.stringify(body),
    });
  }

  async get(id?: string) {
    this.isLoading.set(true);

    let result: ApiServiceResult;
    if (id) {
      result = await this.getOne(id);
    } else {
      result = await this.getList();
    }

    this.isLoading.set(false);
    return { response: result.response, data: result.data };
  }

  async getById(id: string) {
    this.isLoading.set(true);
    const result = await this.getOne(id);
    this.isLoading.set(false);
    return result;
  }

  async create(data: Partial<DataType>) {
    const formData = this.mapToApi(data);

    this.isSaving.set(true);

    const response = await this.fetch(this.url, {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      return { response };
    } else {
      this.saveError.set(response);
    }

    const { record }: RecordResponse = await response.json();
    const createdRecord = record;

    const mappedData = this.mapFromApi(createdRecord);
    this.isSaving.set(false);
    this.savedRecord.set(mappedData);

    return { response, data: mappedData };
  }

  async edit(id: string, data: Partial<DataType>) {
    const url = `${this.url}/${id}`;
    const formData = this.mapToApi(data);

    this.isSaving.set(true);

    const response = await this.fetch(url, {
      method: 'PATCH',
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      return { response };
    } else {
      this.saveError.set(response);
    }

    const { record }: RecordResponse = await response.json();
    const editedRecord = record;

    const mappedData = this.mapFromApi(editedRecord);

    this.isSaving.set(false);
    this.savedRecord.set(mappedData);

    return { response, data: mappedData };
  }

  async delete(id: string) {
    const url = `${this.url}/${id}`;

    this.isDeleting.set(true);

    const response = await this.fetch(url, { method: 'DELETE' });
    if (!response.ok) {
      return { response };
    } else {
      this.deleteError.set(response);
    }

    const { record }: RecordResponse = await response.json();
    const mappedData = this.mapFromApi(record);

    this.isDeleting.set(false);
    this.deletedRecord.set(mappedData);

    return { response, data: mappedData };
  }

  mapFromApi(data: any) {
    const mappedData: any = {};
    for (const { apiField, mappedField } of this.dataMapping) {
      if (data[apiField]) {
        mappedData[mappedField] = data[apiField];
      }
    }

    return mappedData as DataType;
  }

  mapToApi(data: Partial<DataType>) {
    const mappedData: any = {};
    for (const { apiField, mappedField } of this.dataMapping) {
      if (data[mappedField]) {
        mappedData[apiField] = data[mappedField];
      }
    }

    return mappedData;
  }
}
