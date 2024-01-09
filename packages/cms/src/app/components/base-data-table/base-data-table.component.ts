import { CommonModule } from '@angular/common';
import { Component, InjectionToken, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourceService } from '../../services/resource.service';
import { PromptDialogComponent } from '../prompt-dialog/prompt-dialog.component';

export const injectionTokens = {
  service: new InjectionToken<ResourceService<unknown>>('service'),
};

@Component({
  selector: 'app-base-data-table',
  standalone: true,
  imports: [CommonModule],
  template: '',
})
export class BaseDataTableComponent<DataType = unknown> implements OnInit {
  @ViewChild('deletePromptDialog') deletePromptDialog!: PromptDialogComponent;

  service = inject<ResourceService<DataType>>(injectionTokens.service);
  router = inject(Router);
  route = inject(ActivatedRoute);

  records = this.service.records;
  isLoading = this.service.isLoadingRecords;
  isSaving = this.service.isSaving;
  isDeleting = this.service.isDeleting;

  recordToDelete!: DataType;
  recordToDeleteLabel = () => (this.recordToDelete as any)?.id;

  loadRecordsError!: string;
  deleteRecordError!: string;

  async ngOnInit() {
    if (!this.records()) {
      const { error } = await this.service.loadRecords();
      if (error?.status === 403) {
        this.loadRecordsError = 'Not allowed to view';
      }
    }
  }

  edit(record: DataType) {
    const id = this.service.getRecordId(record);
    this.router.navigate(['edit', id], { relativeTo: this.route });
  }

  showDeletePrompt(record: DataType) {
    this.service.deleteRecordError.set(undefined);
    this.recordToDelete = record;
    this.deletePromptDialog.show();
  }

  async deleteRecord() {
    if (!this.recordToDelete) {
      return;
    }

    const { error } = await this.service.deleteRecord(this.recordToDelete);
    if (!error) {
      this.deletePromptDialog.hide();
      await this.service.loadRecords();
    }

    if (!error || !(error instanceof Response)) {
      return;
    }

    if (error.status === 403) {
      this.deleteRecordError = 'Not allowed to delete';
    }
  }
}
