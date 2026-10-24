import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MODELS, ModelKind } from './model-config';
import { PredictionResponse, PredictionService } from './prediction.service';
const LOCAL_HOSTS = ['localhost', '127.0.0.1'];

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})

export class App {
  private readonly api = inject(PredictionService);
  readonly models = MODELS;
  readonly isLocal = LOCAL_HOSTS.includes(window.location.hostname);
  readonly activeKind = signal<ModelKind>('batting');
  readonly active = computed(() => MODELS.find((m) => m.kind === this.activeKind())!);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly result = signal<PredictionResponse | null>(null);
  values: Record<string, number | null> = {};
  select(kind: ModelKind): void {
    this.activeKind.set(kind);
    this.values = {};
    this.error.set('');
    this.result.set(null);
  }
  fillExample(): void {
    this.values = { ...this.active().example };
    this.error.set('');
    this.result.set(null);
  }
  submit(): void {
    this.error.set('');
    this.result.set(null);
    if (!this.isLocal) {
      this.error.set(
        'This is a static GitHub Pages demo. Run Flask and Angular locally to get predictions.',
      );
      return;
    }
    const payload: Record<string, number> = {};
    for (const field of this.active().fields) {
      const value = this.values[field.key];
      if (value === null || value === undefined) {
        this.error.set(`Enter a value for ${field.label}.`);
        return;
      }
      if (value < field.min || value > field.max) {
        this.error.set(`${field.label} must be between ${field.min} and ${field.max}.`);
        return;
      }
      payload[field.key] = value;
    }
    this.loading.set(true);
    this.api.predict(this.activeKind(), payload).subscribe({
      next: (response) => {
        this.result.set(response);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error ?? `Request failed (${err.status}). Is Flask running?`);
        this.loading.set(false);
      },
    });
  }
}