import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ViewsComponent } from './views.component';
import { viewsRoutes as viewRoutes } from './views.routes';

@NgModule({
  declarations: [ViewsComponent],
  imports: [RouterModule.forChild(viewRoutes), CommonModule],
  exports: [RouterModule],
})
export class PagesModule {}
