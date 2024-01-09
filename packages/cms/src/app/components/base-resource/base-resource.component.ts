// TODO: HANDLE ERRORS!
import { CommonModule } from '@angular/common';
import { Component, InjectionToken, ViewChild, computed, inject } from '@angular/core';
import { ApiService } from '../../services/_api.service';
import { ApiServiceResult } from '../../types';
import { BaseFormComponent } from '../base-form/base-form.component';
import { DialogComponent } from '../dialog/dialog.component';
import { PromptDialogComponent } from '../prompt-dialog/prompt-dialog.component';

export const injectionTokens = {
  service: new InjectionToken<ApiService<unknown>>('service'),
};

@Component({
  selector: 'app-base-resource',
  standalone: true,
  imports: [CommonModule],
  template: '',
})
export class BaseResourceComponent<DataType = any> {
  @ViewChild('recordFormDialog') recordFormDialog!: DialogComponent;
  @ViewChild('deletePromptDialog') deletePromptDialog!: PromptDialogComponent;
  @ViewChild('recordForm') recordForm!: BaseFormComponent;

  protected service = inject<ApiService<DataType>>(injectionTokens.service);

  records = this.service.records;
  isLoading = this.service.isLoading;
  loadRecordsError = computed(() => {
    const error = this.service.loadRecordsError();
    if (error?.status === 403) {
      return 'Not allowed to view';
    }

    return;
  });

  recordToSave = this.service.recordToSave;
  isSaving = this.service.isSaving;

  recordToDelete = this.service.recordToDelete;
  isDeleting = this.service.isDeleting;

  getRecordId(record: Partial<DataType>) {
    return (record as any).id;
  }

  async ngOnInit() {
    await this.service.get();
  }

  showRecordForm(record?: Partial<DataType>) {
    if (record) {
      this.recordForm.setValues(record);
    } else {
      this.recordForm.reset();
    }

    this.recordToSave.set(record);
    this.recordFormDialog.show();
  }

  showDeletePrompt(record: DataType) {
    this.recordToDelete.set(record);
    this.deletePromptDialog.show();
  }

  async saveRecord(data: Partial<DataType>) {
    const recordToSave = this.recordToSave();

    let result: ApiServiceResult<DataType>;
    if (recordToSave) {
      const id = this.getRecordId(recordToSave);
      result = await this.service.edit(id, data);
    } else {
      result = await this.service.create(data);
    }

    this.isSaving.set(false);

    const { response } = result;
    if (response.ok) {
      this.recordFormDialog.hide();
      this.recordForm.reset();
      this.service.get();
    }
  }

  async deleteRecord() {
    const record = this.recordToDelete();
    if (!record) {
      return;
    }

    const id = this.getRecordId(record);
    if (!id) {
      return;
    }

    this.isDeleting.set(false);

    const { response } = await this.service.delete(id);
    if (response.ok) {
      this.deletePromptDialog.hide();
      this.service.get();
    }
  }
}
