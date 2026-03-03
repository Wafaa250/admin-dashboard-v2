import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { ModuleRegistry } from 'ag-charts-community';
import { AllCommunityModule } from 'ag-charts-community';

ModuleRegistry.registerModules([AllCommunityModule]);

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));