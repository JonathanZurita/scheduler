import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {UsersComponent} from './users/users.component';

const routes: Routes = [
  {
    path: 'scheduler',
    component: UsersComponent
  }, {
    path: '',
    component: UsersComponent
  }, {
    path: '**',
    component: UsersComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
