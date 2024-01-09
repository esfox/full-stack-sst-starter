import { environment } from '../../environments/environment';

const baseUrl = environment.apiUrl;

export type RecordsResponse = { records: unknown[]; totalRecords: number };
export type RecordResponse = { record: unknown };

export class ApiService<DataType = unknown> {
  url = new URL('', baseUrl).toString();
  baseUrl = this.url;
  dataMapping: { apiField: string; mappedField: keyof DataType }[] = [];

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

  async fetch(url: string, options?: RequestInit) {
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

  async fetchWithBody(url: string, method: string, body: unknown) {
    return this.fetch(url, {
      method,
      body: JSON.stringify(body),
    });
  }

  async getList() {
    const response = await this.fetch(this.url);
    if (!response.ok) {
      return { response };
    }

    const result: RecordsResponse = await response.json();
    const records = result.records.map(data => this.mapFromApi(data));
    const totalRecords = result.totalRecords;

    return { response, data: { records, totalRecords } };
  }

  async getOne(id: string) {
    const response = await this.fetch(`${this.url}/${id}`);
    if (!response.ok) {
      return { response };
    }

    const { record }: RecordResponse = await response.json();
    const data = this.mapFromApi(record);

    return { response, data };
  }

  async save(data: Partial<DataType>, id?: string) {
    let url = this.url;
    let method = 'POST';
    if (id) {
      url = `${this.url}/${id}`;
      method = 'PATCH';
    }

    const formData = this.mapToApi(data);
    const response = await this.fetch(url, {
      method,
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      return { response };
    }

    const { record }: RecordResponse = await response.json();
    const savedRecord = record;
    const mappedData = this.mapFromApi(savedRecord);

    return { response, data: mappedData };
  }

  async delete(id: string) {
    const response = await this.fetch(`${this.url}/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      return { response };
    }

    const { record }: RecordResponse = await response.json();
    const mappedData = this.mapFromApi(record);

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
