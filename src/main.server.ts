// src/main.server.ts
import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config.server';

export default function bootstrap(context: BootstrapContext) {
  // ✅ pass the context directly (not { context })
  return bootstrapApplication(AppComponent, appConfig, context);
}
