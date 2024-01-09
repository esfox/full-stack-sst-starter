import { signal } from '@angular/core';
import { ApiService } from './api.service';

export class ResourceService<DataType = unknown> {
  apiService!: ApiService<DataType>;

  records = signal<DataType[] | undefined>(undefined);
  totalRecordsCount = signal(0);
  savedRecord = signal<DataType | undefined>(undefined);
  deletedRecord = signal<DataType | undefined>(undefined);

  recordToEdit = signal<Partial<DataType> | undefined>(undefined);

  isLoadingRecords = signal(false);
  isLoadingRecordToEdit = signal(false);
  isSaving = signal(false);
  isDeleting = signal(false);

  loadRecordsError = signal<Response | undefined>(undefined);
  loadRecordToEditError = signal<Response | undefined>(undefined);
  saveRecordError = signal<Response | undefined>(undefined);
  deleteRecordError = signal<Response | undefined>(undefined);

  constructor(apiService: ApiService<DataType>) {
    this.apiService = apiService;
  }

  getRecordId(record: any) {
    return record.id;
  }

  async loadRecords() {
    this.loadRecordsError.set(undefined);

    this.isLoadingRecords.set(true);
    const { response, data } = await this.apiService.getList();
    this.isLoadingRecords.set(false);

    if (!response.ok) {
      this.loadRecordsError.set(response);
      return { error: response };
    }

    const records = (data as any).records;
    this.records.set(records);

    return { data };
  }

  async initEditRecordForm(recordId?: string) {
    this.loadRecordToEditError.set(undefined);

    if (!recordId) {
      this.recordToEdit.set({} as Partial<DataType>);
      return { error: new Error('No record ID') };
    }

    let recordToEdit!: DataType;
    if (this.records()?.length !== 0) {
      const record = this.records()?.find(record => this.getRecordId(record) === recordId);
      if (record) {
        recordToEdit = record;
      }
    }

    let response;
    if (!recordToEdit) {
      this.isLoadingRecordToEdit.set(true);
      const result = await this.apiService.getOne(recordId);
      this.isLoadingRecordToEdit.set(false);

      response = result.response;
      if (!response.ok) {
        this.loadRecordToEditError.set(response);
        return { error: response };
      }

      const data = result.data;
      if (data) {
        recordToEdit = data;
      }
    }

    this.recordToEdit.set(recordToEdit);

    return { data: recordToEdit };
  }

  async saveRecord(data: Partial<DataType>) {
    this.saveRecordError.set(undefined);

    let id;
    if (this.recordToEdit()) {
      id = this.getRecordId(this.recordToEdit());
    }

    this.isSaving.set(true);
    const { response, data: savedData } = await this.apiService.save(data, id);
    this.isSaving.set(false);

    if (!response.ok) {
      this.saveRecordError.set(response);
      return { error: response };
    }

    this.savedRecord.set(savedData);

    return { data: savedData };
  }

  async deleteRecord(record: DataType) {
    this.deleteRecordError.set(undefined);

    const id = this.getRecordId(record);
    if (!id) {
      return { error: new Error('No record ID') };
    }

    this.isDeleting.set(true);
    const { response, data } = await this.apiService.delete(id);
    this.isDeleting.set(false);

    if (!response.ok) {
      this.deleteRecordError.set(response);
      return { error: response };
    }

    this.deletedRecord.set(data);

    return { data };
  }
}
