import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-base-form',
  standalone: true,
  imports: [CommonModule],
  template: '',
})
export class BaseFormComponent {
  @ViewChild('form') form!: NgForm;

  @Input('loading') isLoading = false;

  @Output('save') onSave = new EventEmitter();

  setValues<T extends { [key: string]: any } = any>(defaultData: Partial<T>) {
    const data: any = {};
    for (const field in this.form.controls) {
      const defaultDataValue = defaultData[field];
      data[field] = defaultDataValue ?? '';
    }

    this.form.reset();
    this.form.setValue(data);
  }

  reset() {
    this.form.reset();
  }

  save() {
    this.onSave.emit(this.form.value);
  }
}
